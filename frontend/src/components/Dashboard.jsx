import React, { useState, useEffect } from 'react';
import { User, Plus, X, BarChart3, Users, Calendar, Search, Loader2, Terminal } from 'lucide-react';
import { upsellData } from '../data'; 

import ReportCard from './ReportCard';    
import DetailModal from './DetailModal';    
import ProposalModal from './ProposalModal'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('market'); 
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [proposalStep, setProposalStep] = useState(null);
  const [targetPartner, setTargetPartner] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isManualInput, setIsManualInput] = useState(false);
  
  const [startDate, setStartDate] = useState('2026-01-01'); 
  const [endDate, setEndDate] = useState('2026-12-31');

  const [realReports, setRealReports] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState('대기 중...');

  // ✅ [API 호출 및 데이터 결합]
  const handleSearch = async () => {
    if (tags.length === 0) {
      setDebugLog('❌ 에러: 키워드를 입력해주세요.');
      return;
    }

    const searchKeyword = tags.join(',');
    setIsLoading(true);
    setDebugLog(`🔍 요청 시작: 키워드 [${searchKeyword}]로 백엔드 분석 요청 중...`);

    try {
      const response = await fetch(`http://localhost:8000/api/news/naver/${encodeURIComponent(searchKeyword)}`);
      
      if (!response.ok) {
        throw new Error(`서버 응답 에러 (${response.status})`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const fixedPartners = [
          { 
            name: '티맥스클라우드', deals: 15, color: '#004EA1',
            contacts: [
              { name: '이다은 사원', email: 'ldaeundev@gmail.com', dept: '가상화사업팀' },
              { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
            ]
          },
          { 
            name: '나무기술', deals: 10, color: '#006FFF',
            contacts: [
              { name: '김철수 팀장', email: 'cs.kim@namutech.co.kr', dept: '전략사업본부' },
              { name: '박용훈 대리', email: 'yh.park@namutech.co.kr', dept: '인프라팀' }
            ] 
          },
          { 
            name: '안랩', deals: 5, color: '#009DFF',
            contacts: [
              { name: '최보안 팀장', email: 'security@ahnlab.com', dept: '엔드포인트사업부' }
            ] 
          },
        ];

        const processedResults = data.results
          .map(report => ({
            ...report,
            partners: fixedPartners
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // 🔥 최신순 정렬 추가

        setRealReports(processedResults);
        setDebugLog(`✅ 성공: ${data.results.length}개의 리포트를 최신순으로 가져왔습니다.`);

        // API 결과물에 partners 필드를 추가하여 상태 업데이트
        const enrichedResults = data.results.map(report => ({
          ...report,
          partners: fixedPartners
        }));

        setRealReports(enrichedResults);
        setDebugLog(`✅ 성공: ${data.results.length}개의 분석 리포트와 파트너사 데이터를 매칭했습니다.`);
      } else {
        setRealReports([]);
        setDebugLog('⚠️ 결과 없음: 분석하기에 적절한 뉴스가 없습니다.');
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setDebugLog(`❌ 실패: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 displayReports 부분을 아래와 같이 확인
  const displayReports = realReports
    .filter(report => {
      const rDate = new Date(report.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return rDate >= start && rDate <= end;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 🔥 필터링 후에도 최신순 유지

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

  const generateAIContent = async (name, contact) => {
    const contactName = contact?.name || "담당자";
    setSelectedContact(contact);
    setTargetPartner(name);
    
    // 1. 로딩 상태 표시 (사용자 경험을 위해 중요!)
    setDebugLog(`🤖 Gemini가 ${name} 담당자님께 보낼 맞춤형 제안서를 작성 중입니다...`);
    setProposalStep('write'); // 먼저 화면을 전환하고
    setEmailContent("AI가 제안서를 작성하고 있습니다. 잠시만 기다려주세요..."); // 플레이스홀더 표시

    try {
      // 2. 뉴스 내용과 솔루션 매칭 로직 (간단한 예시)
      let suggestedSolution = "Citrix VDI"; // 기본값
      const title = selectedReport.title || "";
      
      if (title.includes('보안') || title.includes('망분리')) {
        suggestedSolution = "Nubo VMI (가상 모바일 인프라)";
      } else if (title.includes('트래픽') || title.includes('가속') || title.includes('부하')) {
        suggestedSolution = "NetScaler (ADC/Load Balancer)";
      }

      // 3. 백엔드 API 호출
      const response = await fetch("http://localhost:8000/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedReport.title,
          summary: selectedReport.summary,
          partner_name: name,
          contact_name: contactName,
          solution_type: suggestedSolution,
          is_upsell: activeTab === 'upsell',
          // 업셀링일 경우 현재 솔루션 정보도 함께 전달
          current_solution: selectedReport.currentSolution || ""
        }),
      });

      if (!response.ok) throw new Error("AI 제안서 생성 실패");

      const data = await response.json();
      
      // 4. Gemini가 생성한 결과물 주입
      setEmailContent(data.content);
      setDebugLog(`✅ ${name} 맞춤형 제안서 생성 완료!`);

    } catch (error) {
      console.error("AI Generation Error:", error);
      setEmailContent("죄송합니다. 제안서를 생성하는 중에 오류가 발생했습니다. 내용을 직접 수정해주세요.");
      setDebugLog(`❌ 에러 발생: ${error.message}`);
    }
  };

  const handleSendEmail = async () => {
    const recipientEmail = selectedContact?.email;
    if (!recipientEmail) {
      alert("수신자 이메일 정보가 없습니다.");
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
          <div className="bg-slate-100 p-2 rounded-full border border-slate-200">
            <User size={20} className="text-[#0095D8]" />
          </div>
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
            <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
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

              <div className="h-px bg-slate-200 mb-6 w-full" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-[#0095D8]" /> 분석 기간
                  </h3>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[12px] font-bold text-slate-600 outline-none" />
                    <span className="text-slate-300 font-light">|</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[12px] font-bold text-slate-600 outline-none" />
                  </div>
                </div>
                
                <button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-[#004EA1] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md disabled:bg-slate-300"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  기회 분석 실행
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 bg-slate-800 text-slate-300 p-2.5 rounded-lg font-mono text-[11px]">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">[Status]</span>
                <span>{debugLog}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayReports.length > 0 ? (
                displayReports.map((report) => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onDetail={(r) => setSelectedReport(r)} 
                    onProposal={(r) => { setSelectedReport(r); setProposalStep('select'); }} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">
                    {isLoading ? "AI가 뉴스를 분석 중입니다..." : "분석 실행 버튼을 클릭하여 데이터를 가져오세요."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'upsell' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upsellData.map((client) => (
              <div key={client.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg bg-white relative overflow-hidden">
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

      {selectedReport && !proposalStep && (
        <DetailModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
          onStartProposal={() => setProposalStep('select')} 
        />
      )}
      
      <ProposalModal 
        step={proposalStep} 
        setStep={setProposalStep} 
        report={selectedReport}
        onContactSelect={handleContactSelect}
        targetPartner={targetPartner} 
        setTargetPartner={setTargetPartner}
        generateAIContent={(name, contact) => generateAIContent(name, contact)}
        emailContent={emailContent} 
        setEmailContent={setEmailContent}
        onClose={closeAllModals} 
        onFinish={handleSendEmail}
      />
    </div>
  );
};

export default Dashboard;