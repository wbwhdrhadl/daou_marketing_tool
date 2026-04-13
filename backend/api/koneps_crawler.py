import os
import requests
import google.generativeai as genai
import json
import re
import hashlib
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

# Gemini 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.5-flash') # 안정적인 모델명 사용 권장

def generate_unique_id(link: str):
    return hashlib.md5(link.encode()).hexdigest()[:20]

def fetch_koneps_opportunities(keyword=None):
    service_key = os.getenv("KONEPS_API_KEY")
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    now = datetime.now()
    start_date = (now - timedelta(days=30)).strftime('%Y%m%d0000') 
    end_date = now.strftime('%Y%m%d2359')
    
    print(f"\n--- 🏛️ 나라장터 API 호출 시작 ---")
    
    params = {
        'serviceKey': service_key,
        'numOfRows': '100', 
        'pageNo': '1',
        'inqryDiv': '1',
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'type': 'json'
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        if response.status_code != 200:
            return []

        data = response.json()
        # 공공데이터 포털 특유의 복잡한 구조 안전하게 접근
        items_root = data.get('response', {}).get('body', {}).get('items', [])
        
        # 데이터 정규화
        if isinstance(items_root, dict):
            items = items_root.get('item', [])
        else:
            items = items_root
        
        if isinstance(items, dict): # 1건일 때 딕셔너리로 오는 경우 방어
            items = [items]
        
        if not items:
            return []

        raw_bids_list = []
        bids_to_analyze = []
        search_keywords = keyword if isinstance(keyword, list) else (keyword.split(',') if keyword else [])

        for item in items:
            title = item.get('bidNtceNm', '')
            # 키워드가 있으면 필터링, 없으면 전체 수집
            is_matched = not search_keywords or any(kw.strip() in title for kw in search_keywords)
            
            if is_matched:
                org = item.get('ntceInsttNm', '기관미상')
                link = item.get('bidNtceDtlUrl', '')
                raw_bids_list.append({
                    "unique_id": generate_unique_id(link),
                    "source": "나라장터",
                    "title": title,
                    "link": link,
                    "pubDate": item.get('bidNtceDt', '')[:10],
                    "org": org
                })
                bids_to_analyze.append(f"공고ID {len(raw_bids_list)}: {title}\n발주기관: {org}")

        if not raw_bids_list:
            return []

        # ✅ 여기서부터 다시 try 블록을 시작하거나, 
        # ✅ 기존 try 블록이 유지되도록 들여쓰기를 맞춰야 합니다.
        try:
            # --- 🤖 Gemini 분석 시작 ---
            print(f"🤖 나라장터 Gemini 분석 중... ({len(raw_bids_list)}건)")
            combined_text = "\n\n".join(bids_to_analyze[:15]) 

            prompt = f"""
            너는 다우데이터의 IT 영업 전략가야. 나라장터 공고를 분석해서 영업 기회를 추출해.
            반드시 아래의 JSON 배열 형식으로만 응답해.

            [
              {{
                "original_id": 숫자,
                "company": "발주기관명",
                "title": "공고 요약 소제목",
                "summary": "입찰 기회 및 기술 요구사항 요약 (2문장)",
                "keywords": ["키워드1", "2"],
                "suggestedSolution": "Nutanix/Citrix/Dell/VMware 중 추천",
                "partners": [
                  {{ "name": "가상 파트너사", "deals": 5, "color": "#006FFF", "contacts": [] }}
                ],
                "score": 0~100,
                "level": "High/Medium/Low",
                "scores": {{
                  "security": 점수,
                  "availability": 점수,
                  "scalability": 점수,
                  "profitability": 점수
                }}
              }}
            ]

            데이터:
            {combined_text}
            """

            ai_response = model.generate_content(prompt)
            ai_text = ai_response.text
            
            # JSON 추출
            ai_text_cleaned = re.sub(r'```json|```', '', ai_text).strip()
            json_match = re.search(r'\[\s*{.*}\s*\]', ai_text_cleaned, re.DOTALL)
            ai_data = json.loads(json_match.group(0)) if json_match else json.loads(ai_text_cleaned)

            final_results = []
            for item in ai_data:
                idx = int(item.get("original_id", 0)) - 1
                if 0 <= idx < len(raw_bids_list):
                    res = raw_bids_list[idx]
                    final_results.append({
                        "id": res["unique_id"],
                        "source": "나라장터",
                        "date": res["pubDate"],
                        "company": item.get("company", res["org"]),
                        "title": item.get("title", res["title"]),
                        "summary": item.get("summary", ""),
                        "keywords": item.get("keywords", []),
                        "suggestedSolution": item.get("suggestedSolution", "TBD"),
                        "partners": item.get("partners", []),
                        "score": item.get("score", 50),
                        "level": item.get("level", "Medium"),
                        "link": res["link"],
                        "scores": item.get("scores", {
                            "security": 50, "availability": 50, "scalability": 50, "profitability": 50
                        })
                    })
            return final_results

        except Exception as e:
            print(f"❌ 나라장터 AI 분석 에러: {e}")
            return []

    except Exception as e:
        print(f"❌ 나라장터 API 호출 단계 에러: {e}")
        return []