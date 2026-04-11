import React, { useState } from 'react';
import styles from './TossModal.module.css';

const TossModal = ({ onClose, task }) => {
    const [isListOpen, setIsListOpen] = useState(false);
    // 1. 선택된 직원을 저장할 State 추가
    const [selectedStaff, setSelectedStaff] = useState(null);

    const staffList = [
        { id: 1, name: '김민준', counter: '1번 창구', dept: '개인금융', waiting: 2, initial: '김' },
        { id: 2, name: '박지호', counter: '3번 창구', dept: '개인금융', waiting: 3, initial: '박' },
        { id: 3, name: '이수연', counter: '2번 창구', dept: '기업금융', waiting: 1, initial: '이' },
        { id: 4, name: '최다은', counter: '4번 창구', dept: '대출팀', waiting: 0, initial: '최' },
    ];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h1>창구 이관</h1>
                </header>

                <div className={styles.content}>
                    <div className={styles.customerCard}>
                        <div className={styles.customerName}>
                            <strong>{task?.userName || '고객명'}</strong> <small>접수번호: {task?.taskId || 'C-000'}</small>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>이관 직원 대상</label>
                        <div
                            className={styles.selectTrigger}
                            onClick={() => setIsListOpen(!isListOpen)}
                        >
                            <span>
                                {selectedStaff
                                    ? `${selectedStaff.name} (${selectedStaff.dept})`
                                    : '직원을 선택해주세요'}
                            </span>
                            <span className={styles.arrow}>{isListOpen ? '▲' : '▼'}</span>
                        </div>

                        {isListOpen && (
                            <div className={styles.staffList}>
                                {staffList.map((staff) => (
                                    <div
                                        key={staff.id}
                                        className={styles.staffItem}
                                        onClick={() => {
                                            setSelectedStaff(staff);
                                            setIsListOpen(false);
                                        }}
                                    >
                                        <div className={styles.avatar}>{staff.initial}</div>
                                        <div className={styles.staffInfo}>
                                            <strong>{staff.name}</strong> {staff.counter} {staff.dept}
                                            <span className={styles.waiting}>대기 {staff.waiting}건</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <footer className={styles.footer}>
                    <button className={styles.btnClose} onClick={onClose}>닫기</button>
                    <button
                        className={styles.btnSubmit}
                        disabled={!selectedStaff}
                        onClick={() => {
                            console.log("이관 대상:", selectedStaff);
                            alert(`${selectedStaff.name}님에게 이관합니다.`);
                        }}
                    >
                        이관 실행
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TossModal;