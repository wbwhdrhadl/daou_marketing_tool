import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_proposal_email(receiver_email: str, company: str, subject: str, content: str, mail_id: int):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")

    # ✅ ngrok 주소 (실행 시마다 확인 필수!)
    ngrok_url = "https://flavorful-appliance-speller.ngrok-free.dev"

    if not sender_email or not sender_password:
        return {"status": "error", "message": "메일 설정(ENV)이 누락되었습니다."}

    try:
        msg = MIMEMultipart()
        msg['From'] = f"다우데이타 가상화 사업팀 <{sender_email}>"
        msg['To'] = receiver_email
        msg['Subject'] = subject

        # HTML 본문 (나무기술 버튼 및 스타일 정리)
        html_content = f"""
        <html>
            <body style="margin:0; padding:20px; font-family: 'Malgun Gothic', sans-serif; background-color: #f4f7f9;">
                <div style="max-width: 550px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <div style="background-color: #004EA1; padding: 25px; text-align: center;">
                        <h2 style="color: white; margin: 0; font-size: 20px;">{company} 귀하 가상화 솔루션 제안서</h2>
                    </div>
                    
                    <div style="padding: 30px;">
                        <div style="line-height: 1.8; color: #444; font-size: 15px; margin-bottom: 30px;">
                            {content.replace('\n', '<br>')}
                        </div>

                        <p style="font-weight: bold; color: #333; margin-bottom: 15px; border-left: 4px solid #004EA1; padding-left: 10px;">
                            상세 솔루션 및 파트너 확인하기
                        </p>
                        
                        <a href="{ngrok_url}/api/v1/track/click/{mail_id}/citrix" 
                           style="display: block; background: #fff; border: 1px solid #004EA1; color: #004EA1; padding: 15px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                           Citrix VDI 솔루션 상세보기
                        </a>

                        <a href="{ngrok_url}/api/v1/track/click/{mail_id}/netscaler" 
                           style="display: block; background: #fff; border: 1px solid #004EA1; color: #004EA1; padding: 15px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                           NetScaler(ADC) 솔루션 상세보기
                        </a>

                        <a href="{ngrok_url}/api/v1/track/click/{mail_id}/nubo" 
                           style="display: block; background: #fff; border: 1px solid #004EA1; color: #004EA1; padding: 15px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                           Nubo(VMI) 솔루션 상세보기
                        </a>

                        <a href="{ngrok_url}/api/v1/track/click/{mail_id}/namutech" 
                           style="display: block; background: #E6F0FF; border: 1px solid #004EA1; color: #004EA1; padding: 15px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 20px;">
                           협력 파트너 [나무기술] 공식 홈페이지 방문
                        </a>

                        <div style="text-align: center; margin-top: 25px;">
                            <a href="{ngrok_url}/api/v1/track/click/{mail_id}/daoudata" 
                               style="color: #888; font-size: 13px; text-decoration: underline;">
                               다우데이타 공식 홈페이지 방문
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
                        본 메일은 다우데이타 가상화 사업팀에서 발송된 보안 제안서입니다.
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)

        return {"status": "success", "message": "성공"}
    except Exception as e:
        print(f"Mail send error: {e}")
        return {"status": "error", "message": str(e)}