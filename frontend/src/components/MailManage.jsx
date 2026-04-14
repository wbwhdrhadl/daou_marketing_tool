import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, Eye, Copy, Share2, Clock, BarChart3, X 
} from 'lucide-react';

const MailManage = () => {
  const [sentMails, setSentMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchMails = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/sent-mails');
        setSentMails(response.data);
        if (response.data.length > 0) {
          setSelectedMail(response.data[0]);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMails();
  }, []);

  // 🗑️ 삭제 처리 함수
  const handleDelete = async (e, mailId) => {
    e.stopPropagation(); // 카드 클릭 이벤트(상세보기) 전파 방지
    
    if (!window.confirm("이 발송 히스토리를 삭제하시겠습니까?")) return;

    try {
      // 백엔드 DB 삭제 요청
      await axios.delete(`http://localhost:8000/api/sent-mails/${mailId}`);
      
      // 프론트엔드 상태 업데이트
      const updatedMails = sentMails.filter(mail => mail.id !== mailId);
      setSentMails(updatedMails);
      
      // 삭제한 메일이 현재 선택된 메일이라면 선택 해제
      if (selectedMail?.id === mailId) {
        setSelectedMail(updatedMails.length > 0 ? updatedMails[0] : null);
      }
      alert("성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("데이터 삭제 중 오류가 발생했습니다.");
    }
  };

  const statIcons = {
    '전체 발송': <Mail size={20}/>,
    '평균 오픈율': <Eye size={20}/>,
    '콘텐츠 복사': <Copy size={20}/>,
    '최고 관심도': <BarChart3 size={20}/>
  };

  const mailStats = [
    { label: '전체 발송', value: `${sentMails.length}건`, color: 'text-blue-500' },
    { label: '평균 오픈율', value: `${sentMails.length > 0 ? (sentMails.filter(m => m.status === 'Read').length / sentMails.length * 100).toFixed(0) : 0}%`, color: 'text-emerald-500' },
    { label: '콘텐츠 복사', value: `${sentMails.reduce((acc, cur) => acc + (cur.copyCount || 0), 0)}회`, color: 'text-orange-500' },
    { label: '최고 관심도', value: `${sentMails.length > 0 ? Math.max(...sentMails.map(m => m.interestScore)) : 0}%`, color: 'text-purple-500' }
  ];

  if (loading) return <div className="p-10 text-center font-bold">데이터 로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 상단 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {mailStats.map((stat, i) => (
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
          {sentMails.length === 0 ? (
            <p className="text-slate-400 py-10 text-center">발송된 메일이 없습니다.</p>
          ) : (
            sentMails.map((mail) => (
              <div 
                key={mail.id}
                onClick={() => setSelectedMail(mail)}
                className={`group relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                  selectedMail?.id === mail.id 
                  ? 'border-[#004EA1] bg-blue-50/30' 
                  : 'border-white bg-white hover:border-slate-200'
                } shadow-sm`}
              >
                {/* ❌ 우측 상단 삭제 버튼 (마우스 오버 시 노출) */}
                <button
                  onClick={(e) => handleDelete(e, mail.id)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="삭제"
                >
                  <X size={18} />
                </button>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      mail.status === 'Read' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {mail.status === 'Read' ? '읽음' : '미확인'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{mail.sentDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#0095D8] pr-8">
                    <span className="text-xs font-black">관심도 {mail.interestScore}%</span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0095D8]" style={{ width: `${mail.interestScore}%` }}></div>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-[#004EA1] transition-colors pr-10">
                  {mail.subject}
                </h4>
                <p className="text-sm text-slate-500 font-medium">{mail.company} · {mail.recipient}</p>
              </div>
            ))
          )}
        </div>

        {/* 상세 분석 영역 */}
        <div className="lg:col-span-5">
          {selectedMail ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden sticky top-8">
              <div className="p-8 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-1">상세 추적 리포트</h3>
                <p className="text-sm text-slate-400 font-medium">수신자: {selectedMail.recipient}</p>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <DetailStatCard icon={<Eye size={16}/>} label="조회 횟수" value={`${selectedMail.readCount || 0}회`} color="blue" />
                  <DetailStatCard icon={<Copy size={16}/>} label="텍스트 복사" value={`${selectedMail.copyCount || 0}회`} color="orange" />
                  <DetailStatCard icon={<Clock size={16}/>} label="총 체류 시간" value={selectedMail.stayTime || "0s"} color="purple" />
                  <DetailStatCard icon={<Share2 size={16}/>} label="공유/전달" value={`${selectedMail.shareCount || 0}회`} color="emerald" />
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">마지막 활동</p>
                   <p className="text-sm font-bold text-slate-700">{selectedMail.sentDate} 에 마지막으로 확인됨</p>
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

// 상세 지표 카드 컴포넌트
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