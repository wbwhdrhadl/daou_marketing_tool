import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_proposal_email(receiver_email: str, subject: str, content: str, mail_id: str = "unknown"):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")

    # ✅ ngrok 주소가 최신인지 꼭 확인!
    ngrok_url = "https://flavorful-appliance-speller.ngrok-free.dev"

    if not sender_email or not sender_password:
        return {"status": "error", "message": "메일 설정(ENV)이 누락되었습니다."}

    try:
        # 1. 메일 객체 생성 (이 부분이 빠지면 에러가 납니다)
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject

        # 2. HTML 본문 구성
        html_content = f"""
        <html>
            <body style="margin:0; padding:20px; font-family: 'Malgun Gothic', sans-serif;">
                <div style="max-width: 600px; background: white;">
                    <img src="{ngrok_url}/api/v1/track/open/{mail_id}" width="150" alt="DaouData Logo" style="display:block; margin-bottom:20px;">
                    
                    <div style="line-height: 1.6; color: #333; font-size: 15px;">
                        {content.replace('\n', '<br>')}
                    </div>

                    <div style="margin-top: 30px; text-align: center;">
                        <a href="{ngrok_url}/api/v1/track/click/{mail_id}" 
                           style="background-color: #0095D8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           제안 솔루션 상세 보기
                        </a>
                    </div>

                    <hr style="margin-top:40px; border:0; border-top:1px solid #eee;">
                    <p style="font-size: 12px; color: #888;">본 메일은 다우데이타 가상화 사업팀에서 발송되었습니다.</p>
                </div>
            </body>
        </html>
        """
        
        # 3. HTML 메세지 첨부
        msg.attach(MIMEText(html_content, 'html'))

        # 4. 실제 전송
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)

        print(f"✅ 메일 전송 성공 (ID: {mail_id}): {receiver_email}")
        return {"status": "success", "message": "성공"}
    except Exception as e:
        print(f"❌ 메일 발송 에러: {str(e)}")
        return {"status": "error", "message": str(e)}