import React, { useState } from 'react';
import Navbar from './components/Navbar';
import KeywordSection from './components/KeywordSection';
import ReportCard from './components/ReportCard';
import DetailModal from './components/DetailModal';
import { FileText } from 'lucide-react';

const App = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const keywords = ['VDI 신규 구축', '망분리 사업', '가상화 솔루션'];

  const reports = [
    { id: 1, title: "OO은행 하반기 클라우드 전환 사업", source: "뉴스기사", date: "2026-04-07", summary: "금융권 망분리 규제 완화에 따른 대규모 VDI 교체 수요 발생 예정.", content: "본 사업은 약 500억 규모의 대형 프로젝트로, 기존 레거시 시스템을 클라우드 기반 가상화 환경으로 전환하는 것을 골자로 합니다.", matchScore: 92 },
    { id: 2, title: "XX테크 신사옥 네트워크 구축 공고", source: "LinkedIn", date: "2026-04-06", summary: "신기술 도입을 위한 인프라 파트너 모집 중.", content: "링크드인 채용 공고를 통해 분석된 정보입니다. 보안이 강조된 VMI 솔루션 제안이 유효할 것으로 보입니다.", matchScore: 78 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto p-8">
        <KeywordSection keywords={keywords} />
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText size={24} className="text-blue-600" /> 실시간 사업 기회 분석 보고서
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} onOpen={setSelectedReport} />
            ))}
          </div>
        </section>
      </main>
      <DetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
};

export default App;