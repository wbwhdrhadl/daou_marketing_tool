# 기본 설정
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# API 연결
from api.google_crawler import fetch_google_news
# 함수 이름을 새 이름으로 바꿔서 가져와야 합니다.
from api.naver_crawler import fetch_business_opportunities
from api.mail_sender import send_proposal_email
from api.koneps_crawler import fetch_koneps_bids
from api.generate_email import compose_proposal_email

# 데이터베이스 연결
from schemas import EmailRequest, ProposalRequest
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
    # 1. 고도화된 영업 기회 분석 함수 호출
    # (내부에서 네이버 검색 -> 필터링 -> Gemini 분석 -> 데이터 구조화가 진행됩니다)
    news_opportunities = fetch_business_opportunities(keyword)
    
    return {
        "provider": "naver_gemini_ai",
        "keyword": keyword,
        "count": len(news_opportunities),
        "results": news_opportunities  # 이제 분석된 JSON 리스트가 들어갑니다.
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


@app.post("/api/generate-proposal")
async def generate_proposal(req: ProposalRequest):
    try:
        # ✅ 서비스 로직 함수 호출
        email_content = compose_proposal_email(req.dict())
        return {"content": email_content}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="제안서 생성 중 서버 오류 발생")