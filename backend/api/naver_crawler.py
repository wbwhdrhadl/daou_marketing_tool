import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Gemini 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.5-flash-lite')

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def fetch_naver_news(keyword: str):
    """네이버 뉴스를 가져오고, Gemini로 한꺼번에 요약합니다."""
    url = f"https://openapi.naver.com/v1/search/news.json?query={keyword}&display=5&sort=sim"
    
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200: return []

        data = response.json()
        items = data.get('items', [])
        
        if not items: return []

        news_results = []
        descriptions_to_summarize = []

        # 1. 먼저 데이터를 정리하고 요약할 텍스트들을 리스트에 모읍니다.
        for i, item in enumerate(items):
            clean_title = item['title'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
            raw_desc = item['description'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
            
            news_results.append({
                "title": clean_title,
                "original_description": raw_desc,
                "ai_summary": raw_desc, # 요약 실패를 대비해 기본값 설정
                "link": item['link'],
                "press": "네이버뉴스",
                "pubDate": item['pubDate'] 
            })
            # AI에게 보낼 텍스트 묶음 만들기
            descriptions_to_summarize.append(f"기사{i+1}: {raw_desc}")

        # 2. ✅ Gemini에게 딱 한 번만 물어봅니다 (Batch Summary)
        if news_results:
            combined_text = "\n\n".join(descriptions_to_summarize)
            prompt = f"""다음 5개 뉴스 기사 내용을 각각 핵심만 한 문장으로 요약해줘.
            반드시 아래의 출력 형식을 지켜줘.
            
            출력 형식:
            기사1: 요약내용
            기사2: 요약내용
            
            요약할 내용:
            {combined_text}"""

            try:
                ai_response = model.generate_content(prompt)
                # 줄바꿈으로 결과 분리
                lines = ai_response.text.strip().split('\n')
                
                # 결과를 각 뉴스 항목에 매칭
                for line in lines:
                    if ":" in line:
                        # '기사1: 요약내용' 형태에서 요약내용만 추출
                        parts = line.split(":", 1)
                        idx_str = parts[0].replace("기사", "").strip()
                        if idx_str.isdigit():
                            idx = int(idx_str) - 1
                            if 0 <= idx < len(news_results):
                                news_results[idx]['ai_summary'] = parts[1].strip()
            
            except Exception as e:
                print(f"⚠️ Gemini 일괄 요약 에러: {e}")
                # 에러가 나면 위에서 설정한 기본값(raw_desc)이 그대로 반환됩니다.

        return news_results

    except Exception as e:
        print(f"❌ 연결 에러: {e}")
        return []