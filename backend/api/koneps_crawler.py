import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def fetch_koneps_bids(keyword=None):
    """
    나라장터 API에서 공고를 가져와 통합 스키마 형식으로 반환합니다.
    """
    service_key = os.getenv("KONEPS_API_KEY")
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    # 1. 날짜 범위 설정 (나라장터 API 제한에 따라 7일 간격 유지)
    now = datetime.now()
    start_date = (now - timedelta(days=7)).strftime('%Y%m%d0000')
    end_date = now.strftime('%Y%m%d2359')
    
    params = {
        'serviceKey': service_key,
        'numOfRows': '300',         # 필터링을 위해 넉넉히 가져옴
        'pageNo': '1',
        'inqryDiv': '1',            # 공고게시일시 기준
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'type': 'json'
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        data = response.json()
        
        if 'nkoneps.com.response.ResponseError' in data:
            print("❌ 나라장터 에러:", data['nkoneps.com.response.ResponseError']['header'])
            return []

        try:
            items_dict = data.get('response', {}).get('body', {}).get('items', [])
            if isinstance(items_dict, dict):
                items = items_dict.get('item', [])
            else:
                items = items_dict

            if isinstance(items, dict):
                items = [items]
                
        except (KeyError, TypeError):
            print("⚠️ [DEBUG] 데이터 추출 실패")
            return []

        results = []
        if not items:
            return []

        for item in items:
            title = item.get('bidNtceNm', '')
            
            # 키워드 필터링
            if not keyword or keyword.lower() in title.lower():
                # --- [통합 스키마 적용 파트] ---
                
                # 1. 예산 금액 콤마 처리 (예: 100,000,000원)
                raw_budget = item.get('presmptPrce', "0")
                try:
                    formatted_budget = format(int(raw_budget), ',') + "원"
                except:
                    formatted_budget = "가격미정"

                # 2. 날짜 형식 표준화 ('2026-04-09 10:00:00' -> '2026-04-09')
                raw_date = item.get('bidNtceDt', '') # 공고게시일
                published_at = raw_date[:10] if raw_date else ""

                # 3. 요약 내용 구성 (기관 + 예산 + 마감일)
                org = item.get('ntceInsttNm', '기관미상')
                end_date = item.get('bidClseDt', '정보없음')
                summary_content = f"발주: {org} | 예산: {formatted_budget} | 마감: {end_date}"

                results.append({
                    "title": title,
                    "content": summary_content,      # 요약 문장으로 대체
                    "link": item.get('bidNtceDtlUrl'),
                    "published_at": published_at,    # YYYY-MM-DD
                    "provider": "나라장터",
                    "category": "tender",
                    "extra_info": {                  # 나라장터만의 상세 정보 저장
                        "bid_no": item.get('bidNtceNo'),
                        "org_name": org,
                        "budget": raw_budget,
                        "end_date": end_date
                    }
                })
        
        print(f"✅ [DEBUG] 나라장터 '{keyword if keyword else '전체'}' 필터링 결과: {len(results)}건")
        return results

    except Exception as e:
        print(f"❌ [DEBUG] 예외 발생: {str(e)}")
        return []