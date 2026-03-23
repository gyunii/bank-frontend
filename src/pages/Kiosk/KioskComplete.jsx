import React, { useState, useEffect, useRef } from 'react';
import styles from './Kiosk.module.css';

const KioskComplete = ({ formData, onGoHome, onAddMore, userName }) => {
    const [ticketInfo, setTicketInfo] = useState({
        ticketNumber: '',
        level: '',
        counter: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const isSubmitted = useRef(false); // 중복 호출 방지용 ref

    const categoryName = formData.taskType;

    useEffect(() => {
        // 이미 제출되었으면 실행하지 않음
        if (isSubmitted.current) return;
        isSubmitted.current = true;

        const submitFormData = async () => {
            try {
                const response = await fetch('/api/kiosk/task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        taskType: formData.taskType,
                        taskDetailType: formData.task
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    
                    switch (data.result) {
                        case 'SUCCESS':
                            // 대기표 발급 성공 후 확인 API 호출
                            const checkResponse = await fetch('/api/kiosk/task');
                            if (checkResponse.ok) {
                                const checkData = await checkResponse.json();
                                if (checkData.result === 'SUCCESS') {
                                    const task = checkData.task;
                                    setTicketInfo({
                                        ticketNumber: task.ticketNumber || '-',
                                        level: task.assignedLevel || '-',
                                        counter: task.name ? `${task.name} (${task.level})` : '배정 중'
                                    });
                                } else {
                                    console.error("Failed to get task info:", checkData);
                                }
                            }
                            break;
                        case 'FAILURE_TASK_IN_PROGRESS':
                            alert('이미 처리중인 업무가 있습니다.');
                            onGoHome();
                            break;
                        case 'FAILURE_SESSION':
                            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                            onGoHome(); // 또는 로그인 페이지로 이동
                            break;
                        case 'FAILURE':
                        default:
                            alert('대기표 발급에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
                            onGoHome();
                            break;
                    }
                } else {
                    alert('서버 오류 발생');
                    onGoHome();
                }
            } catch (error) {
                console.error('최종 접수 처리 중 에러 발생:', error);
                alert('접수 처리 중 문제가 발생했습니다. 창구에 문의해주세요.');
                onGoHome();
            } finally {
                setIsLoading(false);
            }
        };

        submitFormData();
    }, [formData, onGoHome]);

    // 7초 자동 이동 타이머 (버튼을 직접 누르지 않아도 넘어가게 유지)
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                onGoHome();
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, onGoHome]);

    return (
        <div className={styles.completeArea}>
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
                <div className={styles.step}></div>
                <div className={`${styles.step} ${styles.active}`}></div>
            </div>

            <div className={styles.completeHeader}>
                <h2 className={styles.completeTitle}>{categoryName} 선택 완료</h2>
                <p className={styles.completeSubtitle}>
                    {isLoading ? '고객님의 정보를 서버로 전송하고 있습니다...' : 'AI 가 최적의 담당 창구를 배치 중 입니다.'}
                </p>
            </div>

            {!isLoading && (
                <>
                    <div className={styles.ticketCard}>
                        <div className={styles.ticketNumber}>{ticketInfo.ticketNumber}</div>

                        <div className={styles.ticketDetails}>
                            <div className={styles.ticketRow}>
                                <span className={styles.ticketLabel}>선택 업무</span>
                                <div className={styles.ticketDashes}></div>
                                <span className={styles.ticketValue}>{categoryName}</span>
                            </div>
                            <div className={styles.ticketRow}>
                                <span className={styles.ticketLabel}>배치 레벨</span>
                                <div className={styles.ticketDashes}></div>
                                <span className={styles.ticketValue}>{ticketInfo.level}</span>
                            </div>
                            <div className={styles.ticketRow}>
                                <span className={styles.ticketLabel}>예상 창구</span>
                                <div className={styles.ticketDashes}></div>
                                <span className={styles.ticketValue}>{ticketInfo.counter}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.goHomeBtn} onClick={onGoHome}>
                            처음으로 돌아가기
                        </button>
                        <button className={styles.addMoreBtn} onClick={onAddMore}>
                            추가 업무 접수
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default KioskComplete;