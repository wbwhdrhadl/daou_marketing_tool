# 기본 설정
from fastapi import FastAPI, Depends, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
# API 연결
from api.google_crawler import fetch_google_news
# 함수 이름을 새 이름으로 바꿔서 가져와야 합니다.
from api.naver_crawler import fetch_business_opportunities
from api.mail_sender import send_proposal_email
from api.koneps_crawler import fetch_koneps_opportunities
from api.generate_email import compose_proposal_email

# 데이터베이스 연결
from schemas import EmailRequest, ProposalRequest
from database import engine, SessionLocal, get_db
import models
from typing import Optional
from datetime import datetime
import json
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
app = FastAPI()


NGROK_HEADERS = {"ngrok-skip-browser-warning": "69420"}


# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



models.Base.metadata.create_all(bind=engine)



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
async def generate_proposal(req: ProposalRequest, db: Session = Depends(get_db)):
    try:
        # 1. AI 메일 내용 생성
        email_content = compose_proposal_email(req.dict())
        
        # 2. DB 저장 (먼저 저장해서 ID를 생성합니다)
        new_mail = models.SentMail(
            recipient=req.email,
            company=req.partner_name,
            subject=f"[{req.partner_name}] 솔루션 제안서",
            content=email_content,
            sentDate=datetime.now().strftime('%Y-%m-%d'),
            status="Unread"
        )
        db.add(new_mail)
        db.flush() # ✅ commit 전 ID를 미리 할당받기 위해 flush 사용
        
        # 3. 실제 메일 발송 (할당받은 new_mail.id를 넘겨줍니다)
        email_result = send_proposal_email(
            receiver_email=req.email,
            subject=f"[{req.partner_name}] 솔루션 제안서",
            content=email_content,
            mail_id=str(new_mail.id) # ✅ DB ID를 추적 ID로 사용!
        )

        db.commit() # 최종 저장

        return {
            "content": email_content,
            "email_status": email_result["status"]
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 2. 메일 리스트 조회
@app.get("/api/sent-mails")
async def get_sent_mails(db: Session = Depends(get_db)):
    # ✅ 여기서 SentMail 앞에 models. 를 꼭 붙여주세요!
    mails = db.query(models.SentMail).order_by(models.SentMail.id.desc()).all()
    return mails


@app.get("/api/search-all/{keyword}")
async def get_combined_opportunities(keyword: str, db: Session = Depends(get_db)):
    try:
        news_data = fetch_business_opportunities(keyword)
        bid_data = fetch_koneps_opportunities(keyword)
        final_results = news_data + bid_data 

        new_items_count = 0
        for item in final_results:
            existing_item = db.query(models.Opportunity).filter(models.Opportunity.id == item["id"]).first()
            
            if not existing_item:
                # 💡 수정 포인트: fetch_... 함수는 'analysis' 키에 점수를 담아줍니다.
                # item.get("scores")가 아니라 item.get("analysis")를 써야 합니다.
                scores_dict = item.get("analysis", {}) 
                
                # 만약 fetch_... 함수가 리스트가 아닌 딕셔너리를 주기로 약속했다면 아래와 같이 접근
                analysis_data = [
                    scores_dict.get("security", 50),
                    scores_dict.get("availability", 50),
                    scores_dict.get("scalability", 50),
                    scores_dict.get("profitability", 50)
                ]

                db_item = models.Opportunity(
                    id=item["id"],
                    source=item.get("source"),
                    date=item.get("date"),
                    company=item.get("company"),
                    title=item.get("title"),
                    summary=item.get("summary"),
                    keywords=item.get("keywords"),
                    suggested_solution=item.get("suggestedSolution"),
                    partners=item.get("partners"),
                    # score도 Gemini는 'scores' 안에 포함시켰을 수 있으니 체크
                    score=item.get("score") if item.get("score") else 80, 
                    level=item.get("level") if item.get("level") else "Mid",
                    analysis=analysis_data,  # ✅ 드디어 데이터가 들어갑니다!
                    link=item.get("link")
                )
                db.add(db_item)
                new_items_count += 1
        
        # 3. 변경사항 저장
        db.commit()

        return {
            "keyword": keyword,
            "total_fetched": len(final_results),
            "new_added": new_items_count,  # 새로 추가된 개수 확인용
            "results": final_results
        }

    except Exception as e:
        db.rollback() 
        print(f"🔥 DB 작업 중 에러 발생: {e}")
        raise HTTPException(status_code=500, detail=f"데이터 저장 중 오류: {str(e)}")


@app.get("/api/opportunities")
def get_opportunities(db: Session = Depends(get_db)):
    results = db.query(models.Opportunity).order_by(models.Opportunity.date.desc()).all()
    
    formatted_results = []
    for item in results:
        # 1. DB의 analysis(배열/문자열)를 파싱하여 객체로 변환
        raw_analysis = item.analysis
        
        # 문자열로 들어온 경우 JSON 파싱
        if isinstance(raw_analysis, str):
            try:
                raw_analysis = json.loads(raw_analysis)
            except:
                raw_analysis = []

            # 2. 배열 데이터를 프론트가 쓰기 편한 객체 형태로 정형화
        if isinstance(raw_analysis, list) and len(raw_analysis) >= 4:
            analysis_obj = {
                "security": raw_analysis[0],      # 보안성
                "availability": raw_analysis[1],  # 가용성
                "scalability": raw_analysis[2],   # 확장성 (DetailModal용)
                "profitability": raw_analysis[3], # 수익성 (ReportCard용)
            }
        else:
            analysis_obj = {"security": 50, "availability": 50, "scalability": 50, "profitability": 50}
        formatted_results.append({
            "id": item.id,
            "date": item.date.strftime('%Y-%m-%d') if item.date else None,
            "source": item.source,
            "company": item.company,
            "title": item.title,
            "summary": item.summary,
            "keywords": item.keywords,
            "score": item.score,    # 전체 매칭 점수
            "level": item.level,
            "analysis": analysis_obj, # ⭐ 'scores' 대신 'analysis'로 통일
            "link": item.link
        })
    
    return {"results": formatted_results}



@app.delete("/api/sent-mails/{mail_id}")
async def delete_sent_mail(mail_id: int, db: Session = Depends(get_db)):
    mail = db.query(models.SentMail).filter(models.SentMail.id == mail_id).first()
    if not mail:
        raise HTTPException(status_code=404, detail="Mail not found")
    db.delete(mail)
    db.commit()
    return {"message": "Success"}




@app.get("/api/v1/track/click/{mail_id}")
async def track_click(mail_id: str):
    print(f"\n" + "🚀"*15)
    print(f"🚀 [클릭 포착] 사용자가 제안서 버튼을 눌렀습니다!")
    print(f"📩 메일 ID: {mail_id}")
    print(f"⏰ 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🚀"*15 + "\n")
    
    # 클릭하면 실제 다우데이타 홈페이지나 제안서 페이지로 보내줍니다.
    return RedirectResponse(url="https://www.daoudata.co.kr", headers=NGROK_HEADERS)

class DurationData(BaseModel):
    mail_id: str
    duration_seconds: int

# 1. 체류 시간 저장 API
@app.post("/api/v1/track/duration")
async def track_duration(data: DurationData):
    print(f"\n⏳ [체류 시간] 메일 ID {data.mail_id}번 고객이")
    print(f"⏰ 약 {data.duration_seconds}초 동안 제안서를 정독했습니다.")
    return {"status": "success"}

# 2. 공유/접속 정보 확인 API (페이지 진입 시 호출)
@app.get("/api/v1/track/access/{mail_id}")
async def track_access(mail_id: str, request: Request):
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent")
    
    print(f"\n🌐 [접속 감지] 메일 ID: {mail_id}")
    print(f"📍 IP 주소: {client_ip}")
    print(f"📱 기기 정보: {user_agent[:50]}...")
    
    # 💡 꿀팁: 여기서 이전 IP와 다르면 "공유됨"이라고 판단하는 로직을 넣으면 됩니다.
    return {"status": "success", "ip": client_ip}


@app.get("/api/v1/track/open/{mail_id}")
async def track_open(mail_id: str):
    # 1. 터미널에 로그 남기기
    print(f"📧 [메일 오픈 로그] 고객 ID: {mail_id}님이 방금 메일을 열었습니다!")

    # 2. 실제 로고 이미지 파일 경로 (프로젝트 폴더 기준)
    # 이미지 파일이 backend/images/daou_logo.png 에 있다고 가정합니다.
    image_path = os.path.join("images", "daou_logo.jpg") 

    # 3. 이미지 파일이 있으면 보내주고, 없으면 기존처럼 1픽셀 투명 이미지를 보냅니다.
    if os.path.exists(image_path):
        return FileResponse(image_path)
    else:
        # 파일이 없을 경우를 대비한 최소한의 방어 코드
        pixel_data = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        return Response(content=pixel_data, media_type="image/gif")


@app.get("/api/v1/track/click/{mail_id}/{target}")
async def track_click(mail_id: str, target: str):
    # 1. 제품별 맞춤 로그 메시지 설정
    product_names = {
        "citrix": "Citrix (가상화/VDI)",
        "netscaler": "NetScaler (ADC/L4 스위치)",
        "nubo": "Nubo (VMI/모바일 가상화)",
        "daoudata": "다우데이타 공식 홈페이지"
    }
    
    friendly_name = product_names.get(target.lower(), target)

    # 2. 터미널 로그 출력
    print(f"\n📢 [클릭 이벤트 발생]")
    print(f"👤 고객 ID : {mail_id}")
    print(f"🎯 클릭 대상 : {friendly_name}")

    # 3. 이동 경로 설정
    if target == "daoudata":
        redirect_url = "https://www.daoudata.co.kr/"
    else:
        # 리액트 페이지로 제품 정보를 넘겨줍니다.
        redirect_url = f"http://localhost:5173/view/{mail_id}?product={target}"
    
    return RedirectResponse(url=redirect_url)