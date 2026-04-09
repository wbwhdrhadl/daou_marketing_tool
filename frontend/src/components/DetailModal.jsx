import React from 'react';
import { X, BarChart3, CheckCircle2, ExternalLink, Mail } from 'lucide-react';

const DetailModal = ({ report, onClose, onStartProposal }) => {
  if (!report || !report.partners) return null; // 데이터가 없으면 표시 안함

  const totalDeals = report.partners.reduce((sum, p) => sum + p.deals, 0);
  let cumulativeOffset = 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center p-4 overflow-y-auto items-start py-10">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative mb-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* 상단 헤더 */}
        <div className="sticky top-0 z-20 bg-[#004EA1] p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{report.source || 'Naver News'}</span>
            <h3 className="text-xl font-black mt-1 leading-tight">{report.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* AI 요약 섹션 */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed text-sm text-slate-600">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
              <BarChart3 size={18} className="text-[#004EA1]" /> AI 분석 리포트
            </h4>
            <p className="whitespace-pre-wrap">{report.summary}</p>
          </section>

          {/* 파트너사 차트 섹션 */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
              <CheckCircle2 size={18} className="text-[#004EA1]" /> 유사 사업 추진 파트너사 비중
            </h4>
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
              
              {/* 도넛 차트 */}
              <div className="w-40 h-40 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  {report.partners.map((p, i) => {
                    const percentage = (p.deals / totalDeals) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -cumulativeOffset;
                    cumulativeOffset += percentage;
                    return (
                      <circle 
                        key={i} 
                        cx="18" cy="18" r="15.915" 
                        fill="none" 
                        stroke={p.color} 
                        strokeWidth="4" 
                        strokeDasharray={strokeDasharray} 
                        strokeDashoffset={strokeDashoffset} 
                        className="transition-all duration-1000 ease-out" 
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-lg font-black text-slate-800">{totalDeals}건</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-6 px-4 pt-12 pb-6 bg-white/50 rounded-3xl border border-slate-100 shadow-inner">
            {(report.analysis || [0, 0, 0, 0]).map((val, idx) => {
              let numericValue = 50;
              let displayLabel = val;

              if (typeof val === 'string') {
                if (val.includes('High')) numericValue = 90;
                else if (val.includes('Medium')) numericValue = 60;
                else if (val.includes('Low')) numericValue = 30;
              } else if (typeof val === 'number') {
                numericValue = val;
                displayLabel = `${val}%`;
              }

              const labels = ['보안성', '가용성', '확장성', '수익성']; // 명칭을 조금 더 전문적으로 변경

              return (
                <div key={idx} className="flex flex-col items-center group">
                  <div className="w-full h-32 flex items-end justify-center relative mb-4">
                    
                    {/* 가이드 라인 (배경 점선) */}
                    <div className="absolute inset-0 border-b border-slate-200 pointer-events-none"></div>
                    
                    {/* 바 컨테이너 배경 */}
                    <div className="absolute inset-0 bg-slate-50/50 rounded-t-2xl -z-10"></div>

                    {/* 실제 차오르는 막대 (그라데이션 및 애니메이션) */}
                    <div 
                      className="w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ease-out relative group-hover:brightness-110 shadow-[0_-4px_12px_rgba(0,78,161,0.2)]" 
                      style={{ 
                        height: `${numericValue}%`,
                        background: `linear-gradient(to top, #004EA1, #0095D8)` // 다우데이터 메인 컬러 그라데이션
                      }}
                    >
                      {/* 상단 포인트 (빛 반사 효과) */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-xl"></div>

                      {/* 막대 위 텍스트 배지 */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-1 rounded-lg shadow-lg">
                          {displayLabel.split(': ').pop()}
                        </span>
                        {/* 화살표 꼬리 */}
                        <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 지표 텍스트 디자인 */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] text-slate-400 font-bold tracking-tighter uppercase">{labels[idx]}</span>
                    <div className={`h-1 w-4 rounded-full ${numericValue >= 80 ? 'bg-[#004EA1]' : 'bg-slate-200'}`}></div>
                  </div>
                </div>
              );
            })}
          </section>
          {/* 하단 버튼 */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <a href={report.link} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200">
              <ExternalLink size={14} /> 원문 링크
            </a>
            <button 
              onClick={onStartProposal} 
              className="flex-1 py-3.5 bg-[#004EA1] text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#003d7e]"
            >
              <Mail size={16} /> 맞춤형 제안서 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;