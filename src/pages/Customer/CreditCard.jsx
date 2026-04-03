import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Card.module.css'
import checkIcon from '../../images/Common/Check.png';
import greenCardImg from '../../images/Home/Card1.png';
import blueCardImg from '../../images/Home/Card2.png';
import Loading from '../../components/Common/Loading';

const CreditCard = () => {
    const navigate = useNavigate();
    
    // 내부 상태 관리
    const [step, setStep] = useState(1);
    
    const [selectedCard, setSelectedCard] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null); // 더보기 아코디언
    const [activeModal, setActiveModal] = useState(null);
    const [cardPwd, setCardPwd] = useState('');
    const [cardPwdConfirm, setCardPwdConfirm] = useState('');
    const [agreements, setAgreements] = useState({ term1: false, term2: false });

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    const handleKeyClick = (val) => {
        if (pinInput.length < 6) setPinInput(prev => prev + val);
    };
    const handleDelete = () => setPinInput(prev => prev.slice(0, -1));

    const handlePinConfirm = async () => {
        if (pinInput.length !== 6) return;
        try {
            const response = await fetch(`/api/pin/confirm?pin=${pinInput}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            
            if (data.result === 'SUCCESS') {
                setIsPinModalOpen(false);
                setStep(4);
            } else {
                alert('핀 번호가 일치하지 않습니다.\n다시 입력해주세요.');
                setPinInput('');
            }
        } catch (error) {
            console.error('API 오류:', error);
            alert('서버와 연결할 수 없습니다.');
        }
    };

    // 신용카드 리스트 mock 데이터
    const cardList = [
        {
            id: 'MRLIFE',
            highlight: '최대 52만원 캐시백',
            name: '신한카드 Mr.Life',
            subtitle: '신한카드',
            benefits: ['스타벅스, 커피빈 등 커피전문점 10% 결제일 할인', '이마트, 홈플러스, 롯데마트 주말 10% 할인', 'SKT, KT, LG U+ 통신요금 10% 할인'],
            image: greenCardImg
        },
        {
            id: 'TRAVEL',
            highlight: '해외 수수료 0원',
            name: '뱅크스코프 트래블 플러스',
            subtitle: '뱅크스코프',
            benefits: ['해외 전 가맹점 결제 수수료 100% 면제', '전 세계 공항 라운지 연 2회 무료', '국내 대중교통 5% 청구할인'],
            image: blueCardImg
        }
    ];

    const isAllRequiredAgreed = agreements.term1 && agreements.term2;
    const isPwdValid = cardPwd.length === 4 && cardPwd === cardPwdConfirm;
    const isStep3Valid = isAllRequiredAgreed && isPwdValid;

    // 더보기 토글
    const toggleExpand = (id) => {
        setExpandedCardId(prev => prev === id ? null : id);
    };

    // 가입하기 클릭
    const handleJoinClick = (cardId) => {
        setSelectedCard(cardId);
        setStep(2); // 1단계 -> 조건 조회로 이동
    };

    // 약관 동의
    const handleAgreeClick = () => {
        setAgreements(prev => ({ ...prev, [activeModal]: true }));
        setActiveModal(null);
    };

    // 💡 나중에 백엔드 API와 연동될 자동 심사 로직 (가짜 로딩)
    useEffect(() => {
        if (step === 2) {
            // 발급불가조건 조회
            const timer = setTimeout(() => setStep(3), 2000);
            return () => clearTimeout(timer);
        }
        if (step === 4) {
            // 결제능력 심사
            const timer = setTimeout(() => setStep(5), 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const getSidebarActiveStep = () => {
        if (step <= 2) return 1;
        if (step <= 4) return 2;
        return 3;
    };

    const sidebarSteps = [
        { id: 1, title: '상품 선택/동의' },
        { id: 2, title: '비밀번호 설정' },
        { id: 3, title: '발급 완료' },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.stepperLayout}>
                
                <aside className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle} style={{ fontSize: '20px', fontWeight: '800' }}>
                        BANKSCOPE<br /><span style={{ fontSize: '26px' }}>카드 발급</span>
                    </h2>
                    <div className={styles.stepList} style={{ marginTop: '40px' }}>
                        {sidebarSteps.map((s) => (
                            <div key={s.id} className={`${styles.stepItem} ${getSidebarActiveStep() >= s.id ? styles.active : ''}`}>
                                <div className={styles.stepCircle}>{s.id}</div>
                                <span>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className={styles.mainContent}>
                    
                    {step === 1 && (
                        <div className={styles.stepBox}>
                            <h3 className={styles.stepTitle} style={{ marginBottom: '30px' }}>발급을 원하시는 카드를 선택해주세요</h3>
                            
                            <div className={styles.cardListContainer}>
                                {cardList.map((card) => (
                                    <div key={card.id} className={styles.cardListItem}>
                                        <div className={styles.cardListMain}>
                                            <div className={styles.cardListLeft}>
                                                <img src={card.image} alt={card.name} className={styles.cardListImage} />
                                                <div className={styles.cardListText}>
                                                    <span className={styles.cardHighlight}>{card.highlight}</span>
                                                    <span className={styles.cardTitle}>{card.name}</span>
                                                    <span className={styles.cardSubtitle}>{card.subtitle}</span>
                                                </div>
                                            </div>
                                            <div className={styles.cardListRight}>
                                                <button className={styles.joinBtn} onClick={() => handleJoinClick(card.id)}>
                                                    가입하기
                                                </button>
                                                <button className={styles.moreBtn} onClick={() => toggleExpand(card.id)}>
                                                    더보기 {expandedCardId === card.id ? '∧' : '∨'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {expandedCardId === card.id && (
                                            <div className={styles.expandedBenefits}>
                                                <strong style={{ display: 'block', marginBottom: '10px' }}>주요 혜택 안내</strong>
                                                <ul>
                                                    {card.benefits.map((benefit, idx) => (
                                                        <li key={idx}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepBox} style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Loading />
                            <h3 className={styles.stepTitle} style={{ marginTop: '30px' }}>발급 가능 여부를 조회하고 있습니다...</h3>
                            <p style={{ color: '#888' }}>연체 이력 및 타사 발급 거절 이력을 확인 중입니다.</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepBox}>
                            <h3 className={styles.stepTitle}>약관 동의 및 비밀번호 설정</h3>
                            
                            <div className={`${styles.agreementBox} ${agreements.term1 ? styles.agreed : ''}`} onClick={() => setActiveModal('term1')}>
                                <span>[필수] 신용카드 개인회원 표준약관</span>
                                {agreements.term1 && <span className={styles.agreedBadge}>동의 완료 ✔</span>}
                            </div>
                            <div className={`${styles.agreementBox} ${agreements.term2 ? styles.agreed : ''}`} onClick={() => setActiveModal('term2')} style={{ marginBottom: '40px' }}>
                                <span>[필수] 신용조회 및 개인정보 제공 동의</span>
                                {agreements.term2 && <span className={styles.agreedBadge}>동의 완료 ✔</span>}
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>카드 비밀번호 설정 (4자리)</h4>
                            <input 
                                type="password" 
                                className={styles.pwdInput}
                                placeholder="비밀번호 4자리 입력 (쇼핑 사이트 결제 시 사용)"
                                maxLength={4}
                                value={cardPwd}
                                onChange={(e) => setCardPwd(e.target.value.replace(/[^0-9]/g, ''))}
                                style={{ marginBottom: '10px' }}
                            />
                            <input 
                                type="password" 
                                className={styles.pwdInput}
                                placeholder="비밀번호 재입력"
                                maxLength={4}
                                value={cardPwdConfirm}
                                onChange={(e) => setCardPwdConfirm(e.target.value.replace(/[^0-9]/g, ''))}
                                style={{ marginBottom: '40px' }}
                            />
                            <div style={{ height: '20px', marginBottom: '20px', marginLeft: '5px' }}>
                                {cardPwdConfirm.length > 0 && cardPwd !== cardPwdConfirm && (
                                    <span style={{ color: '#E63946', fontSize: '13px', fontWeight: '600' }}>
                                        비밀번호가 동일하지 않습니다.
                                    </span>
                                )}
                            </div>

                            <button 
                                className={`${styles.nextBtn} ${!isStep3Valid ? styles.disabledBtn : ''}`}
                                disabled={!isStep3Valid}
                                onClick={() => setIsPinModalOpen(true)}
                            >
                                신청서 제출하기
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.stepBox} style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Loading />
                            <h3 className={styles.stepTitle} style={{ marginTop: '30px' }}>결제능력 및 신용점수를 심사 중입니다...</h3>
                            <p style={{ color: '#888' }}>잠시만 기다려주세요. 최대 1분 정도 소요될 수 있습니다.</p>
                        </div>
                    )}

                    {step === 5 && (
                        <div className={styles.stepBox}>
                            <div className={styles.completeBox}>
                                <img src={checkIcon} alt="완료 체크" className={styles.checkIcon} />
                                <h3 className={styles.completeTitle}>카드 발급 신청 완료!</h3>
                                <p className={styles.completeDesc}>
                                    신용카드 발급 신청이 성공적으로 접수되었습니다.<br/>
                                    실물 카드는 영업일 기준 3~5일 내에 배송됩니다.
                                </p>
                            </div>
                            <button className={styles.nextBtn} onClick={() => navigate('/Main')}>홈 화면으로 이동</button>
                        </div>
                    )}

                </main>
            </div>

            {activeModal && (
                <div className={styles.pinModalBackdrop} onClick={() => setActiveModal(null)}>
                    {/* 💡 maxWidth를 800px로 넓히고, 텍스트는 중앙 정렬로 변경 */}
                    <div className={styles.pinModalContent} onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', textAlign: 'center', padding: '40px' }}>
                        
                        {activeModal === 'term1' && (
                            <>
                                <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>[필수] 신용카드 개인회원 표준약관</h3>
                                
                                {/* 💡 내부 텍스트 박스는 배경색을 주고 좌측 정렬 유지 */}
                                <div className={styles.termsContentBox} style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '30px', padding: '25px', background: '#f4f5f6', borderRadius: '12px', fontSize: '14px', lineHeight: '1.8', textAlign: 'left', color: '#333' }}>
                                    <strong>제 1조 (목적)</strong><br />
                                    본 약관은 신용카드업자와 회원 간의 신용카드 이용에 관한 제반 사항을 정함을 목적으로 합니다.<br /><br />
                                    
                                    <strong>제 2조 (카드의 이용 및 한도)</strong><br />
                                    ① 회원은 부여된 신용한도 내에서 카드를 이용할 수 있으며, 결제일에 대금을 납부해야 합니다.<br />
                                    ② 회원은 카드를 타인에게 양도하거나 대여할 수 없으며, 이를 위반하여 발생한 손해는 회원이 부담합니다.<br /><br />
                                    
                                    <strong>제 3조 (비밀번호 관리 의무)</strong><br />
                                    회원은 카드 비밀번호 및 PIN 번호가 타인에게 노출되지 않도록 철저히 관리해야 하며, 고의 또는 중대한 과실로 인한 유출로 발생한 손해는 회원이 책임집니다.
                                </div>
                                <button className={styles.nextBtn} onClick={handleAgreeClick} style={{ width: '100%', padding: '16px', fontSize: '18px' }}>위 약관에 동의합니다</button>
                            </>
                        )}

                        {activeModal === 'term2' && (
                            <>
                                <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>[필수] 신용조회 및 제공 동의</h3>
                                
                                <div className={styles.termsContentBox} style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '30px', padding: '25px', background: '#f4f5f6', borderRadius: '12px', fontSize: '14px', lineHeight: '1.8', textAlign: 'left', color: '#333' }}>
                                    <strong>1. 수집 및 이용 목적</strong><br />
                                    신용카드 발급 심사, 결제능력 평가, 신용 질서 문란 행위 조사 및 카드 이용 한도 산정<br /><br />
                                    
                                    <strong>2. 제공받는 자</strong><br />
                                    NICE평가정보, 코리아크레딧뷰로(KCB) 등 국가 지정 신용평가기관<br /><br />
                                    
                                    <strong>3. 보유 및 이용 기간</strong><br />
                                    본 동의서의 효력은 카드 발급 심사 완료 시점 또는 고객의 동의 철회 시까지 유지됩니다.
                                </div>
                                <button className={styles.nextBtn} onClick={handleAgreeClick} style={{ width: '100%', padding: '16px', fontSize: '18px' }}>위 약관에 동의합니다</button>
                            </>
                        )}

                        {/* 혜택 안내 모달 (이것도 넓게 통일) */}
                        {activeModal.startsWith('benefits_') && (() => {
                            const card = cardList.find(c => c.id === activeModal.split('_')[1]);
                            return (
                                <>
                                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>{card.name} 주요 혜택</h3>
                                    <div className={styles.termsContentBox} style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '30px', padding: '25px', background: '#f4f5f6', borderRadius: '12px', fontSize: '15px', lineHeight: '1.8', textAlign: 'left', color: '#333' }}>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            {card.benefits.map((benefit, idx) => (
                                                <li key={idx} style={{ marginBottom: '10px' }}><strong>{benefit}</strong></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button className={styles.nextBtn} onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '16px', fontSize: '18px' }}>닫기</button>
                                </>
                            );
                        })()}

                    </div>
                </div>
            )}

            {isPinModalOpen && (
                <div className={styles.pinModalBackdrop} onClick={() => setIsPinModalOpen(false)}>
                    <div className={styles.pinModalContent} onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>보안 핀(PIN) 번호를 입력해주세요</h3>
                        
                        <div className={styles.pinDisplay} style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={`${styles.pinDot} ${i < pinInput.length ? styles.pinDotFilled : ''}`} style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: i < pinInput.length ? '#4A9C82' : '#e0e0e0' }} />
                            ))}
                        </div>

                        <div className={styles.keypad} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                            {keypadLayout.map((key, idx) => {
                                if (key === '') return <div key={idx} className={styles.emptyKey} />;
                                if (key === 'del') {
                                    return <button key={idx} className={styles.keyBtn} onClick={handleDelete} style={{ background: '#f4f5f6', border: 'none', borderRadius: '12px', padding: '15px 0', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>지우기</button>;
                                }
                                return (
                                    <button key={idx} className={styles.keyBtn} onClick={() => handleKeyClick(key)} style={{ background: '#f4f5f6', border: 'none', borderRadius: '12px', padding: '15px 0', fontSize: '20px', fontWeight: '600', cursor: 'pointer' }}>
                                        {key}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            className={`${styles.nextBtn} ${pinInput.length !== 6 ? styles.disabledBtn : ''}`} 
                            disabled={pinInput.length !== 6}
                            onClick={handlePinConfirm}
                            style={{ width: '100%', padding: '15px', fontSize: '18px', borderRadius: '12px', backgroundColor: pinInput.length === 6 ? '#4A9C82' : '#ccc', color: 'white', border: 'none' }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCard;