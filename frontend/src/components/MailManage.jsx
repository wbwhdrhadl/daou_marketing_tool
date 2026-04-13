import React, { useState } from 'react';
import { 
  Mail, Eye, Copy, Share2, Clock, BarChart3, MousePointer2 
} from 'lucide-react';
// 데이터 불러오기 (경로는 파일 위치에 맞게 조절하세요)
import { MAIL_STATS, SENT_MAILS_DATA } from '../data'; 

const MailManage = () => {
  const [selectedMail, setSelectedMail] = useState(null);

  // 통계 아이콘 매핑용 객체
  const statIcons = {
    '전체 발송': <Mail size={20}/>,
    '평균 오픈율': <Eye size={20}/>,
    '콘텐츠 복사': <Copy size={20}/>,
    '최고 관심도': <BarChart3 size={20}/>
  };

  return (
    <div className="space-y-6">
      {/* 상단 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {MAIL_STATS.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`mb-3 ${stat.color}`}>{statIcons[stat.label]}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 메일 리스트 영역 */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl font-black text-slate-800 mb-4">발송 히스토리</h3>
          {SENT_MAILS_DATA.map((mail) => (
            <div 
              key={mail.id}
              onClick={() => setSelectedMail(mail)}
              className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                selectedMail?.id === mail.id 
                ? 'border-[#004EA1] bg-blue-50/30' 
                : 'border-white bg-white hover:border-slate-200'
              } shadow-sm`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    mail.status === 'Read' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {mail.status === 'Read' ? '읽음' : '미확인'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{mail.sentDate}</span>
                </div>
                <div className="flex items-center gap-1 text-[#0095D8]">
                  <span className="text-xs font-black">관심도 {mail.interestScore}%</span>
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0095D8]" style={{ width: `${mail.interestScore}%` }}></div>
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-[#004EA1] transition-colors">{mail.subject}</h4>
              <p className="text-sm text-slate-500 font-medium">{mail.company} · {mail.recipient}</p>
            </div>
          ))}
        </div>

        {/* 상세 분석 영역 */}
        <div className="lg:col-span-5">
          {selectedMail ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden sticky top-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-1">상세 추적 리포트</h3>
                <p className="text-sm text-slate-400 font-medium">수신자: {selectedMail.recipient}</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* 수치 지표 (카드 UI) */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailStatCard icon={<Eye size={16}/>} label="조회 횟수" value={`${selectedMail.readCount}회`} color="blue" />
                  <DetailStatCard icon={<Copy size={16}/>} label="텍스트 복사" value={`${selectedMail.copyCount}회`} color="orange" />
                  <DetailStatCard icon={<Clock size={16}/>} label="평균 체류" value={selectedMail.stayTime} color="purple" />
                  <DetailStatCard icon={<Share2 size={16}/>} label="공유/전달" value={`${selectedMail.shareCount}회`} color="emerald" />
                </div>

                {/* AI 인사이트 */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3 text-[#0095D8]">
                    <MousePointer2 size={18} />
                    <span className="text-xs font-black uppercase tracking-tighter">AI 관심도 분석</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedMail.readCount > 3 
                      ? `해당 담당자는 제안서를 ${selectedMail.readCount}회 이상 반복 확인했습니다. 특히 텍스트 복사 기록이 있는 것으로 보아 내부 보고용 자료로 활용 중일 가능성이 매우 높습니다.` 
                      : "아직 충분한 활동이 감지되지 않았습니다. 추가 팔로업 메일 발송을 권장합니다."}
                  </p>
                </div>
                
                <div className="space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">메일 원문 요약</p>
                   <div className="p-5 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                     {selectedMail.content}
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
              <Mail size={48} className="mb-4 opacity-20" />
              <p className="font-bold">메일을 선택하여 상세 분석 데이터를 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 상세 지표 카드 컴포넌트 (내부 사용)
const DetailStatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600"
  };
  
  return (
    <div className={`p-5 rounded-2xl border ${colors[color].split(' ').slice(0,2).join(' ')}`}>
      <div className={`flex items-center gap-2 mb-2 ${colors[color].split(' ')[2]}`}>
        {icon} <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
};

export default MailManage;