import React, { useState } from 'react';
import MarketOpportunity from './MarketOpportunity';
import UpsellingSection from './UpsellingSection';
import InboundAnalysis from './InboundAnalysis';
import MailManage from './MailManage';
import DetailModal_opportunity from './DetailModal_opportunity';
import DetailModal_upsell from './DetailModal_upsell';
import ProposalModal from './ProposalModal'; 
import DetailModal_inbound from './DetailModal_inbound'; 
import { User, BarChart3, Users, MousePointerClick, Mail } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('market'); 
  const [selectedReport, setSelectedReport] = useState(null);
  const [proposalStep, setProposalStep] = useState(null);
  const [targetPartner, setTargetPartner] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [startDate, setStartDate] = useState(''); // '2026-01-01' -> ''
  const [endDate, setEndDate] = useState('');     // '2026-12-31' -> ''

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    const companyName = selectedReport?.company || selectedReport?.name || targetPartner;
    generateAIContent(companyName, contact); 
  };

  const generateAIContent = async (name, contact) => {
    setProposalStep('write');
    setEmailContent("AI가 제안서를 작성하고 있습니다...");
    try {
      const response = await fetch("http://localhost:8000/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedReport?.title || "영업 제안",
          summary: selectedReport?.reason || selectedReport?.summary || selectedReport?.businessStrategy,
          partner_name: name,
          contact_name: contact?.name || "담당자",
          solution_type: selectedReport?.targetSolution || "Nubo VMI",
          is_upsell: activeTab === 'upsell'
        }),
      });
      const data = await response.json();
      setEmailContent(data.content);
    } catch (error) {
      setEmailContent("제안서 생성 중 오류가 발생했습니다.");
    }
  };

  const closeAllModals = () => {
    setSelectedReport(null);
    setProposalStep(null);
    setEmailContent('');
    setSelectedContact(null); 
  };

  const handleOpenProposal = (report) => {
    setSelectedReport(report);
    setProposalStep('select');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto flex items-center justify-between bg-white px-8 py-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#0095D8] text-white p-2 rounded-lg font-black text-xl tracking-tighter shadow-blue-100 shadow-lg">DAOU</div>
          <div className="h-6 w-[2px] bg-slate-200 mx-1"></div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">Marketing Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
            <p className="text-sm font-black text-slate-700">이다은 님</p>
          </div>
          <div className="bg-gradient-to-tr from-[#0095D8] to-[#004EA1] p-2.5 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform">
            <User size={20} className="text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-[2.5rem] shadow-inner border border-slate-200/50">
            {[
              { id: 'market', icon: <BarChart3 size={19} />, label: '시장 기회 발굴' },
              { id: 'upsell', icon: <Users size={19} />, label: '기존 고객 Upselling' },
              { id: 'inbound', icon: <MousePointerClick size={19} />, label: '인바운드 리드 분석' },
              { id: 'mailManage', icon: <Mail size={19} />, label: '제안메일 분석' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); closeAllModals(); }}
                  className={`relative flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-[2rem] font-black text-[15px] transition-all duration-300 ${isActive ? 'text-[#004EA1]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {isActive && <div className="absolute inset-0 bg-white rounded-[1.8rem] shadow-lg animate-in fade-in zoom-in-95 duration-200" />}
                  <span className={`relative z-10 ${isActive ? 'text-[#004EA1]' : 'text-slate-400'}`}>{tab.icon}</span>
                  <span className="relative z-10 tracking-tight whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[600px]">
          {activeTab === 'market' && (
            <MarketOpportunity 
              onDetail={setSelectedReport} 
              onProposal={handleOpenProposal}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
            />
          )}
          {activeTab === 'upsell' && <UpsellingSection onDetail={setSelectedReport} onProposal={handleOpenProposal} />}
          {activeTab === 'inbound' && <InboundAnalysis onDetail={setSelectedReport} onProposal={handleOpenProposal} />}
          {activeTab === 'mailManage' && <MailManage />}
        </div>
      </main>

      {/* --- 핵심 수정: 탭별 모달 분기 로직 --- */}
      {selectedReport && !proposalStep && (
  <>
    {/* 1. 시장 기회 발굴 탭 모달 */}
    {activeTab === 'market' && (
      <DetailModal_opportunity 
        report={selectedReport} 
        onClose={closeAllModals} 
        onStartProposal={() => setProposalStep('select')} 
      />
    )}

    {/* 2. 기존 고객 Upselling 탭 모달 */}
    {activeTab === 'upsell' && (
      <DetailModal_upsell 
        report={selectedReport} 
        onClose={closeAllModals} 
        onStartProposal={() => setProposalStep('select')} 
      />
    )}

    {/* 3. 인바운드 리드 분석 탭 모달 */}
    {activeTab === 'inbound' && (
      <DetailModal_inbound 
        report={selectedReport} 
        onClose={closeAllModals} 
        onStartProposal={() => setProposalStep('select')} 
      />
    )}
  </>
)}
      
      <ProposalModal 
        step={proposalStep} 
        setStep={setProposalStep} 
        report={selectedReport}
        onContactSelect={handleContactSelect} 
        targetPartner={targetPartner} 
        setTargetPartner={setTargetPartner} 
        generateAIContent={generateAIContent}
        emailContent={emailContent} 
        setEmailContent={setEmailContent}
        onClose={closeAllModals} 
        onFinish={() => { alert('발송되었습니다!'); closeAllModals(); }}
      />
    </div>
  );
};

export default Dashboard;