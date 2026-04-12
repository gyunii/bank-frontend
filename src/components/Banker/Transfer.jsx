import React, { useState, useEffect } from 'react';
import styles from './Transfer.module.css';

// 목업 데이터: 실제로는 props나 context를 통해 받아와야 합니다.
const mockAccounts = [
    { accountNumber: '110-234-567890', balance: 1500000, alias: '주거래 통장' },
    { accountNumber: '333-90-1234567', balance: 500000, alias: '용돈 통장' },
    { accountNumber: '123-45-6789012', balance: 10000000, alias: '비상금' }
];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
};

const Transfer = ({ onCancel, onConfirm }) => {
    const [fromAccountNumber, setFromAccountNumber] = useState(mockAccounts[0]?.accountNumber || '');
    const [accountPassword, setAccountPassword] = useState('');
    const [toAccountNumber, setToAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAccountBalance, setSelectedAccountBalance] = useState(mockAccounts[0]?.balance || 0);

    useEffect(() => {
        const selected = mockAccounts.find(acc => acc.accountNumber === fromAccountNumber);
        if (selected) {
            setSelectedAccountBalance(selected.balance);
        }
    }, [fromAccountNumber]);

    const handleAmountButtonClick = (value) => {
        if (value === 'full') {
            setAmount(selectedAccountBalance);
        } else {
            setAmount(prev => (Number(prev) || 0) + value);
        }
    };

    const handleTransfer = () => {
        // 실제 이체 로직은 여기에 구현합니다.
        // 지금은 UI 목적으로 콘솔에 로그만 출력합니다.
        if (!fromAccountNumber || !accountPassword || !toAccountNumber || !amount) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        if (amount > selectedAccountBalance) {
            alert("잔액이 부족합니다.");
            return;
        }
        console.log({
            fromAccountNumber,
            accountPassword,
            toAccountNumber,
            amount: Number(amount)
        });
        // onConfirm prop이 있으면 호출
        if (onConfirm) {
            onConfirm({ fromAccountNumber, accountPassword, toAccountNumber, amount: Number(amount) });
        }
        alert("이체 처리가 완료되었습니다. (콘솔 확인)");
    };

    return (
        <div className={styles.transferContainer}>
            <h3 className={styles.title}>계좌 이체</h3>

            <div className={styles.inputGroup}>
                <label htmlFor="fromAccount">출금 계좌</label>
                <select
                    id="fromAccount"
                    className={styles.input}
                    value={fromAccountNumber}
                    onChange={(e) => setFromAccountNumber(e.target.value)}
                >
                    {mockAccounts.map(acc => (
                        <option key={acc.accountNumber} value={acc.accountNumber}>
                            {acc.alias} ({acc.accountNumber})
                        </option>
                    ))}
                </select>
                <div className={styles.balanceInfo}>
                    출금 가능 잔액: {formatCurrency(selectedAccountBalance)}원
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="accountPassword">계좌 비밀번호</label>
                <input
                    type="password"
                    id="accountPassword"
                    className={styles.input}
                    placeholder="비밀번호 4자리를 입력하세요"
                    maxLength="4"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="toAccount">입금 계좌번호</label>
                <input
                    type="text"
                    id="toAccount"
                    className={styles.input}
                    placeholder="'-' 없이 계좌번호 입력"
                    value={toAccountNumber}
                    onChange={(e) => setToAccountNumber(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="amount">이체 금액</label>
                <input
                    type="number"
                    id="amount"
                    className={styles.input}
                    placeholder="금액을 입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <div className={styles.amountButtons}>
                    <button onClick={() => handleAmountButtonClick(10000)}>+1만</button>
                    <button onClick={() => handleAmountButtonClick(50000)}>+5만</button>
                    <button onClick={() => handleAmountButtonClick(100000)}>+10만</button>
                    <button onClick={() => handleAmountButtonClick('full')}>전액</button>
                </div>
            </div>

            <div className={styles.buttonRow}>
                <button className={styles.btnCancel} onClick={onCancel}>취소</button>
                <button className={styles.btnSubmit}  onClick={handleTransfer}>이체 실행</button>
            </div>
        </div>
    );
};

export default Transfer;
