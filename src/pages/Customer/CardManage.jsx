import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import greenCardImg from '../../images/Home/Card1.png';
import blueCardImg from '../../images/Home/Card2.png';
import styles from './CardManage.module.css';
import Loading from '../../components/common/Loading.jsx';
import {useModal} from '../../context/ModalContext.jsx'

const CardManage = () => {
    const navigate = useNavigate();

    const { openModal } = useModal();
    const showAlert = (message, callback = null) => {
        openModal({
            message: message,
            onConfirm: callback
        });
    };
    
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [cardDetails, setCardDetails] = useState({});

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    // 1. 카드 목록 조회
    useEffect(() => {
        fetchCardList();
    }, []);

    const fetchCardList = async () => {
        setIsLoading(true);
        setCards([
            { cardId: 8, cardName: "내 신용카드", cardNumber: "7015-1300-5043-8680", cardType: "CREDIT", cardColor: "blue", status: "ACTIVE" },
            { cardId: 2, cardName: "내 체크카드", cardNumber: "1851-0645-3726-1517", cardType: "CHECK", cardColor: "green", status: "ACTIVE" }
        ]);
        setIsLoading(false);
        return;

        // --- API 연동 코드 막아둠 ---
        try {
            const response = await fetch('/api/card/', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            
            if (data.result === 'SUCCESS') {
                setCards(data.cards);
            } else {
                console.error("카드 목록 불러오기 실패");
            }
        } catch (error) {
            console.error('API 통신 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 카드 상세 조회 (더보기 클릭 시)
    const handleExpandClick = async (cardId) => {
        if (expandedCardId === cardId) {
            setExpandedCardId(null);
            return;
        }


        if (!cardDetails[cardId]) {
            setCardDetails(prev => ({ 
                ...prev, 
                [cardId]: { cvc: '123', validThru: '04/31', issuedAt: '2026-04-06T14:31:24', status: 'ACTIVE' } 
            }));
            setExpandedCardId(cardId); // 아코디언 열기
            return;


            // --- API연동 코드 막아둠 ---
            try {
                const response = await fetch(`/api/card/${cardId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.result === 'SUCCESS') {
                    setCardDetails(prev => ({ ...prev, [cardId]: data.card }));
                }
            } catch (error) {
                console.error('카드 상세 조회 실패:', error);
            }
        }
        
        setExpandedCardId(cardId); // 아코디언 열기
    };

    // 3. 카드 해지 요청
    const handleDeleteConfirm = async () => {
        if (!cardToDelete) return;
        setDeleteModalOpen(false); 

        showAlert('카드가 성공적으로 해지되었습니다.', () => {
            setCards(prev => prev.filter(card => card.cardId !== cardToDelete)); // 리스트에서 삭제
            setCardToDelete(null); // 선택된 ID 초기화
        });
        return;

        // --- API 연동 코드 막아둠 ---
        try {
            const response = await fetch(`/api/card/${cardToDelete}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();

            if (data.result === 'SUCCESS') {
                showAlert('카드가 성공적으로 해지되었습니다.', () => {
                    setCardToDelete(null);
                    fetchCardList(); 
                });
            } else if (data.result === 'FAILURE_SESSION') {
                showAlert('세션이 만료되었습니다. 다시 로그인해주세요.', () => {
                    navigate('/login');
                });
            } else {
                showAlert('카드 해지에 실패했습니다.');
            }
        } catch (error) {
            console.error('카드 해지 오류:', error);
            showAlert('서버와 연결할 수 없습니다.');
        }
    };

    const openDeleteModal = (cardId) => {
        setCardToDelete(cardId);
        setDeleteModalOpen(true);
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px 0' }}><Loading /></div>;
    }

    return (
        <div className={styles.cardManageContainer}>
            <h2 className={styles.sectionTitle}>내 카드 관리</h2>
            
            {cards.length === 0 ? (
                <div className={styles.emptyBox}>
                    <p>보유하신 카드가 없습니다.</p>
                </div>
            ) : (
                <div className={styles.cardList}>
                    {cards.map((card) => (
                        <div key={card.cardId} className={styles.cardItem}>
                            
                            <div className={styles.cardMain}>
                                <div className={styles.cardLeft}>
                                    <img 
                                        src={card.cardColor === 'blue' ? blueCardImg : greenCardImg} 
                                        alt={card.cardName} 
                                        className={styles.cardImage} 
                                    />
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardBadge}>
                                            {card.cardType === 'CREDIT' ? '신용카드' : '체크카드'}
                                        </span>
                                        <h4 className={styles.cardName}>{card.cardName}</h4>
                                        <p className={styles.cardNumber}>{card.cardNumber}</p>
                                    </div>
                                </div>
                                <div className={styles.cardRight}>
                                    <button 
                                        className={styles.deleteBtn} 
                                        onClick={() => openDeleteModal(card.cardId)}
                                    >
                                        해지하기
                                    </button>
                                    <button 
                                        className={styles.moreBtn} 
                                        onClick={() => handleExpandClick(card.cardId)}
                                    >
                                        상세보기 {expandedCardId === card.cardId ? '∧' : '∨'}
                                    </button>
                                </div>
                            </div>

                            {expandedCardId === card.cardId && cardDetails[card.cardId] && (
                                <div className={styles.cardDetailBox}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>CVC 번호</span>
                                        <span className={styles.detailValue}>{cardDetails[card.cardId].cvc}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>유효 기간</span>
                                        <span className={styles.detailValue}>{cardDetails[card.cardId].validThru}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>발급 일자</span>
                                        <span className={styles.detailValue}>
                                            {cardDetails[card.cardId].issuedAt ? cardDetails[card.cardId].issuedAt.split('T')[0] : '-'}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>상태</span>
                                        <span className={`${styles.detailValue} ${cardDetails[card.cardId].status === 'ACTIVE' ? styles.statusActive : ''}`}>
                                            {cardDetails[card.cardId].status === 'ACTIVE' ? '정상 사용중' : '정지/해지'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {deleteModalOpen && (
                <div className={styles.modalBackdrop} onClick={() => setDeleteModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>카드 해지</h3>
                        <p style={{ marginTop: '15px', color: '#555', lineHeight: '1.5' }}>
                            정말 이 카드를 해지하시겠습니까?<br/>
                            해지된 카드는 복구할 수 없으며, 연결된 정기 결제가 모두 중단됩니다.
                        </p>
                        <div className={styles.modalBtnGroup}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteModalOpen(false)}>취소</button>
                            <button className={styles.confirmBtn} onClick={handleDeleteConfirm}>해지하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardManage;