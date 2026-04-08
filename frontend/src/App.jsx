import React, { useState } from 'react';
import { User, Plus, X } from 'lucide-react';
import { reportData } from './data';
import ReportCard from './components/ReportCard';
import DetailModal from './components/DetailModal';
import ProposalModal from './components/ProposalModal';

const Dashboard = () => {
  const [tags, setTags] = useState(['VDI', 'Cloud Migration', 'Network Security']);
  const [inputValue, setInputValue] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [proposalStep, setProposalStep] = useState(null);
  const [targetPartner, setTargetPartner] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const generateAIContent = (partnerName, contact) => {
    const contactName = contact ? contact.name : "담당자";
    setTargetPartner(partnerName);
    setSelectedContact(contact);
    const content = `제목: [${selectedReport.title}] 관련 협업 제안의 건\n\n안녕하세요, ${partnerName} ${contactName}님.\n다우데이터 가상화 사업팀 이다은입니다.\n\n최근 분석된 [${selectedReport.keywords[0]}] 프로젝트와 관련하여... (중략) ...\n\n감사합니다.\n이다은 드림`;
    setEmailContent(content);
    setProposalStep('write');
  };

  const closeAllModals = () => {
    setSelectedReport(null);
    setProposalStep(null);
    setEmailContent('');
    setTargetPartner('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900 relative">
      <header className="flex items-center justify-between bg-white px-6 py-4 rounded-t-2xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#0095D8] text-white p-1.5 rounded font-black text-xl">DAOUDATA</div>
          <span className="font-extrabold text-[#0095D8] tracking-tight text-lg uppercase">Marketing AI Tool</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">이다은 님</span>
          <div className="bg-slate-100 p-2 rounded-full border border-slate-200"><User size={20} className="text-[#0095D8]" /></div>
        </div>
      </header>

      <div className="bg-white p-8 rounded-b-2xl shadow-md">
        <div className="mb-10 bg-slate-50 p-5 rounded-xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16} /> 키워드 관리</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-wrap items-center gap-2 border-2 border-slate-200 rounded-lg p-2 bg-white">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold text-[#004EA1] border border-blue-100">
                  {tag} <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 ml-1"><X size={14} /></button>
                </span>
              ))}
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} placeholder="검색어 입력 후 Enter..." className="outline-none text-sm flex-1 min-w-[150px] bg-transparent" />
            </div>
            <button onClick={handleAddTag} className="bg-[#0095D8] text-white px-8 py-2.5 rounded-lg text-sm font-bold">추가</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportData.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onDetail={(r) => setSelectedReport(r)} 
              onProposal={(r) => { setSelectedReport(r); setProposalStep('select'); }} 
            />
          ))}
        </div>
      </div>

      <DetailModal 
        report={selectedReport} 
        onClose={() => setSelectedReport(null)} 
        onStartProposal={() => setProposalStep('select')} 
      />

      <ProposalModal 
        step={proposalStep}
        setStep={setProposalStep}
        report={selectedReport}
        targetPartner={targetPartner}
        setTargetPartner={setTargetPartner}
        generateAIContent={generateAIContent}
        emailContent={emailContent}
        setEmailContent={setEmailContent}
        onClose={closeAllModals}
        onFinish={() => { alert(`${targetPartner}님께 전송 완료!`); closeAllModals(); }}
      />
    </div>
  );
};

export default Dashboard;