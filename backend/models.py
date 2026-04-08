from sqlalchemy import Column, Integer, String, ForeignKey
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