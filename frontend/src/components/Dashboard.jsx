import React, { useState } from 'react';
import { User, Plus, X, BarChart3, Users } from 'lucide-react';
import { reportData, upsellData } from '../data'; 

import ReportCard from './ReportCard';    
import DetailModal from './DetailModal';    
import ProposalModal from './ProposalModal'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('market'); 
  const [tags, setTags] = useState(['VDI', 'Cloud Migration', 'Network Security']);
  const [inputValue, setInputValue] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [proposalStep, setProposalStep] = useState(null);
  const [targetPartner, setTargetPartner] = useState('');
  const [emailContent, setEmailContent] = useState('');
  // ✅ 선택된 담당자 정보를 저장할 상태 추가
  const [selectedContact, setSelectedContact] = useState(null);

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const generateAIContent = (name, contact, isUpsell = false) => {
    const contactName = contact ? contact.name : "담당자";
    setTargetPartner(name);
    // ✅ 클릭한 담당자 객체(이름, 이메일 등)를 상태에 저장
    setSelectedContact(contact);
    
    const content = isUpsell 
      ? `제목: [기술협력] ${name} 기존 시스템 고도화 및 ${selectedReport.targetSolution} 도입 제안\n\n안녕하세요, ${contactName}님.\n다우데이타 이다은입니다.\n\n현재 운용 중이신 ${selectedReport.currentSolution}에 AI 자동화 기능을 더한 ${selectedReport.targetSolution}을 제안드립니다.\n\n분석 결과, ${selectedReport.aiReason} 측면에서 큰 시너지가 예상됩니다.\n\n상세 내용을 검토해 주시면 감사하겠습니다.`
      : `제목: [신규제안] ${selectedReport.title} 관련 협업 제안\n\n안녕하세요, ${name} ${contactName}님.\n다우데이타 이다은입니다.\n\n최근 분석된 시장 기회 자료에 따르면 ${name}와 협력할 수 있는 좋은 기회가 있어 연락드렸습니다.`;
    
    setEmailContent(content);
    setProposalStep('write');
  };

  // ✅ 실제 백엔드로 메일을 쏘는 함수
  const handleSendEmail = async () => {
    if (!selectedContact?.email) {
      alert("수신자 메일 주소를 찾을 수 없습니다.");
      return;
    }

    try {
      // 텍스트 내용에서 제목과 본문을 분리 (제목: 으로 시작하는 첫 줄 추출)
      const lines = emailContent.split('\n');
      const subject = lines[0].replace('제목: ', '').trim();
      const body = lines.slice(1).join('\n').trim();

      const response = await fetch("http://localhost:8000/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_email: selectedContact.email,
          subject: subject || "[다우데이타] 제안 메일",
          content: body
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${selectedContact.name} 담당자님께 메일을 성공적으로 보냈습니다!`);
        closeAllModals();
      } else {
        alert(`❌ 전송 실패: ${result.detail}`);
      }
    } catch (error) {
      console.error("전송 에러:", error);
      alert("서버 연결 실패. 백엔드가 켜져 있는지 확인하세요.");
    }
  };

  const closeAllModals = () => {
    setSelectedReport(null);
    setProposalStep(null);
    setEmailContent('');
    setTargetPartner('');
    setSelectedContact(null); // ✅ 연락처 초기화
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
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
        <div className="flex gap-4 mb-8 border-b border-slate-100 pb-4">
          <button 
            onClick={() => { setActiveTab('market'); closeAllModals(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'market' ? 'bg-[#0095D8] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <BarChart3 size={18} /> 시장 기회 발굴
          </button>
          <button 
            onClick={() => { setActiveTab('upsell'); closeAllModals(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'upsell' ? 'bg-[#004EA1] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Users size={18} /> 기존 고객 Upselling
          </button>
        </div>

        {activeTab === 'market' && (
          <>
            <div className="mb-10 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16} /> 키워드 관리</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex flex-wrap items-center gap-2 border-2 border-slate-200 rounded-lg p-2 bg-white">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold text-[#004EA1] border border-blue-100">
                      {tag} <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 ml-1"><X size={14} /></button>
                    </span>
                  ))}
                  <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} placeholder="검색어 입력..." className="outline-none text-sm flex-1 bg-transparent" />
                </div>
                <button onClick={handleAddTag} className="bg-[#0095D8] text-white px-8 py-2.5 rounded-lg text-sm font-bold">추가</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reportData.map((report) => (
                <ReportCard key={report.id} report={report} onDetail={(r) => setSelectedReport(r)} onProposal={(r) => { setSelectedReport(r); setProposalStep('select'); }} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'upsell' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upsellData.map((client) => (
              <div key={client.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg text-xs font-bold">AI 추천: {client.potential}%</div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">{client.company}</h4>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">{client.status}</span>
                  <span className="text-[10px] text-slate-400">마지막 컨택: {client.lastContact}</span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold">현재 사용 중</p>
                      <p className="text-sm font-medium">{client.currentSolution}</p>
                    </div>
                    <div className="text-blue-500 font-black">→</div>
                    <div className="text-right">
                      <p className="text-[11px] text-blue-600 font-bold">업셀링 제안</p>
                      <p className="text-sm font-bold text-blue-700">{client.targetSolution}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs leading-relaxed text-blue-900 font-medium">
                      <span className="font-bold mr-1">💡 AI 분석:</span> {client.aiReason}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedReport(client); setProposalStep('select'); }}
                  className="w-full py-3 bg-[#004EA1] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors"
                >
                  맞춤형 업셀링 제안서 작성
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onStartProposal={() => setProposalStep('select')} />
      
      <ProposalModal 
        step={proposalStep} 
        setStep={setProposalStep} 
        report={selectedReport}
        targetPartner={targetPartner} 
        setTargetPartner={setTargetPartner}
        // ✅ activeTab에 따라 업셀링 여부를 함수에 전달
        generateAIContent={(name, contact) => generateAIContent(name, contact, activeTab === 'upsell')}
        emailContent={emailContent} 
        setEmailContent={setEmailContent}
        onClose={closeAllModals} 
        onFinish={handleSendEmail}
      />
    </div>
  );
};

export default Dashboard;