import React, { useState } from 'react';
import styles from './FinancialProduct.module.css';
import TransFerIcon from '../../images/Banker/transfer.png';

const FinancialProduct = ({ onCancel, onSubmit }) => {
    // 목업 데이터: 금융 상품 목록
    const productList = [
        { id: 1, type: '적금', name: 'BankScope 정기적금', desc: '월 납입식 정기적금', rate: '연 5.5%' },
        { id: 2, type: '예금', name: '플러스 정기예금', desc: '거치식 정기예금', rate: '연 5.2%' },
        { id: 3, type: '적금', name: '청년희망적금', desc: '청년 대상 우대금리', rate: '연 6%' },
        { id: 4, type: '대출', name: '햇살론 신용대출', desc: '서민금융진흥원 연계', rate: '연 12.5%' },
        { id: 5, type: '보험', name: '실손 의료보험', desc: '시장 연동 월 납입 실손보험', rate: '' },
        { id: 6, type: '펀드', name: '스마트 인덱스 펀드', desc: '시장 연동 코스피200 추종', rate: '' },
    ];

    // 목업 데이터: 연결 계좌 목록
    const accountList = [
        { id: 1, type: '예금', name: '생활비통장', number: '210-111-222333', balance: 28450000 },
        { id: 2, type: '예금', name: 'VIP정기예금', number: '210-444-555666', balance: 50000000 },
    ];

    // 상태 관리
    const [selectedProduct, setSelectedProduct] = useState(productList[0].id);
    const [selectedAccount, setSelectedAccount] = useState(accountList[1].id);
    const [formData, setFormData] = useState({
        amount: '300,000',
        duration: '1년',
        transferDate: '매월 5일'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFormData({
            amount: '',
            duration: '1년',
            transferDate: '매월 5일'
        });
        setSelectedProduct(null);
        setSelectedAccount(null);
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({ selectedProduct, selectedAccount, ...formData });
        } else {
            alert('금융 상품이 신청되었습니다.');
        }
    };

    const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

    return (
        <div className={styles.container}>
            {/* 1. 상단 타이틀 */}
            <div className={styles.headerTitle}>
                <span ><img className={styles.icon} src={TransFerIcon} alt="금융상품가입"/></span> 금융상품 가입
            </div>

            {/* 2. 금융 상품 목록 그리드 */}
            <div className={styles.productGrid}>
                {productList.map(product => (
                    <div
                        key={product.id}
                        className={`${styles.productCard} ${selectedProduct === product.id ? styles.selected : ''}`}
                        onClick={() => setSelectedProduct(product.id)}
                    >
                        <span className={styles.tag}>{product.type}</span>
                        <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productDesc}>{product.desc}</p>
                        </div>
                        {product.rate && <span className={styles.rateHighlight}>{product.rate}</span>}
                    </div>
                ))}
            </div>

            {/* 3. 연결 계좌 선택 */}
            <div className={styles.accountSection}>
                <div className={styles.sectionLabel}>연결 계좌 (선택)</div>
                <div className={styles.accountList}>
                    {accountList.map(account => (
                        <div
                            key={account.id}
                            className={`${styles.accountCard} ${selectedAccount === account.id ? styles.selected : ''}`}
                            onClick={() => setSelectedAccount(account.id)}
                        >
                            <div className={styles.accountLeft}>
                                <span className={styles.tag}>{account.type}</span>
                                <div className={styles.accountDetails}>
                                    <span className={styles.accountName}>{account.name}</span>
                                    <span className={styles.accountNumber}>{account.number}</span>
                                </div>
                            </div>
                            <div className={styles.accountRight}>
                                {formatNumber(account.balance)} 원
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. 입력 폼 (기간, 금액, 이체일) - 레이아웃 수정 */}
            <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                <label>기간</label>
                <div className={styles.radioGroup}>
                    {['6개월', '1년', '2년', '3년'].map(term => (
                        <label key={term} className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="duration"
                                value={term}
                                checked={formData.duration === term}
                                onChange={handleChange}
                            />
                            {term}
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.inputFormRow}>
                <div className={styles.inputGroup}>
                    <label>납입 금액</label>
                    <div className={styles.amountInputWrap}>
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>자동 이체일</label>
                    <select name="transferDate" value={formData.transferDate} onChange={handleChange} className={styles.dateSelect}>
                        <option value="매월 5일">매월 5일</option>
                        <option value="매월 10일">매월 10일</option>
                        <option value="매월 15일">매월 15일</option>
                        <option value="매월 25일">매월 25일</option>
                    </select>
                </div>
            </div>

            {/* 5. 하단 버튼 영역 */}
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

export default FinancialProduct;
