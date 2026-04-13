import React from 'react';
import { ArrowUpRight, TrendingUp, FileText, Sparkles, Clock, Target, ChevronRight } from 'lucide-react';
import { upsellData, getDDay } from '../data';

const UpsellingSection = ({ onDetail, onProposal }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {upsellData.map((client) => {
        const dDay = getDDay(client.renewalDate);
        const isUrgent = dDay < 100;

        return (
          <div 
            key={client.id} 
            className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,78,161,0.15)] hover:-translate-y-2 overflow-hidden"
          >
            {/* 우측 상단 배경 장식 (패턴) */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${isUrgent ? 'bg-red-500' : 'bg-[#004EA1]'}`}></div>

            {/* 헤더 섹션: 상태 태그 및 D-Day */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase shadow-sm ${
                    isUrgent ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {isUrgent ? <Clock size={12} strokeWidth={3} /> : <Target size={12} strokeWidth={3} />}
                    {isUrgent ? 'Renewal Urgent' : 'Stable Status'}
                  </span>
                </div>
                <h4 className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-[#004EA1] transition-colors">
                  {client.company}
                </h4>
              </div>

              <div className="text-right bg-slate-50 px-5 py-3 rounded-[1.5rem] border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Expiration</p>
                <p className={`text-2xl font-black tabular-nums ${isUrgent ? 'text-red-500' : 'text-slate-800'}`}>
                  D-{dDay}
                </p>
              </div>
            </div>

            {/* 메인 비주얼: 업셀링 브릿지 */}
            <div className="relative flex items-center justify-between bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 rounded-[2.5rem] mb-8 border border-slate-200/50 overflow-hidden">
              {/* 화살표 배경 효과 */}
              <ArrowUpRight size={100} className="absolute -right-4 -bottom-4 text-slate-200/30 -rotate-12 transition-transform group-hover:scale-110 group-hover:text-[#004EA1]/10" />
              
              <div className="relative z-10">
                <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-wider">Current</p>
                <p className="text-lg font-bold text-slate-600">{client.currentSolution}</p>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#004EA1] group-hover:scale-110 transition-transform">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>

              <div className="relative z-10 text-right">
                <p className="text-[10px] text-[#0095D8] font-black mb-1 uppercase tracking-wider">Opportunity</p>
                <p className="text-lg font-black text-[#004EA1]">{client.targetSolution}</p>
              </div>
            </div>

            {/* 하단 정보 요약: 간단한 인공지능 요약 코멘트 느낌 */}
            <div className="mb-8 px-2">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                <span className="font-black text-[#0095D8]">💡 전략포인트:</span> {client.reason || "기존 인프라 노후화에 따른 고성능 가상화 솔루션 전환 제안 가능성 높음."}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-4">
              <button 
                onClick={() => onDetail(client)} 
                className="flex-[0.4] py-5 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-600 hover:border-[#004EA1] hover:text-[#004EA1] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={18} /> 분석
              </button>
              <button 
                onClick={() => onProposal(client)} 
                className="flex-1 py-5 bg-[#004EA1] hover:bg-[#003d7e] text-white rounded-[1.5rem] font-black text-sm shadow-[0_15px_30px_-10px_rgba(0,78,161,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,78,161,0.4)] transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Sparkles size={18} className="group-hover:animate-pulse" /> 
                맞춤형 제안 발송
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpsellingSection;