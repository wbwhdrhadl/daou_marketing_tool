import React, { useState } from 'react';
import Navbar from './components/Navbar';
import KeywordSection from './components/KeywordSection';
import ReportCard from './components/ReportCard';
import { FileText } from 'lucide-react';

const App = () => {
  // 1. 임시 키워드 데이터
  const [keywords, setKeywords] = useState(['VDI', 'Cloud Migration', 'Network Security']);

  // 2. 임시 보고서 데이터 (이미지 속 내용 재현)
  const [reports] = useState([
    { 
      id: 1, 
      title: "OO Bank H2 Cloud Migration Project", 
      source: "News Article", 
      date: "Aug 19, 2026", 
      summary: "OO Cloud Migration Project analysis report focuses on traditional business and digital transition to cloud migration strategy for financial sector.", 
      matchScore: 92 
    },
    { 
      id: 2, 
      title: "Public Sector VDI Infrastructure Expansion", 
      source: "LinkedIn", 
      date: "Jul 15, 2026", 
      summary: "Summary: Government agency is planning to expand their VDI environment to support remote work. Looking for Citrix partners.", 
      matchScore: 78 
    },
    { 
      id: 3, 
      title: "Next-gen Network Security Upgrade", 
      source: "News Article", 
      date: "Aug 17, 2026", 
      summary: "Major tech corporation announced a massive investment in network security and Zero Trust architecture for their global offices.", 
      matchScore: 85 
    }
  ]);

  // 키워드 추가/삭제 함수 (껍데기만 작동하게)
  const addKeyword = (word) => {
    if (word && !keywords.includes(word)) setKeywords([...keywords, word]);
  };
  const removeKeyword = (word) => {
    setKeywords(keywords.filter(k => k !== word));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto p-10">
        {/* 키워드 설정 섹션 - 여기서 데이터를 넘겨줘야 에러가 안 납니다! */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-500 mb-3 ml-1 uppercase tracking-wider">Keyword Settings</h3>
          <KeywordSection 
            keywords={keywords} 
            onAdd={addKeyword} 
            onRemove={removeKeyword} 
          />
        </div>

        {/* 메인 리포트 섹션 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#3b82f6] p-2 rounded-lg shadow-blue-200 shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Real-time Sales Opportunity Analysis Reports
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} onOpen={() => alert(`${report.title} 상세보기`)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;