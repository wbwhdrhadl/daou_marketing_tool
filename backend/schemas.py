from pydantic import BaseModel, EmailStr

class EmailRequest(BaseModel):
    receiver_email: EmailStr  # EmailStr을 쓰면 이메일 형식인지 자동으로 검사해줍니다!
    subject: str
    content: str

    class Config:
        schema_extra = {
            "example": {
                "receiver_email": "partner@daou.co.kr",
                "subject": "솔루션 제안서 송부",
                "content": "안녕하세요, 제안서 내용입니다."
            }
        }