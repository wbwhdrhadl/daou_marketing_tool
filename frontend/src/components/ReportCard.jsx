import React from 'react';
import { Calendar, Globe, Link2, MessageSquare, ExternalLink, Mail, ArrowUpRight } from 'lucide-react';

const ReportCard = ({ report, onDetail, onProposal }) => {
  const getSourceIcon = (source) => {
    switch (source) {
      case 'Naver News': return <Globe size={13} />;
      case 'LinkedIn': return <Link2 size={13} />;
      case '전자신문': return <MessageSquare size={13} />;
      default: return <Globe size={13} />;
    }
  };

const stats = [
  { 
    label: '보안성', 
    // 백엔드 analysis_obj의 security 키 참조
    value: report.analysis?.security ?? 50, 
    color: 'from-blue-600 to-blue-400' 
  },
  { 
    label: '가용성', 
    value: report.analysis?.availability ?? 50, 
    color: 'from-emerald-600 to-emerald-400' 
  },
  { 
    label: '수익성', 
    // 백엔드 analysis_obj의 profitability 키 참조
    value: report.analysis?.profitability ?? 50, 
    color: 'from-amber-600 to-amber-400' 
  },
];

  return (
    <div className="group relative bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm hover:shadow-[0_20px_50px_rgba(0,78,161,0.12)] hover:-translate-y-2 hover:border-[#004EA1]/20 transition-all duration-300 flex flex-col min-h-[580px]">
      
      {/* 카드 상단 데코 라인 */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#004EA1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* 1. 상단: 태그 및 날짜 */}
      <div className="flex justify-between items-center mb-6">
        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.2 rounded-full border ${
          report.source === 'Naver News' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
          report.source === 'LinkedIn' ? 'text-[#0077B5] bg-blue-50 border-blue-100' :
          report.source === '전자신문' ? 'text-red-600 bg-red-50 border-red-100' : 
          'text-slate-500 bg-slate-50 border-slate-200'
        }`}>
          {getSourceIcon(report.source)}
          {report.source}
        </span>
        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
          <Calendar size={12} className="opacity-70" />
          {report.date}
        </div>
      </div>

      {/* 2. 본문: 제목 및 요약 */}
      <div className="mb-5">
        <h2 className="text-lg text-slate-800 font-black leading-snug group-hover:text-[#004EA1] transition-colors mb-3 line-clamp-2 min-h-[3rem]">
          {report.title}
        </h2>
        <p className="text-[13px] text-slate-500 line-clamp-3 font-medium leading-relaxed opacity-80">
          {report.summary}
        </p>
      </div>

      {/* 3. 분석 그래프 (Glassmorphism 스타일) */}
      <div className="space-y-4 mb-8 bg-slate-50/80 backdrop-blur-sm p-5 rounded-[1.5rem] border border-slate-100 group-hover:bg-white group-hover:shadow-inner transition-all">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</span>
              <span className="text-[11px] font-black text-[#004EA1]">{stat.value}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out rounded-full`} 
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* 4. 하단 영역: 점수 및 액션 */}
      <div className="mt-auto pt-4 border-t border-slate-50">
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Match Score</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                {report.score}<span className="text-lg text-[#004EA1]">%</span>
              </span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider text-white shadow-sm ${
            report.level === 'High' ? 'bg-[#004EA1] animate-pulse' : 'bg-orange-400'
          }`}>
            {report.level || 'Mid'} Priority
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onDetail(report)} 
            className="group/btn flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-200 transition-all"
          >
            상세분석
            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
          <button 
            onClick={() => onProposal(report)} 
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-[#004EA1] text-white text-[12px] font-black rounded-xl hover:bg-[#003670] hover:shadow-lg hover:shadow-blue-200 transition-all"
          >
            <Mail size={14} /> 제안발송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;