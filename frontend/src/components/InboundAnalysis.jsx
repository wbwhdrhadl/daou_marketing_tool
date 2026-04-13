import React from 'react';
import { Target, Clock, Building2, Mail, ChevronRight, Zap, Eye } from 'lucide-react';
import { inboundLeads } from '../data';

const InboundAnalysis = ({ onDetail, onProposal }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-[#004EA1] to-[#0095D8] p-8 rounded-[2rem] text-white flex items-center gap-6 shadow-xl">
        <div className="bg-white/20 p-4 rounded-2xl"><Target size={32} /></div>
        <div>
          <h3 className="font-black text-2xl tracking-tight">실시간 인바운드 리드 분석</h3>
          <p className="text-blue-50 text-sm opacity-90">AI가 선별한 고가치 잠재 리드입니다.</p>
        </div>
      </div>

      {inboundLeads.map((lead) => (
        <div key={lead.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:border-[#0095D8] transition-all flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/4 border-r border-slate-100 pr-10">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${lead.status === 'HOT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-[#004EA1]'}`}>{lead.status}</span>
            <h4 className="text-2xl font-black text-slate-800 mt-4 mb-2 flex items-center gap-2"><Building2 size={24} /> {lead.company}</h4>
            <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={16} /> {lead.email}</p>
          </div>
          
          <div className="lg:w-2/4">
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              {lead.visitPath.map((path, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-xs bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-slate-600 border border-slate-100">{path}</span>
                  {idx < lead.visitPath.length - 1 && <ChevronRight size={16} className="text-slate-200" />}
                </React.Fragment>
              ))}
            </div>
            <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-dashed border-blue-200">
              <p className="text-sm text-slate-700 font-medium">
                <span className="font-black text-[#0095D8] mr-2 inline-flex items-center gap-1"><Zap size={14} /> AI Insights:</span>
                {lead.reason}
              </p>
            </div>
          </div>

          <div className="lg:w-1/4 flex flex-col justify-center gap-4">
            <button onClick={() => onDetail(lead)} className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm hover:border-[#0095D8] flex items-center justify-center gap-2 transition-all"><Eye size={18} /> 행동 리포트</button>
            <button onClick={() => onProposal(lead)} className="w-full py-4 bg-[#004EA1] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all">맞춤 제안서 발송</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InboundAnalysis;