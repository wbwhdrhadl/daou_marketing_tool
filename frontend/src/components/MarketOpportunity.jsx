import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Calendar, Filter, Database, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import ReportCard from './ReportCard';
import axios from 'axios';

const MarketOpportunity = ({ onDetail, onProposal, startDate, setStartDate, endDate, setEndDate }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState(["vdi"]);
  const [error, setError] = useState(null);

  const PRESET_KEYWORDS = [
    "가상화", "망분리", "VDI", "Nubo VMI", "Citrix", 
    "공공기관", "금융", "Cloud", "한화시스템", "보안"
  ];

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/opportunities`);
      setReports(response.data.results || []);
    } catch (err) {
      console.error("DB 조회 실패:", err);
      setError("데이터베이스 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const filteredReports = useMemo(() => {
  return reports.filter(report => {
    // 1. 키워드 필터링
    const matchesKeywords = tags.length === 0 || tags.some(tag => 
      report.keywords?.some(k => k.toLowerCase().includes(tag.toLowerCase())) ||
      report.title?.toLowerCase().includes(tag.toLowerCase()) ||
      report.company?.toLowerCase().includes(tag.toLowerCase())
    );

    // 2. 날짜 필터링 (수정된 부분)
    const reportDate = new Date(report.date);
    
    // startDate나 endDate가 비어있으면 해당 조건은 true로 간주(무시)합니다.
    const isAfterStart = !startDate || reportDate >= new Date(startDate);
    const isBeforeEnd = !endDate || reportDate <= new Date(endDate);
    
    const isWithinDate = isAfterStart && isBeforeEnd;

    return matchesKeywords && isWithinDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}, [reports, tags, startDate, endDate]);

  return (
    // ✅ 1. 부모 컨테이너에 w-full과 overflow-x-hidden 추가
    <div className="w-full max-w-full overflow-x-hidden px-2 md:px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 상단 필터 섹션 */}
      {/* ✅ 2. 모바일 패딩 조정 (p-4 md:p-8) */}
      <div className="mb-8 bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-6 text-[#004EA1]">
          <Filter size={20} />
          <h3 className="font-black text-lg tracking-tight">시장 기회 데이터 조회</h3>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
              <Tag size={14} /> AI Analysis Keywords
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_KEYWORDS.map((keyword) => {
                const isSelected = tags.includes(keyword);
                return (
                  <button
                    key={keyword}
                    onClick={() => toggleTag(keyword)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 border-2 ${
                      isSelected 
                        ? 'bg-[#004EA1] border-[#004EA1] text-white shadow-md' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                    {keyword}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-50">
            <div className="lg:col-span-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Date Range</label>
              {/* ✅ 3. 날짜 입력창이 좁은 화면에서 깨지지 않도록 flex-wrap 처리 */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-2 md:h-[58px]">
                <Calendar size={18} className="text-slate-400" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-transparent text-xs md:text-sm font-bold text-slate-600 outline-none flex-1 min-w-[110px] cursor-pointer" 
                />
                <span className="text-slate-300 font-light">~</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-transparent text-xs md:text-sm font-bold text-slate-600 outline-none flex-1 min-w-[110px] cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 상태 메시지 */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 size={16} className="text-[#004EA1] animate-spin" />
          ) : (
            <Database size={16} className="text-slate-400" />
          )}
          <span className="text-xs md:text-sm font-bold text-slate-500">
            {isLoading ? "데이터 로드 중..." : `분석 결과: `}
            <span className="text-[#004EA1]">{filteredReports.length}</span>건
          </span>
        </div>
        {tags.length > 0 && (
          <button 
            onClick={() => setTags([])}
            className="text-xs font-bold text-[#0095D8] hover:text-red-500 transition-colors"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 결과 그리드 */}
      {/* ✅ 4. 그리드 간격을 모바일에서 좁게 설정 (gap-4 md:gap-8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-10">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-200">
            <p className="text-red-500 font-bold">{error}</p>
            <button onClick={fetchReports} className="mt-4 text-sm font-bold text-red-600 underline">다시 시도</button>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onDetail={onDetail} 
              onProposal={onProposal} 
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
             <Search size={40} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-black text-lg">결과가 없습니다.</p>
             <p className="text-slate-400 text-sm mt-1">조건을 변경하여 검색해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketOpportunity;