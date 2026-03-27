import React, { useState } from 'react';
import styles from './Kiosk.module.css';

const KioskTaskSelect = ({ formData, setFormData, onNext, onPrev, userName }) => {
    // 현재 활성화된 카테고리 (기본값 0: 빠른 업무)
    const [activeCategory, setActiveCategory] = useState(0);

    // 카테고리 및 세부 업무 데이터
    const categories = [
        {
            id: 0,
            title: '빠른 업무',
            subtitle: 'EXPRESS SERVICE',
            items: ['계좌개설','입금', '출금','이체','체크카드 발급','통장 비밀번호 변경'],
            footer: '건당 3~5분·대기 3명',
            columns: 1 // 버튼 배열을 1열로
        },
        // 계좌/개설, 입/출금 , 체크카드 발급, 통장 비밀번호 재설정
        {
            id: 1,
            title: '상담 업무',
            subtitle: 'CONSULTATION',
            items: ['예금','적금','보험상담','펀드상담', '신용카드 신청','연금신청','신용대출','소상공인 대출', '주택담보대출', '전세자금대출'],
            footer: '건당 10분·대기 11명',
            columns: 2 // 버튼 배열을 2열로
        },
        // 예금 · 적금 신규, 청약저축, 신용카드 신청, 모바일뱅킹 · OTP, 대출(전세자금, 주택담보)  , 퇴직연금, 펀드보험 상담
        {
            id: 2,
            title: '기업 • 특수',
            subtitle: 'CORPORATE / SPECIAL',
            items: ['기업대출', '법인계좌 개설','법인카드 발급','부도관리','연체관리'],
            footer: '건당 25분·대기 2명',
            columns: 1 // 버튼 배열을 1열로
        }
        // 기업대출, 법인계좌 개설, 부도 · 연체관리
    ];
    // 업무 선택 시 formData에 저장하고 다음 단계로 이동
    const handleTaskClick = (task, taskType) => {
        setFormData(prev => ({ ...prev, task: task, taskType: taskType }));
        onNext();
    };

    return (
        <div className={styles.taskSelectArea}>
            {/* 상단 로그인 유저 정보 표시 */}
            <div className={styles.userInfoWrapper}>
                <span className={styles.userBadge}>
                    <span className={styles.badgeText}>본인확인완료</span>
                    <span className={styles.badgeDot}>•</span>
                    <span className={styles.userName}>{userName}님</span>
                </span>
            </div>

            <div className={styles.progressIndicator}>
                <div className={styles.step}></div>
                <div className={styles.step}></div>
                <div className={styles.step}></div>
                <div className={`${styles.step} ${styles.active}`}></div>
                <div className={styles.step}></div>
            </div>

            <div className={styles.taskHeader}>
                <h2 className={styles.taskMainTitle}>어떤 업무로 방문하셨나요?</h2>
            </div>

            {/* 업무 카테고리 카드 영역 */}
            <div className={styles.categoryContainer}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`${styles.categoryCard} ${activeCategory === cat.id ? styles.activeCard : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <div className={styles.categoryTitleBox}>
                            <h3 className={styles.categoryTitle}>{cat.title}</h3>
                            <p className={styles.categorySubtitle}>{cat.subtitle}</p>
                        </div>

                        {/* 활성화된 카테고리일 때만 세부 버튼 렌더링 */}
                        {activeCategory === cat.id && (
                            <>
                                <div className={styles.taskGrid} style={{ gridTemplateColumns: `repeat(${cat.columns}, 1fr)` }}>
                                    {cat.items.map((item, index) => (
                                        <button
                                            key={index}
                                            className={styles.taskItemBtn}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않게 방지
                                                handleTaskClick(item, cat.title);
                                            }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.categoryFooter}>
                                    {cat.footer}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* 이전으로 버튼 */}
            <button className={styles.prevButton} onClick={onPrev}>
                ← 이전으로
            </button>
        </div>
    );
};

export default KioskTaskSelect;