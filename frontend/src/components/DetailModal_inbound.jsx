import React from 'react';
import { X, Zap, MousePointerClick, Mail, PieChart, Activity, Info } from 'lucide-react';

const DetailModal_inbound = ({ report, onClose, onStartProposal }) => {
  if (!report) return null;

  // 데이터 기본값 설정 (분석 리포트용)
  const interestScore = report.interestScore || 88;
  const visitPaths = report.visitPaths || [
    { page: "메인 페이지", duration: "15s" },
    { page: "솔루션 > Nubo VMI 소개", duration: "2m 30s" },
    { page: "고객 사례 > 한화시스템", duration: "1m 45s" },
    { page: "문의하기", duration: "40s" }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex justify-center items-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 헤더 섹션 */}
        <div className="p-8 bg-slate-50 flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#0095D8] border border-slate-100">
              <Zap size={28} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#0095D8]/10 text-[#0095D8] text-[10px] font-black rounded uppercase">Inbound Lead</span>
                <span className="text-[10px] font-bold text-slate-400">{report.date || "2026-04-13"}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{report.company || report.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all border border-slate-200 shadow-sm"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* 1. 웹사이트 행동 분석 (머문 경로) */}
          <section>
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              <Activity size={14} /> Visitor Behavior Log
            </h4>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {visitPaths.map((path, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 border-b border-slate-100 last:border-none hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <span className="text-sm font-bold text-slate-600">{path.page}</span>
                  </div>
                  <span className="text-xs font-black text-[#0095D8] bg-[#0095D8]/5 px-2 py-1 rounded-md">{path.duration}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. 관심 제품 및 분석 리포트 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-[#004EA1] to-[#0095D8] rounded-[2rem] text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <PieChart size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Interest</span>
              </div>
              <p className="text-[13px] font-medium mb-1">관심 추정 제품</p>
              <h5 className="text-2xl font-black mb-4">{report.targetSolution || "Nubo VMI"}</h5>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: `${interestScore}%` }}></div>
              </div>
              <p className="text-right text-[10px] mt-2 font-bold italic">매칭 정확도 {interestScore}%</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
              <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 mb-3 tracking-widest uppercase">
                <Info size={14} /> Analysis Reason
              </h4>
              <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                {report.analysisReason || "공객된 한화시스템 구축 사례 페이지에서 1분 이상 체류하며 기술 규격 문서를 다운로드했습니다. 이는 보안 망분리 고도화에 대한 즉각적인 니즈가 있음을 시사합니다."}
              </p>
            </div>
          </section>

          {/* 3. 유입 상세 요약 */}
          <section>
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <MousePointerClick size={18} className="text-[#0095D8]" /> 
                최종 유입 경로
              </div>
              <div className="text-sm font-black text-slate-800">{report.source || "구글 키워드 검색 (망분리 솔루션)"}</div>
            </div>
          </section>
        </div>

        {/* 푸터 액션 버튼 */}
        <div className="p-8 pt-0">
          <button 
            onClick={onStartProposal} 
            className="w-full py-5 bg-[#004EA1] hover:bg-[#003d7e] text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 group"
          >
            <Mail size={20} className="group-hover:animate-bounce" />
            분석 기반 맞춤형 대응 메일 발송
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal_inbound;