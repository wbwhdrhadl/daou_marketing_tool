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
from api.gemini_analysis import analyze_customer_interest 
# 데이터베이스 연결
from schemas import EmailRequest, ProposalRequest
from database import engine, SessionLocal, get_db
import models
from typing import Optional
from datetime import datetime
import json, os
from fastapi.responses import RedirectResponse, FileResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
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
        
        # 2. DB 저장
        new_mail = models.SentMail(
            recipient=req.email,
            company=req.partner_name,
            subject=f"[{req.partner_name}] 솔루션 제안서",
            content=email_content,
            sentDate=datetime.now().strftime('%Y-%m-%d'),
            status="분석 전",
            interestScore=0,
            citrix_click=0,
            netscaler_click=0,
            nubo_click=0,
            daou_click=0
        )
        db.add(new_mail)
        db.flush() 
        
        # 3. 실제 메일 발송 (수정 포인트: company 추가!)
        email_result = send_proposal_email(
            receiver_email=req.email,
            subject=f"[{req.partner_name}] 솔루션 제안서",
            content=email_content,
            mail_id=str(new_mail.id),
            company=req.partner_name  # 👈 이 부분을 추가하세요!
        )

        db.commit()

        return {
            "content": email_content,
            "email_status": email_result["status"]
        }
    except Exception as e:
        db.rollback()
        print(f"❌ 제안서 생성 에러: {e}") 
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



@app.get("/api/v1/track/click/{mail_id}/{product}")
async def track_click(mail_id: int, product: str, db: Session = Depends(get_db)):
    # 1. DB 클릭 수 업데이트 로직
    mail = db.query(models.SentMail).filter(models.SentMail.id == mail_id).first()
    
    if mail:
        if product == "citrix": 
            mail.citrix_click += 1
        elif product == "netscaler": 
            mail.netscaler_click += 1
        elif product == "nubo": 
            mail.nubo_click += 1
        elif product == "namutech": 
            mail.namutech_click += 1
        elif product == "daoudata": 
            mail.daou_click += 1
        
        # 2. Gemini 분석 호출 (요청하신 로직 추가)
        click_data = {
            "citrix": mail.citrix_click,
            "netscaler": mail.netscaler_click,
            "nubo": mail.nubo_click,
            "daou": mail.daou_click
        }
        
        try:
            # analyze_customer_interest 함수가 정의되어 있어야 합니다.
            score, summary = analyze_customer_interest(click_data)
            mail.interestScore = score
            mail.status = summary
        except Exception as e:
            print(f"⚠️ AI 분석 실패: {e}")

        db.commit()

    # 3. 이동할 경로 설정
    # 제품 PDF 매핑
    pdf_map = {
        "citrix": "static/pdfs/citrix_vdi.pdf",
        "netscaler": "static/pdfs/netscaler_adc.pdf",
        "nubo": "static/pdfs/nubo_vmi.pdf"
    }

    # 나무기술 클릭 시 공식 홈페이지로 리다이렉트
    if product == "namutech":
        return RedirectResponse(url="https://www.namutech.co.kr/")
    
    # 다우데이타 클릭 시 공식 홈페이지로 리다이렉트
    if product == "daoudata":
        return RedirectResponse(url="https://www.daoudata.co.kr/")

    # 제품 클릭 시 PDF 파일 반환
    if product in pdf_map:
        file_path = pdf_map[product]
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type='application/pdf')

    # 그 외 기본값은 다우데이타 홈페이지
    return RedirectResponse(url="https://www.daoudata.co.kr/")