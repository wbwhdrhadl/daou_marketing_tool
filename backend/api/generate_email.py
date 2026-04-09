import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

# ✅ 실제 로직을 담당하는 함수
def compose_proposal_email(data: dict):
    # 프론트에서 넘어온 데이터 정리
    title = data.get('title')
    summary = data.get('summary')
    partner_name = data.get('partner_name')
    contact_name = data.get('contact_name')
    solution_type = data.get('solution_type')
    is_upsell = data.get('is_upsell')
    current_solution = data.get('current_solution', '')

    prompt = f"""
    당신은 IT 총판사 '다우데이터' 가상화사업팀의 영업 전문가 이다은 사원입니다.
    다음 정보를 바탕으로 {partner_name}의 {contact_name}님께 보낼 비즈니스 제안 메일을 작성하세요.

    [정보]
    - 뉴스: {title}
    - 제안 제품: {solution_type}
    - 제안 유형: {'기존 고객 고도화' if is_upsell else '신규 사업 협력'}

    [⚠️ 중요 작성 규칙 - 반드시 지킬 것]
    1. ** 혹은 __ 같은 마크다운 강조 기호를 절대 사용하지 마세요.
    2. 불필요한 특수 기호를 배제하고 오직 텍스트와 줄바꿈(Enter)으로만 구성하세요.
    3. 메일 제목은 첫 줄에 '제목: [제목내용]' 형식으로 작성하세요.
    4. 실제 이메일 클라이언트에 복사해서 바로 보낼 수 있는 순수 텍스트(Plain Text) 형태로 작성하세요.

    [본문 구성]
    - 정중한 인사 및 본인 소개
    - 뉴스 키워드({title})를 언급하며 시장 트렌드 공유
    - {solution_type} 솔루션 도입의 필요성 및 다우데이터의 기술력 강조
    - 상세 미팅 및 기술 상담 제안
    - '다우데이터 가상화사업팀 이다은 드림'으로 마무리
    """

    response = model.generate_content(prompt)
    return response.text