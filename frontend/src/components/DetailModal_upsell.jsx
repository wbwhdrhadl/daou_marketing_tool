import React from 'react';
import { X, RefreshCcw, ArrowRight, Mail, ShieldCheck, CheckCircle2, Users, Building2, Briefcase } from 'lucide-react';

const DetailModal_upsell = ({ report, onClose, onStartProposal }) => {
  if (!report) return null;

  // 추가된 가상 데이터 (데이터가 없을 경우를 대비한 기본값)
  const keyPersonnel = report.keyPersonnel || [
    { name: "김철수", position: "IT 본부장", dept: "전산팀", trait: "보안성 중시" },
    { name: "이영희", position: "팀장", dept: "디지털혁신팀", trait: "비용 효율성 중시" }
  ];

  const currentPartners = report.currentPartners || ["SK m&service", "LG CNS"];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex justify-center items-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* 상단 헤더 */}
        <div className="relative p-8 pb-10 overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex-shrink-0">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-emerald-100 uppercase tracking-tighter">Existing Customer</span>
                <span className="text-[10px] font-bold text-slate-400">Analysis Report</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {report.company || report.name}
              </h3>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white relative -mt-6 rounded-t-[2.5rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] overflow-y-auto">
          
          {/* 1. 업셀링 솔루션 브릿지 */}
          <section className="relative flex items-center gap-2">
            <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest text-center">Current</p>
              <p className="text-sm font-black text-slate-600 text-center">{report.currentSolution || "Citrix VDI"}</p>
            </div>
            <div className="z-10 bg-white p-2 rounded-full shadow-sm border border-slate-100 text-[#004EA1]">
              <ArrowRight size={16} />
            </div>
            <div className="flex-1 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-[#004EA1] mb-2 uppercase tracking-widest text-center">Upgrade</p>
              <p className="text-sm font-black text-[#004EA1] text-center">{report.targetSolution || "Nubo VMI"}</p>
            </div>
          </section>

          {/* 2. 핵심 이해관계자 (직원 정보) */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest px-1">
              <Users size={14} className="text-[#004EA1]"/> Key Personnel (의사결정권자)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keyPersonnel.map((person, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700">{person.name} {person.position}</p>
                    <p className="text-[10px] font-bold text-[#004EA1]">{person.dept} · {person.trait}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 파트너사 현황 */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest px-1">
              <Building2 size={14} className="text-[#004EA1]"/> Existing Partners
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentPartners.map((partner, idx) => (
                <span key={idx} className="px-4 py-2 bg-white text-slate-600 text-xs font-black rounded-xl border border-slate-200 shadow-sm">
                  {partner}
                </span>
              ))}
              <span className="px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl border border-dashed border-slate-300">
                + 파트너 데이터 분석 중
              </span>
            </div>
          </section>

          {/* 4. 전략 포인트 */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest px-1">
              <RefreshCcw size={14} className="text-[#004EA1]"/> Strategy Insights
            </h4>
            <div className="bg-[#004EA1]/5 p-5 rounded-3xl border border-[#004EA1]/10">
              <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                {report.businessStrategy || report.reason}
              </p>
            </div>
          </section>

          {/* 하단 버튼 */}
          <div className="pt-2">
            <button 
              onClick={onStartProposal} 
              className="w-full py-5 bg-[#004EA1] hover:bg-[#003d7e] text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3"
            >
              <Mail size={18} />
              분석 기반 제안 메일 작성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal_upsell;