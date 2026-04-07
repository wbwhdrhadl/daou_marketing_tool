import { ExternalLink } from 'lucide-react';

const ReportCard = ({ report, onOpen }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all overflow-hidden flex flex-col group">
    <div className="p-6 flex-grow">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
          report.source === 'LinkedIn' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
        }`}>
          {report.source}
        </span>
        <span className="text-xs text-slate-400">{report.date}</span>
      </div>
      <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-blue-600 transition-colors">{report.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-4">{report.summary}</p>
      <div className="flex items-center gap-2">
        <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: `${report.matchScore}%` }}></div>
        </div>
        <span className="text-xs font-bold text-blue-600">{report.matchScore}% Match</span>
      </div>
    </div>
    <button 
      onClick={() => onOpen(report)}
      className="w-full bg-slate-50 border-t border-slate-100 py-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
    >
      분석 보고서 자세히 보기 <ExternalLink size={16} />
    </button>
  </div>
);

export default ReportCard;