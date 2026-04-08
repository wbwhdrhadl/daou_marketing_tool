import React, { useState } from 'react';
import { Mail, User, FileText, ChevronRight, Send, X } from 'lucide-react';
import { companyDB } from '../data'; 

const ProposalModal = ({ 
  step, setStep, report, targetPartner, setTargetPartner, 
  generateAIContent, emailContent, setEmailContent, onClose, onFinish 
}) => {
  const [manualContact, setManualContact] = useState({ name: '', email: '' });

  if (!step) return null;

  const companyInfo = companyDB[report?.company];
  const clientContacts = companyInfo?.contacts || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Step 1: 유형 선택 */}
        {step === 'select' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#004EA1] rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail size={32} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">제안 대상을 선택해주세요</h3>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {/* 1. 파트너사 제안 */}
              <button onClick={() => setStep('partner_list')} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group">
                <User size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                <span className="block font-bold text-slate-700">파트너사 제안</span>
                <span className="text-[10px] text-slate-400 uppercase">Collab & Profit</span>
              </button>
              
              {/* 2. 고객사 제안 */}
              <button onClick={() => {
                setTargetPartner(report.company); 
                setStep('client_contact_select');
              }} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group">
                <FileText size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                <span className="block font-bold text-slate-700">고객사 제안</span>
                <span className="text-[10px] text-slate-400 uppercase">Direct Sales</span>
              </button>
            </div>
            <button onClick={onClose} className="mt-8 text-xs font-bold text-slate-400">닫기</button>
          </div>
        )}

        {/* ✅ [동적 로직 적용] 고객사 담당자 선택 Step */}
        {step === 'client_contact_select' && (
          <div className="p-10">
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold text-[#004EA1] bg-blue-50 px-3 py-1 rounded-full uppercase">Target: {report.company}</span>
              <h3 className="text-xl font-black text-slate-800 mt-2">고객사 담당자를 선택하세요</h3>
            </div>
            
            <div className="space-y-3 mb-6 max-h-[180px] overflow-y-auto pr-2">
              {clientContacts.length > 0 ? (
                clientContacts.map((contact, i) => (
                  <button 
                    key={i} 
                    onClick={() => generateAIContent(report.company, contact)} 
                    className="w-full flex items-center justify-between p-4 border-2 border-slate-50 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group text-left"
                  >
                    <div>
                      <div className="font-bold text-slate-700 group-hover:text-[#004EA1]">{contact.name}</div>
                      <div className="text-xs text-slate-400">{contact.dept} | {contact.email}</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                ))
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl text-sm text-slate-400">
                  등록된 고객사 담당자가 없습니다.
                </div>
              )}
            </div>

            {/* 수동 입력 폼 (DB에 없을 경우 대비) */}
            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="text" placeholder="성함" value={manualContact.name} onChange={(e) => setManualContact({...manualContact, name: e.target.value})} className="px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-[#004EA1]" />
                <input type="email" placeholder="이메일" value={manualContact.email} onChange={(e) => setManualContact({...manualContact, email: e.target.value})} className="px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-[#004EA1]" />
              </div>
              <button onClick={() => generateAIContent(report.company, manualContact)} disabled={!manualContact.name || !manualContact.email} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-sm disabled:opacity-30">신규 메일 주소로 제안서 생성</button>
            </div>
            <button onClick={() => setStep('select')} className="w-full mt-4 text-xs font-bold text-slate-400 text-center">이전으로</button>
          </div>
        )}
        
        {/* ✅ 파트너 리스트 Step (기존 유지) */}
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
            <button onClick={() => setStep('select')} className="w-full text-xs font-bold text-slate-400 text-center">이전으로</button>
          </div>
        )}

        {/* ✅ 파트너사 담당자 리스트 Step (기존 유지) */}
        {step === 'contact_list' && (
          <div className="p-10">
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold text-[#004EA1] bg-blue-50 px-2 py-1 rounded tracking-widest">{targetPartner}</span>
              <h3 className="text-xl font-black text-slate-800 mt-2">파트너사 담당자를 선택하세요</h3>
            </div>
            <div className="space-y-3 mb-8">
              {report?.partners?.find(p => p.name === targetPartner)?.contacts?.map((contact, i) => (
                <button key={i} onClick={() => generateAIContent(targetPartner, contact)} className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group text-left">
                  <div>
                    <div className="font-bold text-slate-700 group-hover:text-[#004EA1]">{contact.name}</div>
                    <div className="text-xs text-slate-400">{contact.dept} | {contact.email}</div>
                  </div>
                  <Send size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep('partner_list')} className="w-full text-xs font-bold text-slate-400 text-center">이전으로</button>
          </div>
        )}

        {/* Step 3: 메일 작성 (기존 유지) */}
        {step === 'write' && (
          <div className="flex flex-col h-[600px]">
            <div className="bg-[#004EA1] p-6 text-white flex justify-between items-center">
              <span className="text-sm font-bold flex items-center gap-2"><Mail size={16} /> 제안 메일 초안 작성</span>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              <textarea 
                value={emailContent} 
                onChange={(e) => setEmailContent(e.target.value)} 
                className="flex-1 w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner" 
              />
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep('select')} className="px-6 py-3.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">처음부터</button>
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