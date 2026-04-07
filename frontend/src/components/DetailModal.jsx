import { X } from 'lucide-react';

const DetailModal = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-800">{report.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50 p-5 rounded-xl mb-6">
            <p className="text-xs text-blue-500 font-bold mb-2 uppercase tracking-widest">AI 분석 핵심 요약</p>
            <p className="text-slate-700 leading-relaxed">{report.content}</p>
          </div>
          <h4 className="font-bold text-slate-900 mb-3">전략적 영업 제언</h4>
          <ul className="space-y-3">
            {["관련 핵심 파트너사를 선별하여 3일 내 협력 제안 발송 필요", "기존 유사 레퍼런스를 포함한 맞춤형 제안서 생성 권장"].map((text, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-blue-500 font-bold">•</span> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-8 bg-slate-50 flex gap-3">
          <button className="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all">
            자동 제안 메일 작성하기
          </button>
          <button className="px-6 py-3 border border-slate-200 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-50 transition-all">
            PDF 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;