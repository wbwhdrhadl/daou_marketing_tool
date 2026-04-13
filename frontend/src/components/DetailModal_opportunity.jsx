import React from 'react';
import { X, BarChart3, TrendingUp, Mail, Target, Shield, Zap, Info } from 'lucide-react';

const DetailModal_opportunity = ({ report, onClose, onStartProposal }) => {
  if (!report) return null;

  // 💡 수정 포인트: report.analysis에 있는 실제 데이터를 우선적으로 할당합니다.
  const analysisData = {
    // 백엔드에서 정규화해서 보낸 analysis 객체 값을 그대로 사용
    potential: report.analysis?.security ?? 50,      // 보안성 -> 성공 가능성
    suitability: report.analysis?.availability ?? 50, // 가용성 -> 적합도
    marketTrend: report.analysis?.scalability ?? 50,  // 확장성 -> 시장 성장성
    
    strengths: report.strengths || ["기존 인프라 호환성", "보안 가이드 준수", "비용 절감"],
    riskFactor: report.riskFactor || "예산 확보 필요"
  };
  const partners = report.partners || [
    { name: "나무기술", deals: 12, color: "#004EA1" },
    { name: "그루텍", deals: 8, color: "#0095D8" },
    { name: "기타", deals: 5, color: "#CBD5E1" }
  ];
  
  const totalDeals = partners.reduce((sum, p) => sum + (p.deals || 0), 0);
  let cumulativeOffset = 0;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex justify-center items-start overflow-y-auto p-4 py-10">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col">
        
        {/* 상단 헤더: 리포트 타이틀 */}
        <div className="bg-gradient-to-r from-[#004EA1] via-[#0072BC] to-[#0095D8] p-10 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Strategy Report</span>
              <div className="h-1 w-1 rounded-full bg-white/50"></div>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
            </div>
            <h3 className="text-3xl font-black leading-tight tracking-tighter">
              {report.title || report.company} <br/>
              <span className="text-white/70 text-xl font-bold">시장 진입 및 솔루션 제안 분석</span>
            </h3>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 이벤트 전파 방지
              onClose();           // Dashboard의 closeAllModals 실행
            }} 
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white z-[110]"
          >
            <X size={24} />
          </button>
          {/* 장식용 패턴 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        <div className="p-10 space-y-10 bg-white">
          
          {/* 1. 핵심 지표 섹션 (성공 가능성 그래프) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "영업 성공 가능성", value: analysisData.potential, icon: <Target className="text-rose-500" />, color: "bg-rose-500" },
              { label: "솔루션 적합도", value: analysisData.suitability, icon: <Shield className="text-[#004EA1]" />, color: "bg-[#004EA1]" },
              { label: "시장 성장성", value: analysisData.marketTrend, icon: <TrendingUp className="text-emerald-500" />, color: "bg-emerald-500" }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
                  <span className="text-2xl font-black text-slate-800">{stat.value}%</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mb-3 relative z-10">{stat.label}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative z-10">
                  <div className={`${stat.color} h-full group-hover:scale-x-110 transition-transform origin-left`} style={{width: `${stat.value}%`}}></div>
                </div>
              </div>
            ))}
          </section>

          {/* 2. AI 심층 분석 본문 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 tracking-tight">
                <Zap size={18} className="text-[#004EA1] fill-[#004EA1]/20"/> 전략적 분석 결과
              </h4>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-h-[150px]">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {report.summary || report.reason}
                </p>
              </div>
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Info size={16} className="text-[#004EA1] mt-0.5" />
                <p className="text-[12px] text-[#004EA1] font-bold leading-snug">
                  <span className="block mb-1">💡 리스크 요인</span>
                  <span className="opacity-80 font-medium">{analysisData.riskFactor}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 tracking-tight">
                <BarChart3 size={18} className="text-[#004EA1]"/> 파트너사 점유 현황
              </h4>
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                <div className="w-40 h-40 relative mb-6">
                  <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    {partners.map((p, i) => {
                      const pct = (p.deals / (totalDeals || 1)) * 100;
                      const offset = -cumulativeOffset;
                      cumulativeOffset += pct;
                      return <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={p.color} strokeWidth="4.5" strokeDasharray={`${pct} 100`} strokeDashoffset={offset} className="transition-all duration-1000" />;
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-xl font-black text-slate-800">{totalDeals}건</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {partners.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:p.color}}/>{p.name}
                      </div>
                      <span className="text-[10px] font-black text-[#004EA1]">{p.deals}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. 제안 포인트 섹션 */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h4 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-6 text-center">Core Strengths for Proposal</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisData.strengths.map((str, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0095D8] flex items-center justify-center text-[12px] font-black">{i+1}</div>
                  <p className="text-xs font-bold leading-tight">{str}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 하단 버튼 */}
          <div className="pt-4">
            <button 
              onClick={onStartProposal} 
              className="w-full py-5 bg-[#004EA1] hover:bg-[#003d7e] text-white font-black rounded-3xl shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Mail size={22} />
              AI 맞춤형 전략 제안서 생성
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-4 font-medium">
              * 위 분석 리포트는 Daou Data의 내부 영업망 및 AI 크롤링 데이터를 기반으로 생성되었습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal_opportunity;