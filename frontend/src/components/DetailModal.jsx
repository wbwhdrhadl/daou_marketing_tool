import React from 'react';
import { X, BarChart3, CheckCircle2, ExternalLink, Mail } from 'lucide-react';

const DetailModal = ({ report, onClose, onStartProposal }) => {
  if (!report) return null;
  const totalDeals = report.partners.reduce((sum, p) => sum + p.deals, 0);
  let cumulativeOffset = 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center p-4 overflow-y-auto items-start py-10">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative mb-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 z-20 bg-[#004EA1] p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{report.source}</span>
            <h3 className="text-xl font-black mt-1 leading-tight">{report.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed text-sm text-slate-600">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><BarChart3 size={18} className="text-[#004EA1]" /> AI 분석 리포트</h4>
            {report.summary}
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4"><CheckCircle2 size={18} className="text-[#004EA1]" /> 유사 사업 추진 비중</h4>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-2 w-full">
                {report.partners.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#004EA1]">{item.deals}건</span>
                  </div>
                ))}
              </div>
              <div className="w-40 h-40 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  {report.partners.map((p, i) => {
                    const percentage = (p.deals / totalDeals) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -cumulativeOffset;
                    cumulativeOffset += percentage;
                    return <circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={p.color} strokeWidth="4" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-lg font-black text-slate-800">{totalDeals}건</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4">
            {report.analysis.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full h-20 flex items-end mb-2"> 
                  <div className="w-full bg-[#004EA1]/10 rounded-t-lg relative" style={{ height: `${val}%` }}>
                    <div className="absolute top-[-18px] left-0 right-0 text-center text-[10px] font-black text-[#004EA1]">{val}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{['보안', '가용', '확장', '수익'][idx]}</span>
              </div>
            ))}
          </section>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <a href={report.link} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"><ExternalLink size={14} /> 원문 링크</a>
            <button onClick={onStartProposal} className="flex-1 py-3.5 bg-[#004EA1] text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#003d7e]"><Mail size={16} /> 맞춤형 제안서 생성</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;