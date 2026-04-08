import React, { useState } from 'react';
import { User, Plus, X, BarChart3, Users, Calendar } from 'lucide-react';
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
  const [selectedContact, setSelectedContact] = useState(null);
  const [isManualInput, setIsManualInput] = useState(false);

  // ✅ 날짜 필터 상태 추가 (기본값 설정)
  const [startDate, setStartDate] = useState('2026-03-01'); 
  const [endDate, setEndDate] = useState('2026-08-31');

  // ✅ [로직 추가] 날짜 범위에 맞는 리포트만 필터링
  const filteredReports = reportData.filter(report => {
    const reportDate = new Date(report.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return reportDate >= start && reportDate <= end;
  });

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleContactSelect = (contact, isNew = false) => {
    setSelectedContact(contact);
    setIsManualInput(isNew);
    const companyName = selectedReport?.company || selectedReport?.name || targetPartner;
    generateAIContent(companyName, contact); 
  };

  const generateAIContent = (name, contact) => {
    const contactName = contact?.name || "담당자";
    setSelectedContact(contact); 
    setTargetPartner(name);

    let content = "";
    if (activeTab === 'upsell') {
      content = `제목: [기술협력] ${name} 시스템 고도화 및 ${selectedReport.targetSolution} 도입 제안\n\n안녕하세요, ${contactName}님.\n다우데이터 이다은입니다.\n\n현재 운용 중이신 ${selectedReport.currentSolution}을 분석한 결과...`;
    } else {
      content = `제목: [신규제안] ${name} ${contactName}님, ${selectedReport.title} 관련 솔루션 제안\n\n안녕하세요, ${contactName}님.\n다우데이터 이다은입니다.\n\n귀사의 비즈니스 경쟁력 강화를 위해 분석된...`;
    }
    
    setEmailContent(content);
    setProposalStep('write');
  };

  const handleSendEmail = async () => {
    const recipientEmail = selectedContact?.email;
    if (!recipientEmail) {
      alert("수신자 이메일 정보가 없습니다. 담당자를 선택하거나 직접 입력해주세요.");
      return;
    }

    try {
      const lines = emailContent.split('\n');
      const subject = lines[0].replace('제목: ', '').trim();
      const body = lines.slice(1).join('\n').trim();

      const response = await fetch("http://localhost:8000/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_email: recipientEmail,
          subject: subject,
          content: body
        }),
      });

      if (response.ok) {
        alert(`${recipientEmail}로 제안서가 전송되었습니다!`);
        closeAllModals();
      }
    } catch (error) {
      alert("전송 실패: " + error.message);
    }
  };

  const closeAllModals = () => {
    setSelectedReport(null);
    setProposalStep(null);
    setEmailContent('');
    setTargetPartner('');
    setSelectedContact(null); 
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
            {/* 통합된 컨트롤 패널 영역 */}
            <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
              {/* 상단: 키워드 설정 */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Plus size={14} className="text-[#0095D8]" /> 키워드 설정
                </h3>
                <div className="flex flex-wrap items-center gap-2 border-2 border-slate-200 rounded-xl p-2 bg-white focus-within:border-[#0095D8] transition-all">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#004EA1] border border-blue-100">
                      {tag} 
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} 
                    placeholder="검색어 입력 후 Enter..." 
                    className="outline-none text-sm flex-1 bg-transparent min-w-[150px] ml-1" 
                  />
                </div>
              </div>

              {/* 하단 가로 구분선 */}
              <div className="h-px bg-slate-200 mb-6 w-full" />

              {/* 하단: 분석 기간 설정 (키워드 설정 바로 아래 배치) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-[#0095D8]" /> 분석 기간
                  </h3>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="bg-transparent text-[12px] font-bold text-slate-600 outline-none cursor-pointer" 
                    />
                    <span className="text-slate-300 font-light">|</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="bg-transparent text-[12px] font-bold text-slate-600 outline-none cursor-pointer" 
                    />
                  </div>
                </div>
                
                {/* 검색 결과 요약 텍스트 */}
                <div className="text-[11px] font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                  현재 설정으로 <span className="text-[#0095D8] font-bold">{filteredReports.length}건</span>의 기회가 발견되었습니다.
                </div>
              </div>
            </div>

            {/* 리포트 카드 렌더링 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onDetail={(r) => setSelectedReport(r)} 
                    onProposal={(r) => { setSelectedReport(r); setProposalStep('select'); }} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">해당 기간 내에 검색된 공고가 없습니다.</p>
                </div>
              )}
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
        onContactSelect={handleContactSelect}
        targetPartner={targetPartner} 
        setTargetPartner={setTargetPartner}
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