import React, { useState, useEffect } from "react";
import styles from "./Admin_dashboard.module.css";
import CustomModal from "../../components/common/CustomModal"; 

// --- Mock Data ---
const initialTellers = [
  { id: 1, name: "김민지", level: 1, role: "신입행원", status: "active", queue: 4, processed: 12, elapsedTime: 850 },
  { id: 2, name: "이준혁", level: 2, role: "일반행원", status: "idle", queue: 0, processed: 8, elapsedTime: 0 },
  { id: 3, name: "박소연", level: 2, role: "일반행원", status: "active", queue: 5, processed: 9, elapsedTime: 1245 },
  { id: 4, name: "최도윤", level: 3, role: "대리", status: "active", queue: 3, processed: 6, elapsedTime: 420 },
  { id: 5, name: "정하은", level: 4, role: "차장", status: "active", queue: 2, processed: 4, elapsedTime: 180 },
  { id: 6, name: "강현우", level: 5, role: "지점장", status: "idle", queue: 0, processed: 2, elapsedTime: 0 },
];

const initialQueue = [
  { id: "A-047", name: "홍길동", prediction: "통장정리", level: 1, assignedTo: 1, expectedMins: 5, isIssue: false },
  { id: "A-048", name: "김민수", prediction: "주택담보대출 상담", level: 4, assignedTo: 5, expectedMins: 45, isIssue: true },
  { id: "A-049", name: "이지은", prediction: "VIP 자산관리", level: 5, assignedTo: 6, expectedMins: 30, isIssue: true },
  { id: "A-050", name: "박도윤", prediction: "예금 신규 가입", level: 2, assignedTo: 3, expectedMins: 15, isIssue: true },
  { id: "A-051", name: "최서아", prediction: "법인계좌 개설", level: 5, assignedTo: 4, expectedMins: 25, isIssue: false },
];

const HOURLY = [
  { h: "09", total: 15 }, { h: "10", total: 42 }, { h: "11", total: 58 },
  { h: "12", total: 35 }, { h: "13", total: 48 }, { h: "14", total: 65 },
  { h: "15", total: 40 }, { h: "16", total: 22 },
];

const LEVEL_COLORS = {
  1: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" }, // 아주 연한 민트 (L1)
  2: { bg: "#dcfce7", text: "#15803d", border: "#86efac" }, // 연한 그린 (L2)
  3: { bg: "#bbf7d0", text: "#166534", border: "#4ade80" }, // 중간 그린 (L3)
  4: { bg: "#86efac", text: "#065f46", border: "#22c55e" }, // 진한 민트그린 (L4)
  5: { bg: "#059669", text: "#1e1e1e", border: "#047857" }, // 딥 에메랄드 (L5)
};
const maxHourly = Math.max(...HOURLY.map(d => d.total));

export default function Admin_dashboard() {
  const [tellers, setTellers] = useState(initialTellers);
  const [queue, setQueue] = useState(initialQueue);
  const [noticeText, setNoticeText] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  
  // 모달 및 이관 제어 State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCustomerToTransfer, setSelectedCustomerToTransfer] = useState(null);
  
  // CustomModal(공통 모달) 제어용 State
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, customerId: null, customerName: "", newTellerId: null, tellerName: "" });
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // 시계 & 타이머
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setTellers(prev => prev.map(t => 
        t.status === "active" ? { ...t, elapsedTime: t.elapsedTime + 1 } : t
      ));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalWaiting = queue.length + 15; 
  const activeTellersCount = tellers.filter(t => t.status === "active").length;
  const totalProcessedToday = tellers.reduce((acc, t) => acc + t.processed, 0);

  const handleSendNotice = () => {
    if(!noticeText.trim()) return;
    setToastMsg(`전체 창구에 공지가 전송되었습니다: "${noticeText}"`);
    setNoticeText("");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. 셀렉트박스 선택 시 -> "이관 확인" 모달 열기
  const triggerTransferConfirm = (customerId, customerName, newTellerId) => {
    const selectedTeller = tellers.find(t => t.id === newTellerId);
    setConfirmModalData({
      isOpen: true,
      customerId: customerId,
      customerName: customerName,
      newTellerId: newTellerId,
      tellerName: selectedTeller ? selectedTeller.name : ""
    });
  };

  // 2. "이관 확인" 모달에서 [이관 실행] 클릭 시 -> 이관 처리 후 "완료 모달" 띄우기
  const executeTransfer = () => {
    const { customerId, newTellerId } = confirmModalData;
    
    // 이관 처리
    setQueue(prev => prev.map(q => 
      q.id === customerId ? { ...q, assignedTo: newTellerId } : q
    ));
    
    // 상태 초기화 및 모달 전환
    setConfirmModalData({ isOpen: false, customerId: null, customerName: "", newTellerId: null, tellerName: "" });
    setSelectedCustomerToTransfer(null);
    setSuccessModalOpen(true); // 완료 모달 띄우기
  };

  const top5Queue = [...queue]
    .sort((a, b) => (b.isIssue === a.isIssue ? 0 : b.isIssue ? 1 : -1))
    .slice(0, 5);

  return (
    <div className={styles.adminRoot}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.logo}>

          <span> 창구 관리 시스템</span>
        </div>
        <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {timeStr}
        </div>
      </header>

      <main className={styles.main}>
        {/* Top: 실시간 긴급 지표 & 공지 전송 */}
        <div className={styles.topRow}>
          <div className={`${styles.kpiCard} ${styles.kpiClickable}`} onClick={() => setIsTransferModalOpen(true)}>
            <div className={styles.kpiLabel}>전체 대기 인원 </div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>
              {totalWaiting} <span style={{ fontSize: 16, color: "#009A83" }}>명</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>처리중 창구 현황</div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>
              {activeTellersCount} <span style={{ fontSize: 16, color: "#009A83" }}>개</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>오늘 총 처리 건수</div>
            <div className={styles.kpiValue} style={{ color: "#009A83" }}>
              {totalProcessedToday} <span style={{ fontSize: 16, color: "#009A83" }}>건</span>
            </div>
          </div>

          <div className={`${styles.kpiCard} ${styles.noticeWrap}`}>
            <div className={styles.kpiLabel}>&nbsp;&nbsp;&nbsp;전 창구 공지 전송</div>
            <div className={styles.noticeInputGroup}>
              <input 
                type="text" 
                className={styles.noticeInput} 
                placeholder="공지사항을 입력하세요." 
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendNotice()}
              />
              <button className={styles.noticeBtn} onClick={handleSendNotice}>전송</button>
            </div>
          </div>
        </div>

        {/* Middle: 관제 & 통계 */}
        <div className={styles.grid2Col}>
          {/* 좌측: 직원별 창구 모니터링 */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <span style={{ color: "#22c55e" }}></span> 실시간 창구 모니터링
            </div>
            {tellers.map(t => {
              const isDelayed = t.elapsedTime >= 1200;
              return (
                <div key={t.id} className={`${styles.tellerRow} ${isDelayed ? styles.delayed : ''}`}>
                  <div className={styles.tellerLeft}>
                    <div className={styles.tLevel} style={{ background: LEVEL_COLORS[t.level].bg, color: LEVEL_COLORS[t.level].text }}>
                      L{t.level}
                    </div>
                    <div className={styles.tNameGroup}>
                      <span className={styles.tName}>{t.name}</span>
                      <span className={styles.tRole}>{t.role}</span>
                    </div>
                  </div>

                  <div className={styles.tellerRight}>
                    <div className={`${styles.tTime} ${isDelayed ? styles.tTimeDelayedText : ''}`}>
                      {t.status === "active" ? formatTime(t.elapsedTime) : "--:--"}
                    </div>
                    
                    <div className={styles.tStatusWrapper}>
                      {t.status === "active" ? (
                        <span className={styles.tStatusBadge} style={{ background: isDelayed ? "#fee2e2" : "#dcfce7", color: isDelayed ? "" : "#166534" }}>
                          {isDelayed ? "️업무 지연" : "업무중"}
                        </span>
                      ) : (
                        <span className={styles.tStatusBadge} style={{ background: "#f1f5f9", color: "#64748b" }}>대기중</span>
                      )}
                      <span className={styles.tStatsInfo}>| 처리 {t.processed}건 · 대기 {t.queue}명</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 우측: 현황 차트 */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
           시간대별 예상 혼잡도
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartBars}>
                {HOURLY.map((d, i) => {
                  const isNow = d.h === "14";
                  return (
                    <div key={i} className={styles.barCol}>
                      <div style={{ fontSize: 11, color: isNow ? "#031714" : "#94a3b8", fontWeight: isNow ? 800 : 500, marginBottom: 4 }}>{d.total}</div>
                      <div className={styles.barFill} style={{ 
                        height: `${(d.total / maxHourly) * 100}%`,
                        background: isNow ? "linear-gradient(180deg, #009A83, #007f6b)" : "#e2e8f0"
                      }} />
                      <div className={styles.barLabel}>{d.h}시</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.ratioContainer}>
              <div className={styles.panelTitle} style={{ fontSize: 13, marginBottom: 12 }}>레벨별 업무 비율 </div>
              <div className={styles.ratioList}>
                {[
                  { lv: 1, label: "단순 수신", pct: 38 },
                  { lv: 2, label: "상품 신규/변경", pct: 31 },
                  { lv: 3, label: "개인 여신", pct: 18 },
                  { lv: 4, label: "담보/복합", pct: 9 },
                  { lv: 5, label: "기업/특수", pct: 4 },
                ].map(r => (
                  <div key={r.lv}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: LEVEL_COLORS[r.lv].text, fontWeight: 700 }}>Lv.{r.lv} {r.label}</span>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{r.pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${r.pct}%`, background: LEVEL_COLORS[r.lv].text, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: AI 예측 대기열 */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
             AI 예측 대기열
          </div>
          <div className={styles.aiGrid}>
            {top5Queue.map((q) => (
              <div key={q.id} className={styles.aiCard} style={{ borderTop: q.isIssue ? "3px solid #009d84" : "3px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{q.id}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#009A83" }}>예상 {q.expectedMins}분</span>
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4, fontWeight: 500 }}>{q.name} 고객님</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: LEVEL_COLORS[q.level].text }}>{q.prediction}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- 강제 이관 대기열 리스트 --- */}
      {isTransferModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTransferModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>전체 대기열 및 강제 창구 이관</h2>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1 }}>
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>대기번호</th>
                    <th>고객명</th>
                    <th>업무</th>
                    <th>배정된 창구</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(q => {
                    const assigned = tellers.find(t => t.id === q.assignedTo);
                    const isEditing = selectedCustomerToTransfer === q.id;
                    
                    return (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 800 }}>{q.id}</td>
                        <td>{q.name}</td>
                        <td>
                          <span style={{ color: LEVEL_COLORS[q.level].text, fontWeight: 700 }}>{q.prediction}</span>
                        </td>
                        <td>
                          {assigned && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: assigned.status === 'active' ? '#ef4444' : '#22c55e' }} />
                              {assigned.id}번 창구 ({assigned.name})
                            </div>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className={styles.actionWrapper}>
                              <select 
                                className={styles.selectBox}
                                onChange={(e) => triggerTransferConfirm(q.id, q.name, Number(e.target.value))}
                                defaultValue={assigned ? assigned.id : ""}
                              >
                                {tellers.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.id}번 창구 ({t.name})
                                  </option>
                                ))}
                              </select>
                              <button 
                                className={styles.cancelBtn} 
                                onClick={() => setSelectedCustomerToTransfer(null)}
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button 
                              className={styles.changeBtn}
                              onClick={() => setSelectedCustomerToTransfer(q.id)}
                            >
                              이관 변경
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 이관 확인 팝업 */}
      <CustomModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ ...confirmModalData, isOpen: false })}
        title="이관 확인"
        onConfirm={executeTransfer}
        onCancel={() => setConfirmModalData({ ...confirmModalData, isOpen: false })}
        confirmText="이관 실행"
        cancelText="취소"
      >
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: "15px", lineHeight: "1.6", color: "#334155" }}>
          선택하신 <strong style={{ color: "#009A83" }}>{confirmModalData.tellerName}</strong> 창구로 <br />
          <strong>{confirmModalData.customerName}</strong> 고객님을 이관하시겠습니까?
        </div>
      </CustomModal>

      {/* 이관 성공 완료 팝업 */}
      <CustomModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="이관 완료"
        onConfirm={() => setSuccessModalOpen(false)}
        confirmText="확인"
      >
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: "15px", color: "#334155" }}>
          해당 고객이 성공적으로 이관되었습니다.
        </div>
      </CustomModal>

      {/* 글로벌 토스트 알림 */}
      {toastMsg && (
        <div className={styles.toast}>
          ✓ {toastMsg}
        </div>
      )}
    </div>
  );
}