from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import EmailRequest
from api.naver_crawler import fetch_naver_news
from api.mail_sender import send_proposal_email

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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