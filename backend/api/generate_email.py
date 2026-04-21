import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

# ✅ 실제 로직을 담당하는 함수
def compose_proposal_email(data: dict):
    # 기본 데이터 추출
    title = data.get('title', '최신 IT 트렌드 및 사업 공고')
    summary = data.get('summary', '관련 상세 내용')
    partner_name = data.get('partner_name', '파트너사')
    contact_name = data.get('contact_name', '담당자')
    solution_type = data.get('solution_type', '가상화 및 보안 솔루션')
    is_upsell = data.get('is_upsell', False)

    # 지능형 메일 생성을 위한 프롬프트 고도화
    prompt = f"""
    당신은 IT 총판사 '다우데이타' 가상화사업팀의 영업 전문가 이다은 사원입니다.
    제공된 뉴스/공고 정보를 바탕으로, 상대방이 거절하기 힘든 '데이터 기반의 통찰력 있는 제안 메일'을 작성하세요.

    [작성 시나리오 가이드 - 실제 데이터가 없으므로 아래 내용을 논리적으로 창작할 것]
    1. 비즈니스 시그널 추적: {title} 뉴스의 이면에 숨겨진 고객의 고민(예: 보안 규제 대응, 비용 절감, AI 도입 인프라 부족 등)을 날카롭게 분석하여 언급하세요.
    2. 유사 레퍼런스 창작: 제안 대상인 {partner_name}과 업종, 규모가 유사한 기업에서 {solution_type}을 도입해 성공했던 가상의 사례를 구체적으로 만들어내세요. (예: "지난해 국내 A 금융사의 가상화 고도화를 통해 업무 효율을 30% 개선한 바 있습니다.")
    3. 파트너 실행력 증명: {partner_name}이 해당 분야에서 가진 강점(예: 'Platinum 등급', '전문 엔지니어 보유' 등)을 치켜세우며, 다우데이타와 함께했을 때의 시너지를 강조하세요.

    [메일 정보]
    - 관련 이슈: {title}
    - 제안 솔루션: {solution_type}
    - 타겟 파트너: {partner_name} ({contact_name}님)

    [⚠️ 중요 작성 규칙]
    1. 마크다운 강조 기호(**, __ 등)를 절대 사용하지 마세요. 오직 순수 텍스트와 줄바꿈으로만 구성하세요.
    2. 메일 제목은 첫 줄에 '제목: [제목내용]' 형식으로 작성하세요.
    3. 말투는 정중하면서도 전문성이 느껴지는 컨설팅 톤을 유지하세요.

    [본문 구성]
    - 도입부: 정중한 인사 및 다우데이타 가상화사업팀 이다은 소개
    - 시그널 분석: {title}이 시장과 귀사에 시사하는 바를 분석하여 공유
    - 전략적 제안: 유사 업종의 구체적인 수주 성공 레퍼런스를 근거로 {solution_type} 제안
    - 파트너십 강조: '나무기술' 파트너사 소개 의 우수한 실행력과 다우데이타의 기술 지원 시너지 강조
    - 클로징: 기술 상담 및 상세 미팅 제안과 마무리 인사
    """

    response = model.generate_content(prompt)
    return response.text