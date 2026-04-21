from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Date, Text
from sqlalchemy.orm import relationship
from database import Base

class Partner(Base):
    __tablename__ = "partners"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String)
    contacts = relationship("Contact", back_populates="owner")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dept = Column(String)
    email = Column(String)
    partner_id = Column(Integer, ForeignKey("partners.id"))
    owner = relationship("Partner", back_populates="contacts")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String, primary_key=True, index=True) # unique_id
    source = Column(String)     # Naver News 또는 나라장터
    date = Column(Date)
    company = Column(String)
    title = Column(String)
    summary = Column(Text)
    keywords = Column(JSON)     # 리스트 저장용
    suggested_solution = Column(String)
    partners = Column(JSON)     # 객체 리스트 저장용
    score = Column(Integer)
    level = Column(String)
    analysis = Column(JSON)     # [80, 70, 60, 50] 배열 저장용
    link = Column(String)

class SentMail(Base):
    __tablename__ = "sent_mails"

    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String)
    company = Column(String)
    subject = Column(String)
    content = Column(Text)
    sentDate = Column(String)
    # Gemini AI가 채워넣을 필드
    status = Column(String, default="분석 전") 
    interestScore = Column(Integer, default=0)
    # 실시간 클릭 카운트 필드
    citrix_click = Column(Integer, default=0)
    netscaler_click = Column(Integer, default=0)
    nubo_click = Column(Integer, default=0)
    namutech_click = Column(Integer, default=0)
    daou_click = Column(Integer, default=0)