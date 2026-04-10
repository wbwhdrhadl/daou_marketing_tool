import React, { useState } from 'react';
import { 
  User, Plus, X, BarChart3, Users, Calendar, Search, 
  Loader2, Terminal, MousePointerClick, Clock, Mail, Building2, ChevronRight,
  Eye, Timer, Zap, Target, Sparkles, ArrowUpRight, MessageSquare, Briefcase
} from 'lucide-react';
import { upsellData } from '../data'; 

import ReportCard from './ReportCard';    
import DetailModal from './DetailModal';    
import ProposalModal from './ProposalModal'; 

const Dashboard = () => {
  // --- 1. 상태 관리 ---
  const [activeTab, setActiveTab] = useState('market'); 
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [proposalStep, setProposalStep] = useState(null);
  const [targetPartner, setTargetPartner] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [startDate, setStartDate] = useState('2026-01-01'); 
  const [endDate, setEndDate] = useState('2026-12-31');

  const [realReports, setRealReports] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState('시스템 준비 완료');

  // --- 2. 가공된 인바운드 리드 데이터 ---
  const [inboundLeads] = useState([
    {
      id: 'L1',
      company: '삼성SDS',
      email: 'ict_strategy@samsung.com',
      visitPath: ['제품소개', 'Nubo VMI', '기술 백서 다운로드'],
      stayTime: '08:45',
      interestScore: 95,
      lastVisit: '2026-04-10',
      status: 'HOT',
      suggestedSolution: 'Nubo VMI (가상 모바일 인프라)',
      reason: '보안 솔루션 페이지 5분 이상 체류 및 구축 사례 집중 조회',
      contacts: [{ name: '삼성SDS 담당자', email: 'ict_strategy@samsung.com', dept: 'ICT전략팀' }],
      behavior: [
        { page: '/products/nubo-vmi', time: '04:12', action: '백서 다운로드', intent: 'High' },
        { page: '/case-study/public', time: '03:10', action: '스크롤 80%', intent: 'Medium' },
        { page: '/pricing', time: '01:23', action: '견적 문의 클릭', intent: 'High' }
      ],
      keywords: ['망분리', 'VMI', '보안성', 'Android 가상화']
    },
    {
      id: 'L2',
      company: '현대자동차',
      email: 'infra_mgr@hyundai.com',
      visitPath: ['메인', 'Citrix VDI', '도입 비용 계산기'],
      stayTime: '03:20',
      interestScore: 82,
      lastVisit: '2026-04-09',
      status: 'WARM',
      suggestedSolution: 'Citrix DaaS (Cloud 가상화)',
      reason: 'VDI 클라우드 전환 가이드 페이지 반복 방문',
      contacts: [{ name: '현대차 인프라팀', email: 'infra_mgr@hyundai.com', dept: 'IT운영팀' }],
      behavior: [
        { page: '/solutions/citrix-vdi', time: '02:05', action: '단순 열람', intent: 'Medium' },
        { page: '/calculator/vdi-cost', time: '01:15', action: '수치 입력', intent: 'High' }
      ],
      keywords: ['DaaS', 'Cloud Migration', 'VDI 비용절감']
    }
  ]);

  // --- 3. 로직 핸들러 ---
  const handleSearch = async () => {
    if (tags.length === 0) {
      setDebugLog('❌ 에러: 키워드를 입력해주세요.');
      return;
    }
    const searchKeyword = tags.join(',');
    setIsLoading(true);
    setDebugLog(`🔍 통합 분석 중: [${searchKeyword}] 관련 데이터 수집...`);
    try {
      const response = await fetch(`http://localhost:8000/api/search-all/${encodeURIComponent(searchKeyword)}`);
      if (!response.ok) throw new Error(`서버 응답 에러 (${response.status})`);
      const data = await response.json();
      if (data.results) {
        // AI가 분석한 파트너사 정보라고 가정 (Mock Data)
        const fixedPartners = [
          { name: '티맥스클라우드', deals: 15, color: '#004EA1', contacts: [{ name: '이다은 사원', email: 'ldaeundev@gmail.com', dept: '가상화사업팀' }] },
          { name: '나무기술', deals: 10, color: '#006FFF', contacts: [{ name: '박용훈 대리', email: 'yh.park@namutech.co.kr', dept: '인프라팀' }] },
        ];
        // 결과 데이터에 토픽과 파트너사 정보를 강제로 매핑 (API에서 오지 않을 경우 대비)
        setRealReports(data.results.map(report => ({ 
          ...report, 
          partners: fixedPartners,
          keywords: report.keywords || tags // 검색 키워드를 토픽으로 우선 활용
        })));
        setDebugLog(`✅ 성공: 뉴스 ${data.news_count}건, 나라장터 ${data.bid_count}건 분석 완료`);
      }
    } catch (error) {
      setDebugLog(`❌ 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    const companyName = selectedReport?.company || selectedReport?.name || targetPartner;
    generateAIContent(companyName, contact); 
  };

  const generateAIContent = async (name, contact) => {
    setDebugLog(`🤖 AI가 ${name} 맞춤형 제안서를 작성 중...`);
    setProposalStep('write');
    setEmailContent("AI가 제안서를 작성하고 있습니다...");

    try {
      const response = await fetch("http://localhost:8000/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedReport?.title || "인바운드 대응",
          summary: selectedReport?.reason || selectedReport?.summary,
          partner_name: name,
          contact_name: contact?.name || "담당자",
          solution_type: selectedReport?.suggestedSolution || "Nubo VMI",
          is_upsell: activeTab === 'upsell'
        }),
      });
      const data = await response.json();
      setEmailContent(data.content);
      setDebugLog(`✅ 제안서 생성 완료!`);
    } catch (error) {
      setEmailContent("제안서 생성 중 오류가 발생했습니다. 서버 연결을 확인하세요.");
    }
  };

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const closeAllModals = () => {
    setSelectedReport(null);
    setProposalStep(null);
    setEmailContent('');
    setSelectedContact(null); 
  };

  const displayReports = realReports
    .filter(report => {
      const rDate = new Date(report.date);
      return rDate >= new Date(startDate) && rDate <= new Date(endDate);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER */}
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
          <div className="relative">
            <div className="bg-gradient-to-tr from-[#0095D8] to-[#004EA1] p-2.5 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform">
              <User size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto">
        {/* TABS NAVIGATION */}
        <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl mb-8 w-fit shadow-inner">
          {[
            { id: 'market', icon: <BarChart3 size={18} />, label: '시장 기회 발굴' },
            { id: 'upsell', icon: <Users size={18} />, label: '기존 고객 Upselling' },
            { id: 'inbound', icon: <MousePointerClick size={18} />, label: '인바운드 리드 분석' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); closeAllModals(); }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-1.5xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-white text-[#004EA1] shadow-md ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* MARKET TAB CONTENT */}
        {activeTab === 'market' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Market Keywords</label>
                  <div className="flex flex-wrap items-center gap-2 border-2 border-slate-100 rounded-2xl p-3 bg-slate-50 focus-within:bg-white focus-within:border-[#0095D8] transition-all focus-within:shadow-lg focus-within:shadow-blue-50">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 bg-[#004EA1] px-3 py-1.5 rounded-xl text-[12px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                        {tag} <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-200 transition-colors"><X size={14} /></button>
                      </span>
                    ))}
                    <input 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} 
                      placeholder="분석할 키워드를 입력하세요..." 
                      className="outline-none text-sm flex-1 bg-transparent min-w-[200px] ml-2 font-medium" 
                    />
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Analysis Period</label>
                  <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3">
                    <Calendar size={18} className="text-slate-400" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 outline-none" />
                    <span className="text-slate-300 font-light">~</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 outline-none" />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <button onClick={handleSearch} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#004EA1] text-white rounded-2xl font-black text-sm hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} 분석 실행
                  </button>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 bg-slate-900 text-slate-300 px-5 py-3 rounded-xl font-mono text-xs overflow-hidden">
                <Terminal size={14} className="text-[#0095D8]" /> 
                <span className="text-[#0095D8] font-bold">LOG:</span> 
                <span className="truncate">{debugLog}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayReports.length > 0 ? (
                displayReports.map((report) => (
                  <ReportCard key={report.id} report={report} onDetail={(r) => setSelectedReport(r)} onProposal={(r) => { setSelectedReport(r); setProposalStep('select'); }} />
                ))
              ) : (
                <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                   <div className="p-4 bg-slate-50 rounded-full text-slate-300"><Search size={48} /></div>
                   <p className="text-slate-400 font-bold text-lg">상단 키워드를 입력하고 시장 기회 분석을 시작하세요.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPSELL TAB CONTENT */}
        {activeTab === 'upsell' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {upsellData.map((client) => (
              <div key={client.id} className="group border border-slate-200 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-blue-100 bg-white transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#004EA1] to-[#0095D8] text-white px-6 py-2 rounded-bl-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} /> AI Score: {client.potential}%
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-6">{client.company}</h4>
                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Current</p>
                    <p className="text-sm font-bold text-slate-600">{client.currentSolution}</p>
                  </div>
                  <div className="px-6 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                       <ArrowUpRight size={20} className="text-[#004EA1]" />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-[#0095D8] font-black uppercase mb-1">Recommend</p>
                    <p className="text-sm font-bold text-[#004EA1]">{client.targetSolution}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedReport(client); setProposalStep('select'); }} className="w-full py-4 bg-[#004EA1] text-white rounded-2xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-[0.98]">
                  AI 맞춤형 업셀링 제안서 작성
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INBOUND TAB CONTENT */}
        {activeTab === 'inbound' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-[#004EA1] to-[#0095D8] p-8 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-100">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                   <Target size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tight">실시간 인바운드 리드 분석</h3>
                  <p className="text-blue-50 text-sm mt-1 font-medium opacity-90">잠재 고객의 웹사이트 행동 패턴을 AI가 분석하여 고가치 리드를 선별했습니다.</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                 <p className="text-xs font-black text-blue-200 uppercase tracking-widest">Update Today</p>
                 <p className="text-lg font-bold">14 New Leads</p>
              </div>
            </div>

            {inboundLeads.map((lead) => (
              <div key={lead.id} className="group bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:border-[#0095D8] hover:shadow-2xl transition-all duration-500 flex flex-col lg:flex-row gap-10 relative">
                <div className="lg:w-1/4 lg:border-r lg:border-slate-100 lg:pr-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${lead.status === 'HOT' ? 'bg-orange-100 text-orange-600 shadow-sm shadow-orange-50' : 'bg-blue-100 text-[#004EA1]'}`}>
                      {lead.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={14} /> {lead.stayTime}
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-2 group-hover:text-[#004EA1] transition-colors">
                    <Building2 size={24} className="text-slate-300 group-hover:text-[#0095D8]" /> {lead.company}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <Mail size={16} className="text-slate-300" /> {lead.email}
                  </p>
                </div>

                <div className="lg:w-2/4">
                  <div className="flex flex-wrap items-center gap-2.5 mb-8">
                    {lead.visitPath.map((path, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-xs bg-slate-50 px-4 py-2.5 rounded-1.5xl border border-slate-100 font-bold text-slate-600 shadow-sm">{path}</span>
                        {idx < lead.visitPath.length - 1 && <ChevronRight size={16} className="text-slate-200" />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="bg-[#F8FAFC] p-6 rounded-[1.5rem] border border-dashed border-slate-200 group-hover:bg-blue-50/50 group-hover:border-[#0095D8]/30 transition-all">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium tracking-tight">
                      <span className="font-black text-[#0095D8] mr-2 inline-flex items-center gap-1"><Zap size={14} /> AI Insights:</span>
                      {lead.reason}
                    </p>
                  </div>
                </div>

                <div className="lg:w-1/4 flex flex-col justify-center gap-4">
                  <button 
                    onClick={() => setSelectedReport(lead)} 
                    className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:border-[#0095D8] hover:text-[#0095D8] hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  >
                    <Eye size={18} /> 상세 행동 리포트
                  </button>
                  <button onClick={() => { setSelectedReport(lead); setProposalStep('select'); }} className="w-full py-4 bg-[#004EA1] text-white rounded-2xl font-black text-sm hover:bg-blue-800 shadow-xl shadow-blue-100 transition-all active:scale-[0.97]">
                    개인화 제안서 발송
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- 분석 리포트 상세 모달 (시장 기회 & 인바운드 공통) --- */}
      {selectedReport && !proposalStep && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[11px] font-black text-[#0095D8] uppercase tracking-[0.2em] mb-2">Detailed Analysis Report</p>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                  {selectedReport.company || selectedReport.name || "시장 분석 리포트"}
                </h2>
                {selectedReport.title && <p className="text-slate-500 font-bold mt-2 text-lg">"{selectedReport.title}"</p>}
              </div>
              <button onClick={closeAllModals} className="p-4 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-red-500 shadow-sm border border-slate-100"><X size={24} /></button>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              {/* [시장 기회 전용] 요약 섹션 */}
              {(selectedReport.summary || selectedReport.reason) && (
                <div className="mb-10 animate-in fade-in duration-500">
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004EA1]"><MessageSquare size={18} /></div>
                    AI 통합 분석 요약
                  </h3>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                    {selectedReport.summary || selectedReport.reason}
                  </div>
                </div>
              )}

              {/* [공통] AI 토픽/키워드 섹션 */}
              <div className="mb-10">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center"><Zap size={18} className="text-yellow-500" /></div>
                  AI 기반 핵심 토픽 추출
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(selectedReport.keywords || tags).map((kw, idx) => (
                    <span key={idx} className="px-5 py-3 bg-white text-slate-700 text-xs font-black rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 hover:border-[#0095D8] transition-colors cursor-default">
                      <span className="text-[#0095D8] font-black">#</span> {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* [시장 기회 전용] 추천 파트너사 섹션 */}
              {activeTab === 'market' && selectedReport.partners && (
                <div className="mb-10 animate-in fade-in duration-700">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><Briefcase size={18} /></div>
                    추천 협업 파트너사 (매칭 점수 기반)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.partners.map((p, idx) => (
                      <div key={idx} className="p-6 border-2 border-slate-50 rounded-2xl flex items-center justify-between hover:border-[#0095D8]/20 transition-all bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: p.color }}></div>
                          <div>
                            <p className="font-black text-slate-800">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase">Recent Deals: {p.deals}건</p>
                          </div>
                        </div>
                        <button className="text-xs font-black text-[#0095D8] px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-[#0095D8] hover:text-white transition-all">연락처 보기</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* [인바운드 전용] 행동 타임라인 섹션 */}
              {activeTab === 'inbound' && selectedReport.behavior && (
                <div className="mb-10">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Target size={18} className="text-[#004EA1]" /></div>
                    사용자 세부 행동 로그
                  </h3>
                  <div className="space-y-4">
                    {selectedReport.behavior.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-[#0095D8]/50 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-sm font-black text-slate-400 border border-slate-100">{idx + 1}</div>
                          <div>
                            <p className="text-[15px] font-bold text-slate-800">{item.page}</p>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">액션: <span className="text-[#0095D8]">{item.action}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700 flex items-center gap-1 justify-end mb-1.5"><Clock size={12} className="text-slate-400" /> {item.time}</p>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${item.intent === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'}`}>{item.intent} Intent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-[#F8FAFC] border-t border-slate-100 flex gap-4">
              <button onClick={() => { setProposalStep('select'); }} className="flex-1 py-5 bg-[#004EA1] text-white rounded-2xl font-black text-sm hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]">
                이 리포트를 기반으로 맞춤형 제안서 생성
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* PROPOSAL MODAL COMPONENT */}
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
        onFinish={() => { alert('성공적으로 발송되었습니다!'); closeAllModals(); }}
      />
    </div>
  );
};

export default Dashboard;