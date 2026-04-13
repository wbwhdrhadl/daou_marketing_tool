import React from 'react';
import { Calendar, Globe, Link2, MessageSquare, ExternalLink, Mail } from 'lucide-react';

const ReportCard = ({ report, onDetail, onProposal }) => {
  // 소스별 아이콘 매칭
  const getSourceIcon = (source) => {
    switch (source) {
      case 'Naver News': return <Globe size={12} />;
      case 'LinkedIn': return <Link2 size={12} />;
      case '전자신문': return <MessageSquare size={12} />;
      default: return <Globe size={12} />;
    }
  };

  return (
    <div className="group relative border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-[#004EA1]/30 transition-all flex flex-col bg-white overflow-hidden">
      
      {/* 1. 상단: 소스 배지와 날짜 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase w-fit px-2.5 py-1 rounded-md shadow-sm border ${
            report.source === 'Naver News' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
            report.source === 'LinkedIn' ? 'text-[#0077B5] bg-blue-50 border-blue-100' :
            report.source === '전자신문' ? 'text-red-600 bg-red-50 border-red-100' : 
            'text-slate-600 bg-slate-50 border-slate-200'
          }`}>
            {getSourceIcon(report.source)}
            {report.source}
          </span>
          {/* 어디서 가져왔는지 구체적 경로/키워드 표시 */}
          <span className="text-[10px] text-slate-400 font-medium pl-1">
            via {report.source} Keyword Scan
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Calendar size={10} />
          <span className="text-[10px] font-bold">{report.date}</span>
        </div>
      </div>

      {/* 2. 본문: 제목 및 요약 */}
      <h2 className="text-slate-900 mb-3 h-12 overflow-hidden font-black leading-tight group-hover:text-[#004EA1] transition-colors">
        {report.title}
      </h2>
      <p className="text-xs text-slate-500 mb-6 line-clamp-2 font-medium">
        {report.summary}
      </p>
      
      {/* 3. 하단: 적합도 (깨짐 방지 처리) */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
          {/* 점수 부분: whitespace-nowrap으로 줄바꿈 강제 방지 */}
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Matching Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#004EA1] leading-none">{report.score}%</span>
              <span className="text-[10px] text-slate-400 font-bold">적합</span>
            </div>
          </div>

          {/* 우선순위 라벨 */}
          <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] text-white shadow-sm ${
            report.level === 'High' ? 'bg-[#0095D8]' : 'bg-orange-400'
          }`}>
            {report.level} Priority
          </div>
        </div>

        {/* 4. 버튼 영역 */}
        <div className="flex gap-2">
          <button 
            onClick={() => onDetail(report)} 
            className="flex-1 py-3 border-2 border-slate-100 text-slate-500 text-[11px] font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-1"
          >
            <ExternalLink size={14} /> 상세 분석
          </button>
          <button 
            onClick={() => onProposal(report)} 
            className="flex-[1.5] py-3 bg-[#004EA1] text-white text-[11px] font-black rounded-xl hover:bg-[#003670] shadow-lg shadow-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Mail size={14} /> 제안 메일 발송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;