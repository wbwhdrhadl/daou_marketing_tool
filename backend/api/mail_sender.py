import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_proposal_email(receiver_email: str, subject: str, content: str):
    # 1. 환경 변수에서 설정 불러오기
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")

    if not sender_email or not sender_password:
        return {"status": "error", "message": "메일 설정(ENV)이 누락되었습니다."}

    try:
        # 2. 메일 메시지 구성
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(content, 'plain'))

        # 3. SMTP 서버 연결 및 전송 (Context Manager 사용으로 자동 종료)
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # TLS 보안 연결 시작
            server.login(sender_email, sender_password)
            server.send_message(msg)

        print(f"✅ 메일 전송 성공: {receiver_email}")
        return {"status": "success", "message": "메일이 성공적으로 전송되었습니다."}

    except Exception as e:
        print(f"❌ 메일 전송 실패: {e}")
        return {"status": "error", "message": str(e)}