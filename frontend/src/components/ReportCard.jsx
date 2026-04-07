import React from 'react';
import { Newspaper, Linkedin, ChevronRight, FileEdit } from 'lucide-react';
const ReportCard = ({ report, onOpen }) => {
  // 점수에 따른 색상 결정
  const isHigh = report.matchScore >= 80;
  const scoreColor = isHigh ? 'text-emerald-500' : 'text-amber-500';
  const strokeColor = isHigh ? '#10b981' : '#f59e0b';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* 상단: 헤더 */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-slate-500">
          {report.source === "LinkedIn" ? <Linkedin size={18} className="text-blue-600" /> : <Newspaper size={18} />}
          <span className="text-sm font-medium">{report.source}</span>
        </div>
        <span className="text-sm text-slate-400">{report.date}</span>
      </div>

      {/* 중앙: 제목 및 요약 */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">
          {report.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
          <span className="font-semibold text-slate-600 text-xs uppercase block mb-1">Summary:</span>
          {report.summary}
        </p>
      </div>

      {/* 하단: 매칭 스코어 섹션 */}
      <div className="flex items-center justify-between py-2">
        <div className="relative w-20 h-10 overflow-hidden">
          {/* 반원 게이지 시각화 (SVG) */}
          <svg viewBox="0 0 100 50" className="w-full">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
            <path 
              d="M 10 50 A 40 40 0 0 1 90 50" 
              fill="none" 
              stroke={strokeColor} 
              strokeWidth="12" 
              strokeDasharray={`${report.matchScore * 1.26}, 126`} 
            />
          </svg>
          <div className="absolute bottom-0 inset-x-0 text-center font-bold text-sm">
            {report.matchScore}%
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Match Score</p>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-opacity-10 ${isHigh ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {report.matchScore} • {isHigh ? 'High' : 'Medium'}
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={() => onOpen(report)}
          className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          View Details
        </button>
        <button className="py-2.5 px-4 rounded-xl bg-[#5c67f2] hover:bg-[#4a54d1] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
           Generate Proposal
        </button>
      </div>
    </div>
  );
};

export default ReportCard;