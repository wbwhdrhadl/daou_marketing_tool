import React from 'react';
import { X, MessageSquare, Target, Mail } from 'lucide-react';

const DetailModal = ({ report, onClose, onStartProposal }) => {
  if (!report) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <p className="text-[11px] font-black text-[#0095D8] tracking-widest mb-1 uppercase">Analysis Report</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{report.company || report.name}</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-xl text-slate-400 border border-slate-100"><X size={20}/></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <div>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4"><MessageSquare size={18} className="text-[#004EA1]"/> AI 통합 분석</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {report.businessStrategy || report.summary || "상세 분석 데이터를 불러오는 중입니다."}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-400 mb-1">영업 성공 가능성</p>
              <p className="text-xl font-black text-[#004EA1]">{report.potential || 85}%</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 mb-1">추천 솔루션</p>
              <p className="text-sm font-black text-slate-700">{report.targetSolution || "Nubo VMI"}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <button onClick={onStartProposal} className="w-full py-4 bg-[#004EA1] text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-800 transition-all">
            이 리포트로 맞춤형 제안서 생성
          </button>
        </div>
      </div>
    </div>
  );
};
export default DetailModal;