# api/google_crawler.py
from gnews import GNews

def fetch_google_news(keyword):
    # 한국어(ko), 지역은 한국(KR) 설정 (해외 뉴스가 필요하면 'en', 'US'로 변경 가능)
    google_news = GNews(language='ko', country='KR', period='7d', max_results=10)
    
    # 뉴스 검색
    news_items = google_news.get_news(keyword)
    
    results = []
    for item in news_items:
        results.append({
            "title": item.get('title'),
            "link": item.get('url'),
            "description": item.get('description'),
            "published_date": item.get('published date'),
            "source": item.get('publisher').get('title')
        })
    return results