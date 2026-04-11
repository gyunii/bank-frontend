import React, { useState, useEffect } from "react";
import styles from "./Admin_dashboard.module.css";
import { useModal } from '../../context/ModalContext';

const MOCK_HOURLY_DATA = [
  { h: "09", total: 12 }, { h: "10", total: 25 }, { h: "11", total: 18 },
  { h: "12", total: 30 }, { h: "13", total: 22 }, { h: "14", total: 15 },
  { h: "15", total: 10 }, { h: "16", total: 5 },
];

const LEVEL_LABELS = {
  1: "Lv.1 단순 수신",
  2: "Lv.2 상품 신규/변경",
  3: "Lv.3 개인 여신",
  4: "Lv.4 담보/복합",
  5: "Lv.5 기업/특수"
};

export default function Admin_dashboard() {
  const { openModal } = useModal();

  const [tellers, setTellers] = useState([]);         
  const [queue, setQueue] = useState([]);             
  const [mainStats, setMainStats] = useState({ totalWaiting: 0, totalCompleted: 0 }); 
  
  const [taskRatioError, setTaskRatioError] = useState(null); 

  const [taskRatios, setTaskRatios] = useState([
    { lv: 1, label: LEVEL_LABELS[1], pct: 0 },
    { lv: 2, label: LEVEL_LABELS[2], pct: 0 },
    { lv: 3, label: LEVEL_LABELS[3], pct: 0 },
    { lv: 4, label: LEVEL_LABELS[4], pct: 0 },
    { lv: 5, label: LEVEL_LABELS[5], pct: 0 },
  ]);

  const [hourlyData] = useState(MOCK_HOURLY_DATA);
  const [noticeText, setNoticeText] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCustomerToTransfer, setSelectedCustomerToTransfer] = useState(null);
  const [time, setTime] = useState(new Date());

  // 1. 상단 통계 조회
  const fetchMainStats = async () => {
    try {
      const res = await fetch('/api/member/main-stats');
      if (res.ok) {
        const data = await res.json();
        if (data.result === 'SUCCESS') {
          setMainStats({ 
            totalWaiting: data.totalWaiting || 0, 
            totalCompleted: data.totalCompleted || 0 
          });
        }
      }
    } catch (err) { console.error(err); }
  };

  // 2. 대기열 명단 조회
  const fetchWaitingList = async () => {
    try {
      const res = await fetch('/api/member/waiting-list');
      if (res.ok) {
        const data = await res.json();
        if (data.result === 'SUCCESS' && Array.isArray(data.data)) {
          const mappedQueue = data.data.map(q => {
            let calcLevel = 1;
            if (q.taskType?.includes("기업") || q.taskType?.includes("특수")) calcLevel = 5;
            else if (q.taskType?.includes("대출") || q.taskType?.includes("여신")) calcLevel = 4;
            else if (q.taskType?.includes("상담") || q.taskType?.includes("펀드")) calcLevel = 3;
            else if (q.taskType?.includes("수신") || q.taskType?.includes("예금")) calcLevel = 2;

            return {
              id: q.ticketNumber,
              taskId: q.taskId,
              name: q.userName,
              prediction: q.taskType,
              assignedTo: q.memberId,
              assignedName: q.memberName,
              level: calcLevel, 
            };
          });
          setQueue(mappedQueue);
        }
      }
    } catch (err) { console.error(err); }
  };

  // 3. 레벨별 업무 비율 조회 
  const fetchTaskRatio = async () => {
    try {
      const res = await fetch('/api/member/task-ratio');
      
      if (!res.ok) {
        setTaskRatioError(`백엔드 서버 에러 발생! (HTTP ${res.status})`);
        return;
      }
      
      const data = await res.json();
      if (data.result === 'SUCCESS' && Array.isArray(data.ratios)) {
        setTaskRatioError(null); 
        
        let totalTasks = 0;
        const parsedData = data.ratios.map(r => {
          let lv = 1, cnt = 0;
          for (let key in r) {
            const val = r[key];
            const k = key.toLowerCase();
            if (k.includes('level') || k.includes('lv')) lv = Number(String(val).replace(/[^0-9]/g, '')) || 1;
            if (k.includes('count') || k.includes('cnt')) cnt = Number(String(val).replace(/[^0-9]/g, '')) || 0;
          }
          totalTasks += cnt;
          return { lv, cnt };
        });

    
        const mappedRatios = [1, 2, 3, 4, 5].map(targetLv => {
          const matched = parsedData.filter(p => p.lv === targetLv);
          const count = matched.reduce((sum, p) => sum + p.cnt, 0);
          const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
          return { 
            lv: targetLv, 
            label: LEVEL_LABELS[targetLv], 
            pct: pct 
          };
        });
        
        setTaskRatios(mappedRatios);
      } else {
        setTaskRatioError(`백엔드 데이터 응답 실패 (${data.result || '알 수 없음'})`);
      }
    } catch (err) { 
      console.error(err); 
      setTaskRatioError("서버와의 통신에 실패했습니다.");
    }
  };

  // 4. 창구 현황 조회 
  const fetchCounterStatus = async () => {
    try {
      const res = await fetch('/api/member/counter-status');
      if (res.ok) {
        const data = await res.json();
        const rawList = data.SUCCESS || data.right || []; 
        if (Array.isArray(rawList)) {
          const now = new Date().getTime();
          const mappedTellers = rawList.map(t => {
            let calculatedElapsed = 0;
            if (t.currentTaskStatus === '업무중' && t.taskStartedAt) {
              const startTime = new Date(t.taskStartedAt).getTime();
              calculatedElapsed = Math.floor((now - startTime) / 1000); 
            }
            return {
              id: t.memberId,
              name: t.memberName,
              level: t.memberLevel,
              role: t.memberRank || '행원',
              processed: t.todayCompletedCount || 0,
              status: t.currentTaskStatus,
              startTimeRaw: t.taskStartedAt,
              elapsedTime: Math.max(0, calculatedElapsed)
            };
          });

          mappedTellers.sort((a, b) => {
            if (a.level === b.level) return a.name.localeCompare(b.name);
            return a.level - b.level;
          });

          setTellers(mappedTellers);
        }
      }
    } catch (err) { console.error(err); }
  };

  // 데이터 갱신 및 타이머
  useEffect(() => {
    const fetchAll = () => { 
      fetchMainStats(); 
      fetchWaitingList(); 
      fetchTaskRatio(); 
      fetchCounterStatus(); 
    };
    fetchAll(); 
    const dataInterval = setInterval(fetchAll, 3000);
    const clockTimer = setInterval(() => {
      setTime(new Date());
      setTellers(prev => prev.map(t => {
        if (t.status === '업무중' && t.startTimeRaw) {
           return { 
             ...t, 
             elapsedTime: Math.max(0, Math.floor((new Date().getTime() - new Date(t.startTimeRaw).getTime()) / 1000)) 
           };
        }
        return t;
      }));
    }, 1000);
    return () => { clearInterval(dataInterval); clearInterval(clockTimer); };
  }, []);

  const timeStr = time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  
  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const maxHourly = Math.max(...hourlyData.map(d => d.total), 1);

  // 공지사항 전송
  const handleSendNotice = async () => {
    if (!noticeText.trim()) return;
    try {
      const res = await fetch('/api/member/notice', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ message: noticeText }) 
      });
      if (res.ok) {
        setToastMsg(`공지가 전송되었습니다: "${noticeText}"`); 
        setNoticeText(""); 
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) { console.error(err); }
  };

  // 강제 창구 이관 실행
  const triggerTransferConfirm = (taskId, customerName, newTellerId, taskLevel) => {
    const selectedTeller = tellers.find(t => t.id === newTellerId);
    if (!selectedTeller) return;

    if (selectedTeller.level < taskLevel) {
      openModal({
        message: `[배정 불가]\n${selectedTeller.name} 행원(Lv.${selectedTeller.level})은\nLv.${taskLevel} 업무를 처리할 권한이 없습니다.`,
        confirmText: "확인"
      });
      return;
    }
    
    openModal({
      message: `[${selectedTeller.name}] 창구로\n[${customerName}] 고객님을 이관하시겠습니까?`,
      confirmText: "이관 실행",
      cancelText: "취소",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/kiosk/toss-admin?taskId=${taskId}&targetMemberId=${newTellerId}`, { method: 'PATCH' });
          const data = await res.json();
          if (data.result === 'SUCCESS') {
            setQueue(prev => prev.map(q => q.taskId === taskId ? { ...q, assignedTo: newTellerId } : q));
            setSelectedCustomerToTransfer(null);
            fetchWaitingList(); 
            fetchCounterStatus(); 
            setTimeout(() => { openModal({ message: "해당 고객이 성공적으로 이관되었습니다.", confirmText: "확인" }); }, 300);
          } else if (data.result === 'FAILURE_SESSION') {
            openModal({ message: "세션이 만료되었거나 관리자 권한이 없습니다.", confirmText: "확인" });
          } else {
            openModal({ message: `이관 실패: ${data.result}`, confirmText: "확인" });
          }
        } catch (err) {
          console.error("이관 통신 오류:", err); 
          openModal({ message: "서버 통신 중 오류가 발생했습니다.", confirmText: "확인" });
        }
      }
    });
  };

  return (
    <div className={styles.adminRoot}>
      <header className={styles.header}>
        <div className={styles.logo}><span>창구 관리 시스템</span></div>
        <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{timeStr}</div>
      </header>

      <main className={styles.main}>
        <div className={styles.topRow}>
          <div className={`${styles.kpiCard} ${styles.kpiClickable}`} onClick={() => setIsTransferModalOpen(true)}>
            <div className={styles.kpiLabel}>전체 대기 인원</div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>{mainStats.totalWaiting}<span style={{ fontSize: 16 }}> 명</span></div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>운영중 창구 현황</div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>{tellers.length}<span style={{ fontSize: 16 }}> 개</span></div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>오늘 총 처리 건수</div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>{mainStats.totalCompleted}<span style={{ fontSize: 16 }}> 건</span></div>
          </div>
          <div className={`${styles.kpiCard} ${styles.noticeWrap}`}>
            <div className={styles.kpiLabel}>&nbsp;&nbsp;&nbsp;전 창구 공지 전송</div>
            <div className={styles.noticeInputGroup}>
              <input type="text" className={styles.noticeInput} placeholder="공지사항을 입력하세요." value={noticeText} onChange={(e) => setNoticeText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendNotice()} />
              <button className={styles.noticeBtn} onClick={handleSendNotice}>전송</button>
            </div>
          </div>
        </div>

        <div className={styles.grid2Col}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}><span style={{ color: "#22c55e" }}></span> 실시간 창구 모니터링</div>
            {tellers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>활성 창구 정보가 없습니다.</div>
            ) : (
              tellers.map(t => {
                const isDelayed = (t.elapsedTime || 0) >= 1200; 
                return (
                  <div key={t.id || t.name} className={`${styles.tellerRow} ${isDelayed ? styles.delayed : ''}`}>
                    <div className={styles.tellerLeft}>
                      <div className={`${styles.tLevel} ${styles[`levelBadge${t.level || 1}`]}`}>L{t.level || 1}</div>
                      <div className={styles.tNameGroup}><span className={styles.tName}>{t.name}</span><span className={styles.tRole}>{t.role}</span></div>
                    </div>
                    <div className={styles.tellerRight}>
                      <div className={`${styles.tTime} ${isDelayed ? styles.tTimeDelayedText : ''}`}>{t.status === "업무중" ? formatTime(t.elapsedTime) : "--:--"}</div>
                      <div className={styles.tStatusWrapper}>
                        {t.status === "업무중" ? (
                          <span className={styles.tStatusBadge} style={{ background: isDelayed ? "#fee2e2" : "#dcfce7", color: isDelayed ? "#991b1b" : "#166534" }}>{isDelayed ? "업무 지연" : "업무중"}</span>
                        ) : (
                          <span className={styles.tStatusBadge} style={{ background: "#f1f5f9", color: "#64748b" }}>대기중</span>
                        )}
                        <span className={styles.tStatsInfo}>| 처리 {t.processed || 0}건 · 대기 {queue.filter(q => q.assignedTo === t.id).length}명</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>시간대별 예상 혼잡도</div>
            <div className={styles.chartContainer}>
              <div className={styles.chartBars}>
                {hourlyData.map((d, i) => {
                  const isNow = d.h === String(new Date().getHours()).padStart(2, "0");
                  return (
                    <div key={i} className={styles.barCol}>
                      <div style={{ fontSize: 11, color: isNow ? "#031714" : "#94a3b8", fontWeight: isNow ? 800 : 500, marginBottom: 4 }}>{d.total}</div>
                      <div className={styles.barFill} style={{ height: `${(d.total / maxHourly) * 100}%`, background: isNow ? "linear-gradient(180deg, #009A83, #007f6b)" : "#e2e8f0" }} />
                      <div className={styles.barLabel}>{d.h}시</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.ratioContainer}>
              <div className={styles.panelTitle} style={{ fontSize: 13, marginBottom: 12 }}>레벨별 업무 비율</div>
              {taskRatioError ? (
                <div style={{ color: "#ef4444", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "bold" }}>⚠️ {taskRatioError}</div>
              ) : (
                <div className={styles.ratioList}>
                  {taskRatios.map(r => (
                    <div key={r.lv}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span className={styles[`levelText${r.lv}`]} style={{ fontSize: 12, fontWeight: 700 }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{r.pct}%</span>
                      </div>
                      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                        <div className={styles[`levelFill${r.lv}`]} style={{ height: "100%", width: `${r.pct}%`, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>현재 상위 대기열 (최대 5명)</div>
          {queue.slice(0, 5).length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: 14 }}>현재 대기 중인 고객이 없습니다.</div>
          ) : (
            <div className={styles.aiGrid}>
              {queue.slice(0, 5).map((q) => (
                <div key={q.taskId} className={styles.aiCard} style={{ borderTop: "3px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{q.id} 고객</span><span style={{ fontSize: 12, fontWeight: 700, color: "#009A83" }}>대기중</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 4, fontWeight: 500 }}>{q.name} 고객님</div>
                  <div className={styles[`levelText${q.level || 1}`]} style={{ fontSize: 15, fontWeight: 800 }}>{q.prediction}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isTransferModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTransferModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>전체 대기열 및 강제 창구 이관</h2>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
          
            <div style={{ overflowY: "auto", maxHeight: "400px", borderBottom: "1px solid #e2e8f0" }}>
              {queue.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>현재 대기 중인 고객이 없습니다.</div>
              ) : (
                <table className={styles.table}>
                  <colgroup><col style={{ width: '12%' }} /><col style={{ width: '15%' }} /><col style={{ width: '23%' }} /><col style={{ width: '22%' }} /><col style={{ width: '28%' }} /></colgroup>
                  <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
                    <tr><th>대기번호</th><th>고객명</th><th>업무</th><th>배정된 창구</th><th>관리</th></tr>
                  </thead>
                  <tbody>
                    {queue.map(q => {
                      const assigned = tellers.find(t => t.id === q.assignedTo);
                      const isEditing = selectedCustomerToTransfer === q.taskId;
                      return (
                        <tr key={q.taskId}>
                          <td style={{ fontWeight: 800 }}>{q.id}</td><td>{q.name}</td>
                          <td><span className={styles[`levelText${q.level || 1}`]} style={{ fontWeight: 700 }}>{q.prediction}</span></td>
                          <td>
                            {assigned ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: assigned.status === '업무중' ? '#ef4444' : '#22c55e' }} />{assigned.id}번 창구 ({assigned.name})
                              </div>
                            ) : ( <span style={{ color: "#94a3b8" }}>미배정</span> )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div className={styles.actionWrapper}>
                                <select className={styles.selectBox} onChange={(e) => triggerTransferConfirm(q.taskId, q.name, Number(e.target.value), q.level)} defaultValue={assigned ? assigned.id : ""}>
                                  <option value="" disabled>창구 선택</option>
                                  {/* 💡 [정렬] 드롭다운 메뉴는 직관적인 '창구 번호순'으로 정렬! (깔끔한 기본 텍스트) */}
                                  {[...tellers].sort((a, b) => a.id - b.id).map(t => ( 
                                    <option key={t.id} value={t.id}>{t.id}번 창구 ({t.name})</option> 
                                  ))}
                                </select>
                                <button className={styles.cancelBtn} onClick={() => setSelectedCustomerToTransfer(null)}>취소</button>
                              </div>
                            ) : (
                              <button className={styles.changeBtn} onClick={() => setSelectedCustomerToTransfer(q.taskId)}>이관 변경</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {toastMsg && <div className={styles.toast}>✓ {toastMsg}</div>}
    </div>
  );
}