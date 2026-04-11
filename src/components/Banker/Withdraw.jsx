import React, { useState } from 'react';
import styles from './Withdraw.module.css';

const Withdraw = ({ onCancel, onWithdraw }) => {
    const [formData, setFormData] = useState({
        myAccount: '입출금 통장',
        alias: '갑수 통장',
        password: '',
        confirmPassword: '',
        amount: '300,000'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.container}>
            {/* 상단 타이틀 바 */}
            <header className={styles.header}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                <h1 className={styles.headerTitle}>출금 업무</h1>
            </header>

            <div className={styles.formContainer}>
                {/* 1. 출금 계좌 선택 섹션 */}
                <div className={styles.section}>
                    <div className={styles.labelRow}>
                        <span className={styles.centerLabel}>출금 계좌 선택</span>
                        <span className={styles.rightLabel}>계좌 별칭</span>
                    </div>
                    <div className={styles.inputRow}>
                        <div className={styles.customSelectMain}>
                            <select name="myAccount" value={formData.myAccount} onChange={handleChange}>
                                <option value="입출금 통장">입출금 통장</option>
                                <option value="마이너스 통장">마이너스 통장</option>
                            </select>
                            <span className={styles.arrowDown}>▼</span>
                        </div>
                        <div className={styles.aliasInputBox}>
                            <input
                                name="alias"
                                type="text"
                                value={formData.alias}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {/* 계좌 정보 및 잔액 표시 박스 */}
                    <div className={styles.mintInfoBox}>
                        $$ 통장 1234-56789-1234 잔액 : 300,000원
                    </div>
                </div>

                {/* 2. 비밀번호 섹션 */}
                <div className={styles.section}>
                    <div className={styles.gridTwo}>
                        <div className={styles.inputGroup}>
                            <label className={styles.centerLabel}>계좌 비밀번호</label>
                            <div className={styles.inputFieldBox}>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="●●●●●●"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.centerLabel}>계좌 비밀번호 확인</label>
                            <div className={styles.inputFieldBox}>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="한번 더 입력해주세요"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. 출금 금액 섹션 */}
                <div className={styles.section}>
                    <div className={styles.labelRow}>
                        <span className={styles.centerLabel}>출금 금액</span>
                    </div>
                    <div className={styles.amountFieldBox}>
                        <input
                            name="amount"
                            type="text"
                            value={formData.amount}
                            onChange={handleChange}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                </div>

                {/* 4. 하단 버튼 (이전으로 버튼 제외) */}
                <div className={styles.buttonRow}>
                    <button className={styles.btnCancel} onClick={onCancel}>취소</button>
                    <button className={styles.btnSubmit} onClick={() => onWithdraw(formData)}>출금 실행</button>
                </div>
            </div>
        </div>
    );
};

export default Withdraw;