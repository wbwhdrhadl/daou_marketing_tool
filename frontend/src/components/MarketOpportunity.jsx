import React, { useState, useMemo } from 'react';
import { X, Search, Calendar, Filter, Database, Tag, CheckCircle2 } from 'lucide-react';
import ReportCard from './ReportCard';
import { MOCK_MARKET_REPORTS } from '../data'; 

const MarketOpportunity = ({ onDetail, onProposal, startDate, setStartDate, endDate, setEndDate }) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 1. 추천/주요 키워드 리스트 (영업팀에서 자주 쓰는 키워드들)
  const PRESET_KEYWORDS = [
    "가상화", "망분리", "VDI", "Nubo VMI", "Citrix", 
    "공공기관", "금융", "KOGAS", "한화시스템", "클라우드"
  ];

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  // 실시간 필터링 로직
  const filteredReports = useMemo(() => {
    return MOCK_MARKET_REPORTS.filter(report => {
      const matchesKeywords = tags.length === 0 || tags.some(tag => 
        report.keywords?.some(k => k.toLowerCase().includes(tag.toLowerCase())) ||
        report.title?.toLowerCase().includes(tag.toLowerCase()) ||
        report.company?.toLowerCase().includes(tag.toLowerCase())
      );

      const reportDate = new Date(report.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const isWithinDate = reportDate >= start && reportDate <= end;

      return matchesKeywords && isWithinDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tags, startDate, endDate]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 상단 필터 섹션 */}
      <div className="mb-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-6 text-[#004EA1]">
          <Filter size={20} />
          <h3 className="font-black text-lg tracking-tight">시장 기회 검색 필터</h3>
        </div>

        <div className="space-y-8">
          {/* A. 추천 키워드 선택 (새로 추가된 섹션) */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
              <Tag size={14} /> Quick Select Keywords
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_KEYWORDS.map((keyword) => {
                const isSelected = tags.includes(keyword);
                return (
                  <button
                    key={keyword}
                    onClick={() => toggleTag(keyword)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-2 ${
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-50">
            

            {/* C. 기간 필터 */}
            <div className="lg:col-span-5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Date Range</label>
              <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 h-[58px]">
                <Calendar size={18} className="text-slate-400" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none w-full cursor-pointer" 
                />
                <span className="text-s-300 font-light">~</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none w-full cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 요약 및 결과 그리드 (기존과 동일) */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">
            검색 결과: <span className="text-[#004EA1]">{filteredReports.length}</span>건
          </span>
        </div>
        {tags.length > 0 && (
          <button 
            onClick={() => setTags([])}
            className="text-xs font-bold text-[#0095D8] hover:text-red-500 transition-colors"
          >
            모든 필터 해제
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredReports.length > 0 ? (
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
             <p className="text-slate-500 font-black text-lg">해당 조건에 맞는 리포트가 없습니다.</p>
             <p className="text-slate-400 text-sm mt-1">다른 키워드를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketOpportunity;