import os
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def fetch_naver_news(keyword: str):
    # 네이버 공식 뉴스 검색 API 주소
    url = f"https://openapi.naver.com/v1/search/news.json?query={keyword}&display=5&sort=sim"
    
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            
            news_results = []
            for item in items:
                # 제목에서 HTML 태그 및 특수문자 제거
                clean_title = item['title'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
                
                # ✅ [추가] 요약 내용(description)에서 HTML 태그 및 특수문자 제거
                clean_description = item['description'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
                
                news_results.append({
                    "title": clean_title,
                    "description": clean_description,  # 👈 결과에 추가
                    "link": item['link'],
                    "press": "네이버뉴스",
                    "pubDate": item['pubDate'] 
                })
            return news_results
        else:
            print(f"❌ API 에러 발생: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ 연결 에러: {e}")
        return []