from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.google_crawler import fetch_google_news
from schemas import EmailRequest
from api.naver_crawler import fetch_naver_news
from api.mail_sender import send_proposal_email
from database import engine
import models

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 리액트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 테이블 생성 (필요 시)
models.Base.metadata.create_all(bind=engine)


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


