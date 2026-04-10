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
model = genai.GenerativeModel('models/gemini-2.5-flash') # 사용 중인 모델명 확인

def generate_unique_id(link: str):
    return hashlib.md5(link.encode()).hexdigest()[:20]

def fetch_koneps_opportunities(keyword=None):
    service_key = os.getenv("KONEPS_API_KEY")
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    now = datetime.now()
    start_date = (now - timedelta(days=30)).strftime('%Y%m%d0000') 
    end_date = now.strftime('%Y%m%d2359')
    
    print(f"\n--- 🏛️ 나라장터 API 호출 시작 ---")
    print(f"📅 조회 기간: {start_date} ~ {end_date}")
    print(f"🔍 필터 키워드: {keyword}")

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
            print(f"❌ API 연결 실패 (HTTP {response.status_code})")
            return []

        data = response.json()
        items_dict = data.get('response', {}).get('body', {}).get('items', [])
        
        # 데이터 구조 정규화
        if isinstance(items_dict, dict):
            items = items_dict.get('item', [])
        else:
            items = items_dict
        if isinstance(items, dict): items = [items]

        print(f"📦 API 서버로부터 총 {len(items)}건의 공고 수신")

        if not items:
            print("⚠️ 해당 기간에 올라온 공고가 하나도 없습니다.")
            return []

        raw_bids_list = []
        bids_to_analyze = []

        # ✅ 키워드 필터링
        search_keywords = keyword if isinstance(keyword, list) else (keyword.split(',') if keyword else [])

        for item in items:
            title = item.get('bidNtceNm', '')
            is_matched = not keyword or any(kw.strip() in title for kw in search_keywords)
            
            if is_matched:
                org = item.get('ntceInsttNm', '기관미상')
                budget = item.get('presmptPrce', "0")
                link = item.get('bidNtceDtlUrl', '')
                raw_bids_list.append({
                    "unique_id": generate_unique_id(link),
                    "source": "나라장터",
                    "title": title,
                    "link": link,
                    "pubDate": item.get('bidNtceDt', '')[:10],
                    "org": org,
                    "budget": budget
                })
                # Gemini가 어떤 공고인지 매칭할 수 있게 index 번호를 부여합니다.
                bids_to_analyze.append(f"공고ID {len(raw_bids_list)}: {title}\n발주기관: {org}")

        print(f"🎯 키워드 필터링 결과: {len(raw_bids_list)}건 생존")

        if not raw_bids_list:
            return []

        # --- 🤖 Gemini 분석 시작 ---
        print(f"🤖 Gemini 분석 중... ({len(raw_bids_list)}건 전달)")
        final_results = [] # 👈 결과를 담을 바구니 준비
        
        combined_text = "\n\n".join(bids_to_analyze[:15]) # 15건까지만 분석 (토큰 제한 방지)
        
        prompt = f"""
        너는 IT 영업 전략가야. 나라장터 공고를 분석해서 다우데이터의 솔루션(VDI, Cloud, Security)과 연관성이 높은 순서대로 추출해.
        반드시 JSON 배열 형식으로만 대답해.

        [
          {{
            "original_id": 숫자,
            "company": "기관명",
            "score": 0~100,
            "level": "High/Medium/Low",
            "keywords": ["키워드1", "키워드2"],
            "summary": "사업 기회 요약",
            "analysis": [기술점수, 시급성, 예산점수, 적합도]
          }}
        ]

        데이터:
        {combined_text}
        """

        ai_response = model.generate_content(prompt)
        
        # JSON 추출
        json_match = re.search(r'\[\s*{.*}\s*\]', ai_response.text, re.DOTALL)
        ai_data = json.loads(json_match.group(0)) if json_match else []

        # AI 결과와 원본 데이터를 합침
        for item in ai_data:
            idx = int(item.get("original_id", 0)) - 1
            if 0 <= idx < len(raw_bids_list):
                res = raw_bids_list[idx]
                final_results.append({
                    "id": res["unique_id"],
                    "source": res["source"],
                    "date": res["pubDate"],
                    "company": item.get("company", res["org"]),
                    "title": res["title"],
                    "score": item.get("score", 50),
                    "level": item.get("level", "Medium"),
                    "link": res["link"],
                    "keywords": item.get("keywords", []),
                    "summary": item.get("summary", ""),
                    "analysis": item.get("analysis", [50, 50, 50, 50])
                })

        print(f"✅ 최종 분석 완료: {len(final_results)}건 반환")
        return final_results

    except Exception as e:
        print(f"❌ 나라장터 로직 에러: {e}")
        return []