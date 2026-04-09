# 기본 설정
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# API 연결
from api.google_crawler import fetch_google_news
from api.naver_crawler import fetch_naver_news
from api.mail_sender import send_proposal_email
from api.koneps_crawler import fetch_koneps_bids

# 데이터베이스 연결
from schemas import EmailRequest
from database import engine
import models
from typing import Optional

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 테이블 생성 (필요 시)
models.Base.metadata.create_all(bind=engine)


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

# ✅ 구글 뉴스 전용 엔드포인트
@app.get("/api/news/google/{keyword}")
async def get_google_news(keyword: str):
    try:
        news = fetch_google_news(keyword)
        return {
            "provider": "google",
            "keyword": keyword,
            "count": len(news),
            "results": news
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/bids/koneps")
async def get_koneps_bids(keyword: Optional[str] = None): # ✅ 키워드 없이 호출 가능
    bids = fetch_koneps_bids(keyword)
    
    if isinstance(bids, dict) and "error" in bids:
        raise HTTPException(status_code=500, detail=bids["error"])
        
    return {
        "count": len(bids),
        "keyword": keyword or "전체보기",
        "results": bids
    }

# 메일 전송 전용 엔드포인트
@app.post("/api/send-email")
async def email_endpoint(request: EmailRequest):
    # request 객체에서 데이터를 꺼내 함수 호출
    result = send_proposal_email(
        receiver_email=request.receiver_email,
        subject=request.subject,
        content=request.content
    )
    
    if result["status"] == "success":
        return result
    else:
        raise HTTPException(status_code=500, detail=result["message"])


