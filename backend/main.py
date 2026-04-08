from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import ProposalCreate

app = FastAPI(title="DaouData Marketing AI API")

# ✅ 리액트(Port 3000)와의 통신 허용 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "running", "message": "다우데이터 백엔드 서버가 시작되었습니다."}

@app.post("/api/proposals")
async def create_proposal(proposal: ProposalCreate):
    print(f"수신된 제안서: {proposal.target_partner}")
    return {"message": "제안서가 성공적으로 수신되었습니다.", "data": proposal}