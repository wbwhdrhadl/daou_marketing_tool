import { X } from 'lucide-react';

const KeywordSection = ({ keywords }) => (
  <section className="mb-12">
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="text-xl font-bold mb-2 text-slate-800">키워드 및 소스 설정</h2>
        <p className="text-slate-500 text-sm">정보를 수집할 키워드와 채널을 관리하세요.</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
        키워드 추가
      </button>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-3">
      {keywords.map((kw, i) => (
        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-100">
          {kw} <X size={14} className="cursor-pointer hover:text-blue-900" />
        </span>
      ))}
      <div className="flex gap-4 ml-auto border-l pl-6 border-slate-200">
        {['뉴스기사', 'LinkedIn'].map(source => (
          <label key={source} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" /> {source}
          </label>
        ))}
      </div>
    </div>
  </section>
);

export default KeywordSection;