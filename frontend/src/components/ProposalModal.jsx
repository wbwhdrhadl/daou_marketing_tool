import React from 'react';
import { Mail, User, FileText, ChevronRight, Send, X } from 'lucide-react';

const ProposalModal = ({ 
  step, setStep, report, targetPartner, setTargetPartner, 
  generateAIContent, emailContent, setEmailContent, onClose, onFinish 
}) => {
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Step 1: 유형 선택 */}
        {step === 'select' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#004EA1] rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail size={32} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">제안 대상을 선택해주세요</h3>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setStep('partner_list')} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group">
                <User size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                <span className="block font-bold text-slate-700">파트너사 제안</span>
                <span className="text-[10px] text-slate-400 uppercase">Collab & Profit</span>
              </button>
              <button onClick={() => { setTargetPartner('고객사'); generateAIContent('고객사'); }} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group">
                <FileText size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                <span className="block font-bold text-slate-700">고객사 제안</span>
                <span className="text-[10px] text-slate-400 uppercase">Direct Sales</span>
              </button>
            </div>
            <button onClick={onClose} className="mt-8 text-xs font-bold text-slate-400">닫기</button>
          </div>
        )}

        {/* Step 2: 파트너 리스트 */}
        {step === 'partner_list' && (
          <div className="p-10">
            <h3 className="text-xl font-black text-slate-800 mb-6 text-center">협업할 파트너사를 선택하세요</h3>
            <div className="space-y-3 mb-8">
              {report?.partners?.map((p, i) => (
                <button key={i} onClick={() => { setTargetPartner(p.name); setStep('contact_list'); }} className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                    <span className="font-bold text-slate-700">{p.name}</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <input type="text" placeholder="기업명 입력..." value={targetPartner} onChange={(e) => setTargetPartner(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <button onClick={() => generateAIContent(targetPartner)} disabled={!targetPartner.trim()} className="bg-[#004EA1] text-white px-6 rounded-xl font-bold text-sm disabled:opacity-50">선택</button>
            </div>
            <button onClick={() => setStep('select')} className="w-full mt-8 text-xs font-bold text-slate-400">이전으로</button>
          </div>
        )}

        {/* Step 2.5: 담당자 리스트 */}
        {step === 'contact_list' && (
          <div className="p-10">
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold text-[#004EA1] bg-blue-50 px-2 py-1 rounded tracking-widest">{targetPartner}</span>
              <h3 className="text-xl font-black text-slate-800 mt-2">연락하실 담당자를 선택하세요</h3>
            </div>
            <div className="space-y-3 mb-8">
              {report?.partners?.find(p => p.name === targetPartner)?.contacts?.map((contact, i) => (
                <button 
                  key={i} 
                  // ✅ 클릭 시 contact 객체 전체를 generateAIContent로 넘김
                  onClick={() => generateAIContent(targetPartner, contact)} 
                  className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group text-left"
                >
                  <div>
                    <div className="font-bold text-slate-700 group-hover:text-[#004EA1]">{contact.name}</div>
                    <div className="text-xs text-slate-400">{contact.dept} | {contact.email}</div>
                  </div>
                  <Send size={16} className="text-slate-300" />
                </button>
              )) || <p className="text-center text-slate-400 text-sm py-10">등록된 담당자가 없습니다.</p>}
            </div>
            <button onClick={() => setStep('partner_list')} className="w-full text-xs font-bold text-slate-400">이전으로</button>
          </div>
        )}

        {/* Step 3: 메일 작성 */}
        {step === 'write' && (
          <div className="flex flex-col h-[600px]">
            <div className="bg-[#004EA1] p-6 text-white flex justify-between items-center">
              <span className="text-sm font-bold flex items-center gap-2"><Mail size={16} /> 제안 메일 초안 작성</span>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              {/* 사용자가 수정할 수 있도록 textarea 연결 */}
              <textarea 
                value={emailContent} 
                onChange={(e) => setEmailContent(e.target.value)} 
                className="flex-1 w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-all" 
              />
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep('select')} className="px-6 py-3.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">처음부터</button>
                {/* ✅ onFinish가 이제 Dashboard의 handleSendEmail을 실행함 */}
                <button 
                  onClick={onFinish} 
                  className="flex-1 py-3.5 bg-[#004EA1] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> 메일 보내기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalModal;