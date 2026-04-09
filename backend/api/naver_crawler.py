import os
import requests
import google.generativeai as genai
import json
import re
import hashlib
from dotenv import load_dotenv
from datetime import datetime
from typing import List

load_dotenv()

# Gemini 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.5-flash-lite') 

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def generate_unique_id(link: str):
    return hashlib.md5(link.encode()).hexdigest()[:20]

def fetch_business_opportunities(keywords):
    # 1. 키워드 전처리 (문자열로 들어와도 리스트로 변환)
    if isinstance(keywords, str):
        keywords = [k.strip() for k in keywords.replace(",", " ").split() if k.strip()]
    
    if not keywords:
        print("❌ 전달된 키워드가 없습니다.")
        return []

    raw_news_list = []
    descriptions_to_summarize = []
    seen_links = set()
    processed_titles = [] # 제목 유사도 체크용 리스트
    
    # 제외 키워드 (광고, 증시 노이즈 제거)
    exclude_words = ["주가", "상승세", "하락세", "특징주", "증시", "코스피", "코스닥", "매수", "개미", "외인", "종목", "시황"]

    print(f"--- 🔍 네이버 검색 시작 (키워드: {keywords}) ---")
    
    for kw in keywords:
        # 단어가 너무 짧으면 스킵 (단, IT/AI 같은 핵심 약어는 허용)
        if len(kw) < 2 and kw.upper() not in ["IT", "AI"]:
            continue

        business_signals = "수주|계약|도입|구축|협약"
        query = f"{kw} ({business_signals})"
        
        url = f"https://openapi.naver.com/v1/search/news.json?query={query}&display=20&sort=sim"
        headers = {
            "X-Naver-Client-Id": CLIENT_ID,
            "X-Naver-Client-Secret": CLIENT_SECRET
        }
        
        try:
            # ✅ 여기서 response를 정의합니다.
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"⚠️ 네이버 API 호출 실패: {response.status_code}")
                continue

            items = response.json().get('items', [])
            print(f"   > [{kw}] 검색 결과: {len(items)}개 발견")

            for item in items:
                link = item['link']
                # 1단계: 링크 중복 체크
                if link in seen_links: continue
                
                # HTML 태그 제거 및 텍스트 정리
                title = item['title'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
                desc = item['description'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
                
                # 2단계: 제목 유사도 검사 (제목에서 한글/영어/숫자만 남기고 앞 15자 비교)
                normalized_title = re.sub(r'[^가-힣a-zA-Z0-9]', '', title)
                
                is_duplicate = False
                for prev_title in processed_titles:
                    # 제목의 뼈대가 거의 일치하면 중복 기사로 간주
                    if normalized_title[:15] == prev_title[:15]:
                        is_duplicate = True
                        break
                
                if is_duplicate: continue
                
                # 3단계: 제외 단어 필터링
                if any(word in title for word in exclude_words): continue

                raw_news_list.append({
                    "unique_id": generate_unique_id(link),
                    "source": "Naver News",
                    "title": title,
                    "link": link,
                    "pubDate": item['pubDate']
                })
                
                # Gemini 전달용 데이터 구성 (ID 포함)
                descriptions_to_summarize.append(f"기사ID {len(raw_news_list)}: {title}\n본문: {desc}")
                
                seen_links.add(link)
                processed_titles.append(normalized_title)
                
        except Exception as e:
            print(f"⚠️ 검색 에러 ({kw}): {e}")

    if not raw_news_list:
        print("❌ 분석할 기사가 없습니다.")
        return []

    # --- 🤖 Gemini 분석 시작 ---
    print(f"--- 🤖 Gemini 분석 시작 ({len(raw_news_list)}개 기사 전달) ---")

    combined_text = "\n\n".join(descriptions_to_summarize)
    
    prompt = f"""
    너는 다우데이터의 IT 솔루션 B2B 영업 전략가야. 
    아래 뉴스 리스트를 분석해서 가상화, 클라우드 등 IT 솔루션 도입 기회가 있는 항목만 추출해.
    비슷한 내용의 기사가 여러 개 있다면 가장 정보가 풍부한 것 하나만 선택해.

    반드시 아래의 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.

    [응답 형식]
    [
      {{
        "original_id": 기사ID번호(숫자),
        "company": "기업명",
        "score": 0~100,
        "level": "High/Medium/Low",
        "keywords": ["키워드1", "2"],
        "summary": "영업 기회 요약(2문장)",
        "analysis": [기술타당성, 긴급도, 예산규모, 경쟁강도]
      }}
    ]

    분석 데이터:
    {combined_text}
    """

    try:
        ai_response = model.generate_content(prompt)
        ai_text = ai_response.text
        
        # JSON 블록 추출
        json_match = re.search(r'\[\s*{.*}\s*\]', ai_text, re.DOTALL)
        if json_match:
            ai_data = json.loads(json_match.group(0))
        else:
            ai_data = json.loads(ai_text.strip().replace('```json', '').replace('```', ''))

        final_results = []
        for item in ai_data:
            try:
                idx = int(item.get("original_id", 0)) - 1
                if idx < 0 or idx >= len(raw_news_list): continue
                
                res = raw_news_list[idx]
                
                # 날짜 포맷 정리
                try:
                    dt = datetime.strptime(res['pubDate'], '%a, %d %b %Y %H:%M:%S +0900')
                    formatted_date = dt.strftime('%Y-%m-%d')
                except:
                    formatted_date = datetime.now().strftime('%Y-%m-%d')

                final_results.append({
                    "id": res["unique_id"],
                    "source": res["source"],
                    "date": formatted_date,
                    "company": item.get("company", "알 수 없음"),
                    "title": res["title"],
                    "score": item.get("score", 50),
                    "level": item.get("level", "Medium"),
                    "link": res["link"],
                    "keywords": item.get("keywords", []),
                    "summary": item.get("summary", ""),
                    "analysis": item.get("analysis", [50, 50, 50, 50])
                })
            except Exception as e:
                continue

        print(f"✅ 최종 결과: {len(final_results)}건 추출 성공")
        return final_results

    except Exception as e:
        print(f"❌ Gemini 에러: {e}")
        return []

if __name__ == "__main__":
    test_keywords = ["가상화", "클라우드"]
    results = fetch_business_opportunities(test_keywords)
    print(json.dumps(results, indent=2, ensure_ascii=False))