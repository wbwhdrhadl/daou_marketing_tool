import os
import requests
import google.generativeai as genai
import json
import re
import hashlib
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Gemini 설정 (무료 티어 안정성을 위해 1.5-flash 권장하나, 설정하신 2.5-flash-lite 유지)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.5-flash') 

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def generate_unique_id(link: str):
    """기사 링크로 고유 ID 생성 (중복 방지)"""
    return hashlib.md5(link.encode()).hexdigest()[:20]

def fetch_business_opportunities(keyword: str):
    """
    1. 네이버 뉴스 검색 (영업 관련 키워드 포함)
    2. 파이썬 노이즈 필터링 (주식 등 제외)
    3. Gemini 영업 분석 (JSON 구조화 및 영업 소스 판단)
    """
    # 네이버 검색 시 영업 관련 단어를 포함하여 검색 모수 확보
    business_signals = "수주 계약 도입 구축 업무협약 이전 DX"
    query = f"{keyword} ({business_signals.replace(' ', ' | ')})"
    
    url = f"https://openapi.naver.com/v1/search/news.json?query={query}&display=15&sort=sim"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200: return []

        items = response.json().get('items', [])
        if not items: return []

        raw_news_list = []
        descriptions_to_summarize = []
        
        # [1단계 필터링] 주식/시황 뉴스 사전 차단
        exclude_words = ["주가", "상승세", "하락세", "특징주", "증시", "매수", "코스피", "개미"]

        for item in items:
            title = item['title'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
            desc = item['description'].replace("<b>", "").replace("</b>", "").replace("&quot;", '"').replace("&amp;", "&")
            
            if any(word in title for word in exclude_words):
                continue

            raw_news_list.append({
                "unique_id": generate_unique_id(item['link']),
                "source": "Naver News",
                "title": title,
                "link": item['link'],
                "pubDate": item['pubDate']
            })
            descriptions_to_summarize.append(f"기사ID {len(raw_news_list)}: {title} - {desc}")

        if not raw_news_list: return []

        # [2단계 분석] Gemini에게 영업 가치 판단 및 JSON 구조화 요청
        combined_text = "\n\n".join(descriptions_to_summarize)
        prompt = f"""
        너는 IT 솔루션 B2B 영업 전략가야. 아래 기사들을 분석해서 실제 '영업 기회'가 있는 것만 골라내.
        
        [필터링 및 분석 지침]
        1. 특정 기업/기관이 솔루션을 도입, 계약, 구축, 이전한다는 구체적 실체가 있는 뉴스만 포함해.
        2. 단순 기술 소개, 일반 트렌드, 인사 동정은 영업 소스가 아니므로 무조건 제외해.
        3. 영업 기회가 있는 기사만 아래 JSON 형식으로 응답해. 기사가 가치가 없으면 해당 ID는 결과에서 빼버려.

        [응답 데이터 구조]
        - company: 도입 주체 기업/기관명
        - score: 영업 가치 (0-100)
        - level: 80 이상 'High', 50-79 'Medium', 50 미만 'Low'
        - keywords: 기술 키워드 3개 리스트
        - summary: '누가 무엇을 왜 하는지' 영업적 관점에서 2문장 요약
        - analysis: [기술적 타당성, 긴급도, 예산규모, 경쟁강도] 4가지 수치(0-100) 리스트

        응답 형식 예시:
        기사ID 1: {{"company": "기업명", "score": 90, "level": "High", "keywords": ["A", "B", "C"], "summary": "요약", "analysis": [80, 50, 90, 70]}}

        분석할 데이터:
        {combined_text}
        """

        ai_response = model.generate_content(prompt)
        ai_text = ai_response.text

        # [3단계 파싱] AI의 응답을 가공하여 최종 리스트 생성
        final_results = []
        for i, res in enumerate(raw_news_list):
            try:
                # 기사ID N: { ... } 형태를 정규식으로 추출
                pattern = rf"기사ID {i+1}:\s*({{.*?}})"
                match = re.search(pattern, ai_text, re.DOTALL)
                
                if match:
                    analysis_data = json.loads(match.group(1))
                    
                    # 날짜 형식 변환
                    try:
                        dt = datetime.strptime(res['pubDate'], '%a, %d %b %Y %H:%M:%S +0900')
                        formatted_date = dt.strftime('%b %d, %Y')
                    except:
                        formatted_date = res['pubDate']

                    # 요청하신 데이터 구조로 최종 조립
                    final_results.append({
                        "id": res["unique_id"],
                        "source": res["source"],
                        "date": formatted_date,
                        "company": analysis_data.get("company"),
                        "title": res["title"],
                        "score": analysis_data.get("score"),
                        "level": analysis_data.get("level"),
                        "link": res["link"],
                        "keywords": analysis_data.get("keywords"),
                        "summary": analysis_data.get("summary"),
                        "analysis": analysis_data.get("analysis")
                    })
            except Exception as e:
                print(f"⚠️ 파싱 에러 (기사 {i+1}): {e}")

        return final_results

    except Exception as e:
        print(f"❌ 프로세스 에러: {e}")
        return []

if __name__ == "__main__":
    # 실행 테스트
    news_data = fetch_business_opportunities("가상화")
    print(json.dumps(news_data, indent=2, ensure_ascii=False))