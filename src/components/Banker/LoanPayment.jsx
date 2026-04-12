import React, { useState } from 'react';
import styles from './LoanPayment.module.css';
import loansIcon from '../../images/Home/Loans.png';

const LoanPayment = ({ onCancel, onCreate }) => {
    // 목업 데이터: 대출 목록
    const loanList = [
        {
            id: 1,
            name: '주택담보대출',
            balance: 138200000,
            principal: 150000000,
            rate: 4.2,
            monthly: 820000,
            nextDate: '2025-04-25',
            status: '활성',
            progress: 8,
        },
        {
            id: 2,
            name: '전세자금대출',
            balance: 50000000,
            principal: 50000000,
            rate: 3.8,
            monthly: 158000,
            nextDate: '2025-04-10',
            status: '활성',
            progress: 0,
        }
    ];

    // 목업 데이터: 출금 계좌
    const accountInfo = {
        type: '예금',
        name: 'VIP정기예금',
        number: '210-444-555666',
        balance: 50000000,
    };

    const [selectedLoan, setSelectedLoan] = useState(loanList[0].id);
    const [formData, setFormData] = useState({
        password: '',
        passwordConfirm: '',
        amount: '300,000',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFormData({
            password: '',
            passwordConfirm: '',
            amount: '',
        });
    };

    const handleSubmit = () => {
        if (formData.password !== formData.passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (onCreate) onCreate({ selectedLoan, ...formData });
        else alert('대출 상환이 실행되었습니다.');
    };

    // 숫자를 콤마 포맷으로 변환하는 헬퍼 함수
    const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

    return (
        <div className={styles.container}>
            {/* 1. 상단 타이틀 바 */}
            <div className={styles.headerTitle}>
                <span ><img className={styles.icon} src={loansIcon} alt="대출 상환"/></span> 대출 상환
            </div>

            {/* 2. 대출 목록 리스트 */}
            <div className={styles.loanList}>
                {loanList.map((loan) => (
                    <div
                        key={loan.id}
                        className={`${styles.loanCard} ${selectedLoan === loan.id ? styles.selected : ''}`}
                        onClick={() => setSelectedLoan(loan.id)}
                    >
                        <div className={styles.cardTop}>
                            <h3 className={styles.loanName}>{loan.name}</h3>
                            <span className={styles.statusTag}>{loan.status}</span>
                        </div>

                        <div className={styles.cardMid}>
                            <div className={styles.balanceWrap}>
                                <span className={styles.balanceText}>잔여</span>
                                <span className={styles.balanceAmount}>{formatNumber(loan.balance)} 원</span>
                            </div>
                            <div className={styles.progressText}>상환률 {loan.progress}%</div>
                        </div>

                        <div className={styles.cardBottom}>
                            <p>원금 {formatNumber(loan.principal)}원 · 금리 연{loan.rate}% · 월 {formatNumber(loan.monthly)}원</p>
                            <p>다음 납부일: {loan.nextDate}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. 출금 계좌 섹션 */}
            <div className={styles.accountSection}>
                <div className={styles.sectionLabel}>출금 계좌 (선택)</div>
                <div className={styles.accountBox}>
                    <div className={styles.accountLeft}>
                        <span className={styles.accountTag}>{accountInfo.type}</span>
                        <div className={styles.accountDetails}>
                            <span className={styles.accountName}>{accountInfo.name}</span>
                            <span className={styles.accountNumber}>{accountInfo.number}</span>
                        </div>
                    </div>
                    <div className={styles.accountRight}>
                        {formatNumber(accountInfo.balance)} 원
                    </div>
                </div>
            </div>

            {/* 4. 입력 폼 섹션 */}
            <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                    <label>계좌 비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="●●●●●●"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>계좌 비밀번호</label>
                    <input
                        type="password"
                        name="passwordConfirm"
                        placeholder="한번 더 입력해주세요"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>출금 금액</label>
                    <div className={styles.amountInputWrap}>
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className={styles.amountInput}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                </div>
            </div>

            {/* 5. 하단 액션 버튼 */}
            <div className={styles.buttonRow}>
                <div className={styles.leftActions}>
                    <button className={styles.btnCancel} onClick={onCancel}>취소</button>
                </div>
                <div className={styles.rightActions}>
                    <button className={styles.btnReset} onClick={handleReset}>초기화</button>
                    <button className={styles.btnSubmit} onClick={handleSubmit}>신청 확정</button>
                </div>
            </div>
        </div>
    );
};

export default LoanPayment;
