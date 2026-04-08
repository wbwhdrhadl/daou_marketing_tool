import React, { useState } from 'react';
import { 
  User, FileText, X, Plus, ExternalLink, BarChart3, 
  CheckCircle2, Mail, Send, ChevronRight 
} from 'lucide-react';

const Dashboard = () => {
  // --- [상태 관리] ---
  const [tags, setTags] = useState(['VDI', 'Cloud Migration', 'Network Security']);
  const [inputValue, setInputValue] = useState('');
  const [selectedReport, setSelectedReport] = useState(null); // 1차 상세 모달 데이터
  const [proposalStep, setProposalStep] = useState(null);    // 2차 제안서 단계: 'select' | 'write'
  const [targetPartner, setTargetPartner] = useState(''); // ✨ 추가됨
  const [proposalType, setProposalType] = useState('');      // 제안 대상: 'partner' | 'client'
  const [emailContent, setEmailContent] = useState('');      // 메일 본문
  const [selectedContact, setSelectedContact] = useState(null); // 추가: 선택된 담당자
  // --- [데이터베이스] ---
  const reportData = [
    { 
      id: 1, source: 'Naver News', date: 'Aug 19, 2026', 
      company: '국가정보자원관리원',
      title: '국가정보자원관리원 대구센터 클라우드 가상화 구축 사업', score: 92, level: 'High',
      link: 'https://www.newsis.com/view/NISX20260309_0003540152',
      keywords: ['Cloud Native', 'Security', 'Fintech'],
      summary: '정부 대구통합전산센터의 클라우드 인프라 확장 프로젝트입니다. 망 분리 환경 내의 가상 데스크톱(VDI) 고도화와 보안 인증(CSAP) 준수가 필수적인 사업입니다.',
      analysis: [80, 45, 90, 70],
      partners: [
        { 
        name: '티맥스클라우드', 
        deals: 15, 
        color: '#004EA1',
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ]
      },
        { 
        name: '나무기술', 
        deals: 10, 
        color: '#006FFF',        
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ] 
      },
      { 
        name: '안랩', 
        deals: 5, 
        color: '#009DFF',        
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ] 
      },
      ]
    },
    { 
      id: 2, source: 'LinkedIn', date: 'Aug 15, 2026', 
      company: '현대자동차',
      title: 'H 자동차 글로벌 스마트 팩토리 VMI 도입 확산', score: 78, level: 'Medium',
      link: 'https://www.linkedin.com/news/story/anthropic-partners-with-tech-giants-for-unreleased-ai-model-8644218/',
      keywords: ['Infrastructure', 'VDI', 'Hybrid'],
      summary: '국내 대형 자동차 제조사의 해외 생산 라인에 모바일 가상화(VMI) 솔루션을 적용하는 프로젝트입니다. 공장 내 모바일 기기 보안 강화와 운영 효율화가 주 목적입니다.',
      analysis: [60, 30, 75, 85],
      partners: [
        { 
          name: '삼성SDS', 
          deals: 12, 
          color: '#004EA1',
          contacts: [
            { name: '박지민 그룹장', email: 'jm.park@samsung.com', dept: '클라우드서비스팀' },
            { name: '최윤석 책임', email: 'ys.choi@samsung.com', dept: '스마트팩토리사업부' }
          ]
        },
        { 
          name: 'LG CNS', 
          deals: 8, 
          color: '#006FFF',
          contacts: [
            { name: '정현우 팀장', email: 'hw.jung@lgcns.com', dept: '엔터프라이즈사업부' },
            { name: '강소희 선임', email: 'sh.kang@lgcns.com', dept: '보안솔루션팀' }
          ]
        },
        { 
          name: '다우기술', 
          deals: 4, 
          color: '#009DFF',
          contacts: [
            { name: '이민호 차장', email: 'mh.lee@daou.co.kr', dept: '솔루션영업본부' }
          ]
        },
      ]
    },
    { 
      id: 3, source: 'IT News', date: 'Aug 17, 2026', 
      company: 'KT 통신사',
      title: 'KT 통신사 차세대 AI 컨택센터 가상 상담 인프라 구축', score: 85, level: 'High',
      link: 'https://m.etnews.com/20260329000074',
      keywords: ['Data Center', 'Efficiency', 'Scalability'],
      summary: '국내 통신사의 대규모 컨택센터 운영을 위한 DaaS(Desktop as a Service) 환경 구축 사업입니다. AI 상담사 지원을 위한 GPU 가상화 리소스 배분이 핵심입니다.',
      analysis: [70, 80, 65, 95],
      partners: [
        { 
          name: 'KT Cloud', 
          deals: 12, 
          color: '#004EA1',
          contacts: [
            { name: '한상훈 상무', email: 'sh.han@kt.com', dept: '공공클라우드본부' },
            { name: '권다은 매니저', email: 'de.kwon@kt.com', dept: 'DaaS사업팀' }
          ]
        },
        { 
          name: 'SK C&C', 
          deals: 8, 
          color: '#006FFF',
          contacts: [
            { name: '조성원 팀장', email: 'sw.cho@sk.com', dept: 'Digital Tech센터' },
            { name: '임수진 수석', email: 'sj.lim@sk.com', dept: 'AI인프라그룹' }
          ]
        },
        { 
          name: '메가존클라우드', 
          deals: 4, 
          color: '#009DFF',
          contacts: [
            { name: '송철호 이사', email: 'ch.song@mz.co.kr', dept: 'AWS영업총괄' },
            { name: '김나영 팀장', email: 'ny.kim@mz.co.kr', dept: '파트너협력팀' }
          ]
        },
      ]
    },
    { 
      id: 4, source: 'Naver News', date: 'Aug 19, 2026', 
      company: '국가정보자원관리원',
      title: '국가정보자원관리원 대구센터 클라우드 가상화 구축 사업', score: 92, level: 'High',
      link: 'https://www.newsis.com/view/NISX20260309_0003540152',
      keywords: ['Cloud Native', 'Security', 'Fintech'],
      summary: '정부 대구통합전산센터의 클라우드 인프라 확장 프로젝트입니다. 망 분리 환경 내의 가상 데스크톱(VDI) 고도화와 보안 인증(CSAP) 준수가 필수적인 사업입니다.',
      analysis: [80, 45, 90, 70],
      partners: [
        { 
        name: '티맥스클라우드', 
        deals: 15, 
        color: '#004EA1',
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ]
      },
        { 
        name: '나무기술', 
        deals: 10, 
        color: '#006FFF',        
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ] 
      },
      { 
        name: '안랩', 
        deals: 5, 
        color: '#009DFF',        
        contacts: [
          { name: '김철수 팀장', email: 'cs.kim@tmax.com', dept: '전략사업본부' },
          { name: '이영희 매니저', email: 'yh.lee@tmax.com', dept: '기술영업팀' }
        ] 
      },
      ]
    },
    { 
      id: 5, source: 'LinkedIn', date: 'Aug 15, 2026', 
      company: '현대자동차',
      title: 'H 자동차 글로벌 스마트 팩토리 VMI 도입 확산', score: 78, level: 'Medium',
      link: 'https://www.linkedin.com/news/story/anthropic-partners-with-tech-giants-for-unreleased-ai-model-8644218/',
      keywords: ['Infrastructure', 'VDI', 'Hybrid'],
      summary: '국내 대형 자동차 제조사의 해외 생산 라인에 모바일 가상화(VMI) 솔루션을 적용하는 프로젝트입니다. 공장 내 모바일 기기 보안 강화와 운영 효율화가 주 목적입니다.',
      analysis: [60, 30, 75, 85],
      partners: [
        { 
          name: '삼성SDS', 
          deals: 12, 
          color: '#004EA1',
          contacts: [
            { name: '박지민 그룹장', email: 'jm.park@samsung.com', dept: '클라우드서비스팀' },
            { name: '최윤석 책임', email: 'ys.choi@samsung.com', dept: '스마트팩토리사업부' }
          ]
        },
        { 
          name: 'LG CNS', 
          deals: 8, 
          color: '#006FFF',
          contacts: [
            { name: '정현우 팀장', email: 'hw.jung@lgcns.com', dept: '엔터프라이즈사업부' },
            { name: '강소희 선임', email: 'sh.kang@lgcns.com', dept: '보안솔루션팀' }
          ]
        },
        { 
          name: '다우기술', 
          deals: 4, 
          color: '#009DFF',
          contacts: [
            { name: '이민호 차장', email: 'mh.lee@daou.co.kr', dept: '솔루션영업본부' }
          ]
        },
      ]
    },
    { 
      id: 6, source: 'IT News', date: 'Aug 17, 2026', 
      company: 'KT 통신사',
      title: 'KT 통신사 차세대 AI 컨택센터 가상 상담 인프라 구축', score: 85, level: 'High',
      link: 'https://m.etnews.com/20260329000074',
      keywords: ['Data Center', 'Efficiency', 'Scalability'],
      summary: '국내 통신사의 대규모 컨택센터 운영을 위한 DaaS(Desktop as a Service) 환경 구축 사업입니다. AI 상담사 지원을 위한 GPU 가상화 리소스 배분이 핵심입니다.',
      analysis: [70, 80, 65, 95],
      partners: [
        { 
          name: 'KT Cloud', 
          deals: 12, 
          color: '#004EA1',
          contacts: [
            { name: '한상훈 상무', email: 'sh.han@kt.com', dept: '공공클라우드본부' },
            { name: '권다은 매니저', email: 'de.kwon@kt.com', dept: 'DaaS사업팀' }
          ]
        },
        { 
          name: 'SK C&C', 
          deals: 8, 
          color: '#006FFF',
          contacts: [
            { name: '조성원 팀장', email: 'sw.cho@sk.com', dept: 'Digital Tech센터' },
            { name: '임수진 수석', email: 'sj.lim@sk.com', dept: 'AI인프라그룹' }
          ]
        },
        { 
          name: '메가존클라우드', 
          deals: 4, 
          color: '#009DFF',
          contacts: [
            { name: '송철호 이사', email: 'ch.song@mz.co.kr', dept: 'AWS영업총괄' },
            { name: '김나영 팀장', email: 'ny.kim@mz.co.kr', dept: '파트너협력팀' }
          ]
        },
      ]
    }
    
  ];

  // --- [로직 함수] ---
  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => setTags(tags.filter((tag) => tag !== tagToRemove));
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAddTag(); };

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
    setProposalType('');
    setEmailContent('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900 relative">
      {/* 1. Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 rounded-t-2xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#0095D8] text-white p-1.5 rounded font-black text-xl">DAOUDATA</div>
            <span className="font-extrabold text-[#0095D8] tracking-tight text-lg uppercase">Marketing AI Tool</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">이다은 님</span>
          <div className="bg-slate-100 p-2 rounded-full border border-slate-200">
            <User size={20} className="text-[#0095D8]" />
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <div className="bg-white p-8 rounded-b-2xl shadow-md">
        {/* Keyword Settings */}
        <div className="mb-10 bg-slate-50 p-5 rounded-xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16} /> 키워드 관리 </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-wrap items-center gap-2 border-2 border-slate-200 rounded-lg p-2 bg-white">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold text-[#004EA1] border border-blue-100">
                  {tag} <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1"><X size={14} /></button>
                </span>
              ))}
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="검색어 입력 후 Enter..." className="outline-none text-sm flex-1 min-w-[150px] bg-transparent" />
            </div>
            <button onClick={handleAddTag} className="bg-[#0095D8] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-100 transition-all hover:bg-[#0095D8]">추가</button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportData.map((report) => (
            <div key={report.id} className="group border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col bg-white">
            <span className={`text-[10px] font-black uppercase w-fit px-2.5 py-1 rounded-md mb-4 ${
              report.source === 'Naver News' ? 'text-emerald-600 bg-emerald-50' : 
              report.source === 'LinkedIn' ? 'text-[#0077B5] bg-blue-50' :
              report.source === '전자신문' ? 'text-red-600 bg-red-50' :
              'text-slate-600 bg-slate-100'
            }`}>
              {report.source}
            </span>
              <h2 className=" text-slate-900 mb-3 h-12 overflow-hidden">{report.title}</h2>
              <p className="text-xs text-slate-500 mb-6 line-clamp-2">{report.summary}</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-xl">
                  <span className="text-xl font-bold text-[#004EA1]">{report.score}% <span className="text-[10px] text-slate-400 uppercase font-medium">적합</span></span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black text-white ${report.level === 'High' ? 'bg-[#0095D8]' : 'bg-orange-400'}`}>{report.level}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedReport(report)} className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">자세히 보기</button>
                  <button onClick={() => { setSelectedReport(report); setProposalStep('select'); }} className="flex-[1.5] py-2.5 bg-[#0070E0] text-white text-xs font-bold rounded-lg hover:bg-[#003d7e] transition-all">제안 메일 보내기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 1차: Detail Modal (상세 분석) */}
      {selectedReport && proposalStep === null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center p-4 overflow-y-auto items-start py-10">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative mb-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 z-20 bg-[#004EA1] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{selectedReport.source}</span>
                <h3 className="text-xl font-black mt-1 leading-tight">{selectedReport.title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-8">
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed text-sm text-slate-600">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><BarChart3 size={18} className="text-[#004EA1]" /> AI 분석 리포트</h4>
                {selectedReport.summary}
              </section>

              {/* TOP 5 파트너 유사 사업 현황 */}
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                  <CheckCircle2 size={18} className="text-[#004EA1]" /> 유사 사업 추진 비중
                </h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-2 w-full">
                    {selectedReport.partners.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          {/* 그래프 색상과 맞춘 인디케이터 */}
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[#004EA1]">{item.deals}건</span>
                      </div>
                    ))}
                  </div>

                  {/* ✨ 동적 원형 그래프 (Donut Chart) */}
                  <div className="w-40 h-40 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* 배경 원 */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      
                      {/* 파트너별 점유율 계산 및 렌더링 */}
                      {(() => {
                        const totalDeals = selectedReport.partners.reduce((sum, p) => sum + p.deals, 0);
                        let cumulativeOffset = 0;

                        return selectedReport.partners.map((p, i) => {
                          const percentage = (p.deals / totalDeals) * 100;
                          const strokeDasharray = `${percentage} ${100 - percentage}`;
                          const strokeDashoffset = -cumulativeOffset;
                          cumulativeOffset += percentage;

                          return (
                            <circle
                              key={i}
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="none"
                              stroke={p.color}
                              strokeWidth="4"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-1000 ease-out"
                            />
                          );
                        });
                      })()}
                    </svg>
                    {/* 중앙 텍스트: 전체 건수 또는 메인 파트너 비중 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                      <span className="text-lg font-black text-slate-800">
                        {selectedReport.partners.reduce((sum, p) => sum + p.deals, 0)}건
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Score Graph */}
              <section className="grid grid-cols-4 gap-4">
                {selectedReport.analysis.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full h-20 flex items-end mb-2"> 
                      <div className="w-full bg-[#004EA1]/10 rounded-t-lg relative" style={{ height: `${val}%` }}>
                        <div className="absolute top-[-18px] left-0 right-0 text-center text-[10px] font-black text-[#004EA1]">{val}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{['보안', '가용', '확장', '수익'][idx]}</span>
                  </div>
                ))}
              </section>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <a href={selectedReport.link} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200">
                  <ExternalLink size={14} /> 원문 링크
                </a>
                <button onClick={() => setProposalStep('select')} className="flex-1 py-3.5 bg-[#004EA1] text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#003d7e]">
                  <Mail size={16} /> 맞춤형 제안서 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 2차: Proposal Modal (유형 선택 -> 대상 선택 -> 작성) */}
      {proposalStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            
            {/* --- [Step 1] 제안 유형 선택 (고객사 vs 파트너사) --- */}
            {proposalStep === 'select' && (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-blue-50 text-[#004EA1] rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail size={32} /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">제안 대상을 선택해주세요</h3>
                <p className="text-slate-500 mb-8 text-sm">누구에게 보낼 제안서인가요?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setProposalStep('partner_list')} 
                    className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group"
                  >
                    <User size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                    <span className="block font-bold text-slate-700">파트너사 제안</span>
                    <span className="text-[10px] text-slate-400 uppercase">Collab & Profit</span>
                  </button>
                  <button 
                    onClick={() => { setTargetPartner('고객사'); generateAIContent('고객사'); }} 
                    className="p-6 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all text-left group"
                  >
                    <FileText size={20} className="mb-4 text-slate-400 group-hover:text-[#004EA1]" />
                    <span className="block font-bold text-slate-700">고객사 제안</span>
                    <span className="text-[10px] text-slate-400 uppercase">Direct Sales</span>
                  </button>
                </div>
                <button onClick={() => setProposalStep(null)} className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600">닫기</button>
              </div>
            )}

            {/* --- [Step 2] 파트너사 구체적 선택 (Step 1에서 파트너사 선택 시 노출) --- */}
            {proposalStep === 'partner_list' && (
              <div className="p-10">
                <h3 className="text-xl font-black text-slate-800 mb-6 text-center">협업할 파트너사를 선택하세요</h3>
                
                <div className="space-y-3 mb-8">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Analysis Recommended</p>
                  {selectedReport?.partners?.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => { 
                      setTargetPartner(p.name); 
                      setProposalStep('contact_list'); // 바로 메일로 안 가고 담당자 리스트로 보냄
                    }}
                    className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group"
                  >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                        <span className="font-bold text-slate-700 group-hover:text-[#004EA1]">{p.name}</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">직접 입력</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="기업명 입력..." 
                      value={targetPartner} 
                      onChange={(e) => setTargetPartner(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#004EA1]/20" 
                    />
                    <button 
                      onClick={() => generateAIContent(targetPartner)}
                      disabled={!targetPartner.trim()}
                      className="bg-[#004EA1] text-white px-6 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                      선택
                    </button>
                  </div>
                </div>
                <button onClick={() => setProposalStep('select')} className="w-full mt-8 text-xs font-bold text-slate-400">이전으로</button>
              </div>
            )}

            {/* --- [Step 2.5] 담당자 선택 (파트너사 선택 후 노출) --- */}
            {proposalStep === 'contact_list' && (
              <div className="p-10">
                <div className="mb-6 text-center">
                  <span className="text-[10px] font-bold text-[#004EA1] bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">{targetPartner}</span>
                  <h3 className="text-xl font-black text-slate-800 mt-2">연락하실 담당자를 선택하세요</h3>
                </div>
                
                <div className="space-y-3 mb-8">
                  {selectedReport?.partners?.find(p => p.name === targetPartner)?.contacts?.map((contact, i) => (
                    <button 
                      key={i} 
                      onClick={() => generateAIContent(targetPartner, contact)}
                      className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-[#004EA1] hover:bg-blue-50 transition-all group text-left"
                    >
                      <div>
                        <div className="font-bold text-slate-700 group-hover:text-[#004EA1]">{contact.name}</div>
                        <div className="text-xs text-slate-400">{contact.dept} | {contact.email}</div>
                      </div>
                      <Send size={16} className="text-slate-300 group-hover:text-[#004EA1]" />
                    </button>
                  )) || <p className="text-center text-slate-400 text-sm py-10">등록된 담당자가 없습니다.</p>}
                </div>

                <button onClick={() => setProposalStep('partner_list')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">이전으로 (파트너 재선택)</button>
              </div>
            )}

            {/* --- [Step 3] 메일 작성 및 전송 --- */}
            {proposalStep === 'write' && (
              <div className="flex flex-col h-[600px]">
                <div className="bg-[#004EA1] p-6 text-white flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider text-white/80">Recipient: {targetPartner}</span>
                    <span className="text-sm font-bold flex items-center gap-2 mt-0.5"><Mail size={16} /> 제안 메일 초안 작성</span>
                  </div>
                  <button onClick={() => setProposalStep('select')} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                  <div className="mb-3 text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <ChevronRight size={12} className="text-[#004EA1]" /> AI Generated Content
                  </div>
                  <textarea 
                    value={emailContent} 
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="flex-1 w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-[#004EA1]/20 outline-none resize-none text-slate-700"
                  />
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setProposalStep('select')} className="px-6 py-3.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">처음부터</button>
                    <button 
                      onClick={() => { alert(`${targetPartner}님께 전송 완료!`); closeAllModals(); }} 
                      className="flex-1 py-3.5 bg-[#004EA1] text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#003d7e] transition-all"
                    >
                      <Send size={18} /> 메일 보내기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div> // Dashboard의 최상위 div 닫기
  ); // return 문 닫기
}; // Dashboard 컴포넌트 함수 닫기

export default Dashboard;