import React from 'react';
import { Calendar } from 'lucide-react'; // 날짜 아이콘 추가

const ReportCard = ({ report, onDetail, onProposal }) => (
  <div className="group border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col bg-white">
    {/* 상단: 소스 배지와 날짜 */}
    <div className="flex justify-between items-center mb-4">
      <span className={`text-[10px] font-black uppercase w-fit px-2.5 py-1 rounded-md ${
        report.source === 'Naver News' ? 'text-emerald-600 bg-emerald-50' : 
        report.source === 'LinkedIn' ? 'text-[#0077B5] bg-blue-50' :
        report.source === '전자신문' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'
      }`}>
        {report.source}
      </span>
      
      {/* ✅ 날짜 표시 부분 추가 */}
      <div className="flex items-center gap-1 text-slate-400">
        <Calendar size={12} />
        <span className="text-[10px] font-bold">{report.date}</span>
      </div>
    </div>

    <h2 className="text-slate-900 mb-3 h-12 overflow-hidden font-bold leading-tight">{report.title}</h2>
    <p className="text-xs text-slate-500 mb-6 line-clamp-2">{report.summary}</p>
    
    <div className="mt-auto">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-xl">
        <span className="text-xl font-bold text-[#004EA1]">
          {report.score}% 
          <span className="ml-1 text-[10px] text-slate-400 uppercase font-medium tracking-tighter">적합도</span>
        </span>
        <span className={`text-[10px] px-2 py-1 rounded-full font-black text-white ${
          report.level === 'High' ? 'bg-[#0095D8]' : 'bg-orange-400'
        }`}>
          {report.level}
        </span>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onDetail(report)} 
          className="flex-1 py-2.5 border-2 border-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          자세히 보기
        </button>
        <button 
          onClick={() => onProposal(report)} 
          className="flex-[1.5] py-2.5 bg-[#004EA1] text-white text-xs font-bold rounded-lg hover:bg-[#003670] shadow-sm transition-all"
        >
          제안 메일 보내기
        </button>
      </div>
    </div>
  </div>
);

export default ReportCard;