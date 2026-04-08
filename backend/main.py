from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# ✅ 파일 이름 변경에 따른 import 수정
from api.naver_crawler import fetch_naver_news

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "DaouData Marketing Tool Backend is running"}

# ✅ 네이버 뉴스 전용 엔드포인트
@app.get("/api/news/naver/{keyword}")
async def get_naver_news(keyword: str):
    news = fetch_naver_news(keyword)
    return {
        "provider": "naver",
        "keyword": keyword,
        "count": len(news),
        "results": news
    }