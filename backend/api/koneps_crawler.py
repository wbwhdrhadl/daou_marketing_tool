import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def fetch_koneps_bids(keyword=None):
    """
    나라장터 API에서 공고를 가져와 키워드로 필터링하는 함수
    """
    service_key = os.getenv("KONEPS_API_KEY")
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    # 1. 날짜 범위 설정 (나라장터 API 제한에 따라 7일 간격 유지)
    now = datetime.now()
    start_date = (now - timedelta(days=7)).strftime('%Y%m%d0000')
    end_date = now.strftime('%Y%m%d2359')
    
    # 2. API 요청 파라미터 (최대한 많이 가져와서 코드에서 필터링)
    params = {
        'serviceKey': service_key,
        'numOfRows': '300',         # 필터링 효율을 위해 300개로 상향
        'pageNo': '1',
        'inqryDiv': '1',            # 공고게시일시 기준
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'type': 'json'
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        data = response.json()
        
        # API 자체 에러 처리 (인증 에러 등)
        if 'nkoneps.com.response.ResponseError' in data:
            print("❌ 나라장터 에러:", data['nkoneps.com.response.ResponseError']['header'])
            return []

        # 3. 데이터 계층 접근
        try:
            items_dict = data.get('response', {}).get('body', {}).get('items', [])
            
            # 데이터가 1개일 때와 여러 개일 때의 구조 처리
            if isinstance(items_dict, dict):
                items = items_dict.get('item', [])
            else:
                items = items_dict

            # 단일 아이템일 경우 리스트로 변환
            if isinstance(items, dict):
                items = [items]
                
        except (KeyError, TypeError):
            print("⚠️ [DEBUG] 데이터 추출 실패")
            return []

        # 4. 키워드 필터링 및 데이터 가공
        results = []
        if not items:
            return []

        for item in items:
            title = item.get('bidNtceNm', '')
            
            # 키워드가 없으면 전체 추가, 있으면 제목에 포함된 경우만 추가
            if not keyword or keyword.lower() in title.lower():
                results.append({
                    "id": item.get('bidNtceNo'),
                    "title": title,
                    "org": item.get('ntceInsttNm'),
                    "budget": item.get('presmptPrce', "0"),
                    "end_date": item.get('bidClseDt'),
                    "link": item.get('bidNtceDtlUrl'),
                    "provider": "koneps"
                })
        
        print(f"✅ [DEBUG] '{keyword if keyword else '전체'}' 필터링 결과: {len(results)}건 반환")
        return results

    except Exception as e:
        print(f"❌ [DEBUG] 예외 발생: {str(e)}")
        return []