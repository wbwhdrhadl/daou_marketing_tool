import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
print(f"DEBUG: API KEY is {os.getenv('GEMINI_API_KEY')}") # 이게 None이 나오면 안 됩니다!

# API 키 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ✅ 수정 포인트 1: genai.Model -> genai.GenerativeModel
# 모델명은 현재 가장 안정적인 "gemini-1.5-flash"를 추천합니다.
model = genai.GenerativeModel("gemini-1.5-flash")

def analyze_customer_interest(clicks: dict):
    """
    clicks: {"citrix": 2, "netscaler": 0, "nubo": 5, "daou": 1} 형태의 딕셔너리
    """
    prompt = f"""
    당신은 IT 솔루션 영업 전문가입니다. 고객의 메일 내 버튼 클릭 데이터를 보고 분석하세요.
    데이터: {clicks}
    
    1. 관심 점수: 0~100점 사이로 정수로만 답변.
    2. 현황 요약: 현재 고객의 관심도를 한 문장으로 전문성 있게 요약 (예: 'Nubo VMI 솔루션에 집중적인 관심을 보이며 도입 가능성 높음')
    
    출력 형식:
    Score: [점수]
    Summary: [요약]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        score = 0
        summary = "분석 중..."
        
        # 분석 결과 파싱
        for line in text.split('\n'):
            if "Score:" in line:
                score_str = line.split(":")[1].strip()
                # 숫자가 아닌 값이 들어올 경우를 대비해 예외 처리
                score = int(''.join(filter(str.isdigit, score_str)))
            if "Summary:" in line:
                summary = line.split(":")[1].strip()
                
        return score, summary

    except Exception as e:
        print(f"Gemini API 호출 오류: {e}")
        return 0, "AI 분석을 일시적으로 사용할 수 없습니다."