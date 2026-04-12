import React, { useState } from 'react';
import styles from './Card.module.css';

const Card = ({ onCancel, onCreate }) => {
    // 탭 상태 관리 ('register' 또는 'list')
    const [activeTab, setActiveTab] = useState('register');

    // [카드 발급] 폼 상태 관리
    const [formData, setFormData] = useState({
        name: '김갑수',
        ssn: '701012-1324567',
        customerType: '기존', // 신규/기존
        telecom: 'SKT',
        phone: '010-1234-5678',
        cardNickname: '갑수 카드',
        cardBrand: '',
        cardType: '개인', // 법인/개인
        payType: '체크', // 신용/체크
        account: '123-456-789',
        payDate: '매월 5일',
        password: ''
    });

    // [카드 목록] 샘플 데이터
    const cardList = [
        { id: 1, type: '개인', status: '활성', number: '3821', payDate: '15일', regDate: '26년 03월 01일', isSelected: false, isPending: false },
        { id: 2, type: '법인', status: '발급중', number: '3821', payDate: '15일', regDate: '26년 04월 06일', isSelected: false, isPending: true },
        { id: 3, type: '개인', status: '활성', number: '3821', payDate: '15일', regDate: '26년 03월 01일', isSelected: true, isPending: false },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (onCreate) onCreate(formData);
        alert('카드 발급이 신청되었습니다.');
        setActiveTab('list'); // 발급 후 목록 탭으로 이동
    };

    return (
        <div className={styles.container}>
            {/* --- 공통: 상단 탭 --- */}
            <div className={styles.headerTabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
                    onClick={() => setActiveTab('register')}
                >
                    카드 발급
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    카드 목록
                </div>
            </div>

            {/* --- 탭 1: 카드 발급 폼 --- */}
            {activeTab === 'register' && (
                <div className={styles.registerContent}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>이름</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />
                            <div className={styles.radioGroup}>
                                <label><input type="radio" name="customerType" value="신규" checked={formData.customerType === '신규'} onChange={handleChange} /> 신규 가입</label>
                                <label><input type="radio" name="customerType" value="기존" checked={formData.customerType === '기존'} onChange={handleChange} /> 기존 고객님</label>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>주민등록번호</label>
                            <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>통신사</label>
                            <select name="telecom" value={formData.telecom} onChange={handleChange}>
                                <option value="SKT">SKT</option>
                                <option value="KT">KT</option>
                                <option value="LG">LG U+</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>전화번호</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label>카드 브랜드</label>
                            <div className={styles.brandSelector}>
                                <select name="cardBrand" value={formData.cardBrand} onChange={handleChange}>
                                    <option value="">브랜드를 선택하세요</option>
                                    <option value="VISA">VISA</option>
                                    <option value="MASTER">MASTER CARD</option>
                                    <option value="AMEX">AMERICAN EXPRESS</option>
                                </select>
                                <div className={styles.brandTags}>
                                    <span>VISA</span> <span>MASTER CARD</span> <span>AMERICAN EXPRESS</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>카드 종류</label>
                            <div className={styles.radioRow}>
                                <label><input type="radio" name="cardType" value="법인" checked={formData.cardType === '법인'} onChange={handleChange}/> 법인</label>
                                <label><input type="radio" name="cardType" value="개인" checked={formData.cardType === '개인'} onChange={handleChange}/> 개인</label>
                                <label><input type="radio" name="payType" value="신용" checked={formData.payType === '신용'} onChange={handleChange}/> 신용</label>
                                <label><input type="radio" name="payType" value="체크" checked={formData.payType === '체크'} onChange={handleChange}/> 체크</label>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>카드 별칭</label>
                            <input type="text" name="cardNickname" value={formData.cardNickname} onChange={handleChange} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>카드 비밀번호</label>
                            <input type="password" name="password" placeholder="●●●●●●" onChange={handleChange} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>출금 계좌</label>
                            <select name="account" value={formData.account} onChange={handleChange}>
                                <option value="123-456-789">입출금 통장 123-456-789</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>결제일</label>
                            <select name="payDate" value={formData.payDate} onChange={handleChange}>
                                <option value="매월 5일">매월 5일</option>
                                <option value="매월 15일">매월 15일</option>
                                <option value="매월 25일">매월 25일</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.registerActions}>
                        <button className={styles.btnReset} onClick={() => window.location.reload()}>초기화</button>
                        <button className={styles.btnCancel} onClick={onCancel}>취소</button>
                        <button className={styles.btnSubmit} onClick={handleSubmit}>카드 발급 실행</button>
                    </div>
                </div>
            )}

            {/* --- 탭 2: 카드 목록 리스트 --- */}
            {activeTab === 'list' && (
                <div className={styles.listContent}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input type="text" placeholder="카드 브랜드 / 카드번호" />
                    </div>

                    <div className={styles.cardList}>
                        {cardList.map((card) => (
                            <div
                                key={card.id}
                                className={`${styles.cardItem} ${card.isSelected ? styles.selectedCard : ''}`}
                            >
                                <div className={styles.cardVisual}>
                                    <div className={styles.cardChip}></div>
                                    <div className={styles.cardLogo}>●●</div>
                                </div>

                                <div className={styles.cardInfo}>
                                    <div className={styles.tagRow}>
                                        <span className={styles.tagType}>{card.type}</span>
                                        <span className={`${styles.tagStatus} ${card.isPending ? styles.pending : styles.activeStatus}`}>
                      {card.status}
                    </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>카드 번호:</span>
                                        <span className={styles.value}>**** **** **** {card.number}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>결제일 :</span>
                                        <span className={styles.value}>{card.payDate}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>{card.isPending ? '신청일' : '발급일'} :</span>
                                        <span className={styles.value}>{card.regDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.listActions}>
                        <button className={styles.btnTerminate}>카드 해지 실행</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;