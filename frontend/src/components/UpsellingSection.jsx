import React from 'react';
import { ArrowUpRight, FileText, Sparkles, Clock, Target, ChevronRight } from 'lucide-react';
import { upsellData, getDDay } from '../data';

const UpsellingSection = ({ onDetail, onProposal }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {upsellData.map((client) => {
        const dDay = getDDay(client.renewalDate);
        const isUrgent = dDay < 100;

        return (
          <div 
            key={client.id} 
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,78,161,0.1)] hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors ${isUrgent ? 'bg-red-500' : 'bg-[#004EA1]'}`}></div>

            <div className="flex justify-between items-start mb-5">
              <div className="space-y-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase shadow-sm ${
                  isUrgent ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {isUrgent ? <Clock size={10} strokeWidth={3} /> : <Target size={10} strokeWidth={3} />}
                  {isUrgent ? 'Urgent' : 'Stable'}
                </span>
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-[#004EA1] transition-colors leading-tight">
                  {client.company}
                </h4>
              </div>

              <div className="text-right bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-all">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">D-Day</p>
                <p className={`text-lg font-black tabular-nums ${isUrgent ? 'text-red-500' : 'text-slate-800'}`}>
                  D-{dDay}
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-between bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-[1.5rem] mb-5 border border-slate-200/50">
              <div className="relative z-10">
                <p className="text-[9px] text-slate-400 font-black mb-0.5 uppercase tracking-wider">Current</p>
                <p className="text-xs font-bold text-slate-600">{client.currentSolution}</p>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-[#004EA1]">
                  <ChevronRight size={14} strokeWidth={3} />
                </div>
              </div>

              <div className="relative z-10 text-right">
                <p className="text-[9px] text-[#0095D8] font-black mb-0.5 uppercase tracking-wider">Opportunity</p>
                <p className="text-xs font-black text-[#004EA1]">{client.targetSolution}</p>
              </div>
            </div>

            <div className="mb-6 px-1">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-1">
                <span className="font-black text-[#0095D8] mr-1">💡 Focus:</span> 
                {client.reason || "기존 인프라 노후화에 따른 신규 솔루션 전환 제안 시점."}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => onDetail(client)} 
                className="flex-[0.4] py-3 bg-white border border-slate-200 rounded-xl font-bold text-[12px] text-slate-600 hover:border-[#004EA1] hover:text-[#004EA1] transition-all flex items-center justify-center gap-1.5"
              >
                <FileText size={14} /> 분석
              </button>
              <button 
                onClick={() => onProposal(client)} 
                className="flex-1 py-3 bg-[#004EA1] text-white rounded-xl font-black text-[12px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> 맞춤 제안
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpsellingSection;