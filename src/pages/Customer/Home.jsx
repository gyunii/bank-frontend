import React, {useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import HomeImage from '../../images/Home/Home.png';
import HomeImage2 from '../../images/Home/Home2.png';
import Briefcase from '../../images/Home/Briefcase.png';
import Card from '../../images/Home/Card.png';
import Corporation from '../../images/Home/Corporation.png';
import Counseling from '../../images/Home/Counseling.png';
import House from '../../images/Home/House.png';
import Loans from '../../images/Home/Loans.png';
import Lock from '../../images/Home/Lock.png';
import RetirementPension from '../../images/Home/RetirementPension.png';
import Transfer from '../../images/Home/Transfer.png';
import Warning from '../../images/Home/Warning.png';
import styles from './Home.module.css';
import ChatBot from "./ChatBot";

const Home = () => {
    const navigate=  useNavigate();
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
const [termsType, setTermsType] = useState(''); // 'loan' 또는 'subscription'
    
    //유저 상태 관리
    const [user, setUser] = useState(null);
    //권한 모달 상태 관ㄹ
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const banners = [HomeImage, HomeImage2, HomeImage];

    // 각 섹션별 고정 데이터
    const fastTasks = [
        { id: 2, title: '입/출금 및 이체', icon: Transfer, isVisitRequired: false },
        { id: 3, title: '체크카드 발급', icon: Card, isVisitRequired: true },
        { id: 4, title: '통장 비밀번호 재설정', icon: Lock, isVisitRequired: true },
    ];

    const consultTasks = [
        { id: 1, title: '대출(전세/주택담보)', icon: Loans, isVisitRequired: false },
        { id: 2, title: '청약저축 가입', icon: House, isVisitRequired: false },
        { id: 3, title: '신용카드 신청', icon: Card, isVisitRequired: true },
        { id: 4, title: '펀드/보험 상담', icon: Counseling, isVisitRequired: true },
        { id: 5, title: '퇴직연금 관리', icon: RetirementPension, isVisitRequired: true },
    ];

    const corporateTasks = [
        { id: 1, title: '기업 대출 신청', icon: Briefcase, isVisitRequired: true },
        { id: 2, title: '법인 계좌 개설', icon: Corporation, isVisitRequired: true },
        { id: 3, title: '기업 연체 관리', icon: Warning, isVisitRequired: false },
    ];

    const [boardList, setBoardList] = useState([]);
    const [isLoadingBoard, setIsLoadingBoard] = useState(true);
    const [activeTab, setActiveTab] = useState('notice'); // 'notice' (새소식) 또는 'event' (이벤트)

    useEffect(() => {
        const fetchBoardData = async () => {
            setIsLoadingBoard(true);
            try {
                const response = await fetch(`/api/board/articles?boardType=${activeTab}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }); 
                
                if (!response.ok) throw new Error('API 연결 실패');
                
                const data = await response.json();
                setBoardList(data);

            } catch (error) {
                console.log(`${activeTab} API 연결 실패. 개발용 임시 데이터를 표시합니다.`, error);
                
                const mockData = activeTab === 'notice' 
                    ? [
                        { id: 1, title: '[공지] 일부 참가기관 디지털금융영업부 일시중단 안내', date: '2026.02.27' },
                        { id: 2, title: '[공지] 신용카드 기업회원 약관 개정안내', date: '2026.02.25' },
                        { id: 3, title: '[공지] 휴면예금 출연 안내', date: '2026.02.19' },
                    ]
                    : [
                        { id: 101, title: '[이벤트] 첫 계좌 개설 시 1만원 캐시백!', date: '2026.03.01' },
                        { id: 102, title: '[이벤트] 친구 초대하고 스벅 커피 받자', date: '2026.02.28' },
                    ];
                setBoardList(mockData);
            } finally {
                setIsLoadingBoard(false);
            }
        };

        fetchBoardData();
    }, [activeTab]);

    // 세션에서 유저 정보 가져오기
    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const response = await fetch('/api/user/session');
                const data = await response.json();
                if (data.result === 'SUCCESS' && data.type === 'user') {
                    setUser(data);
                }
            } catch (error) {
                console.error('세션 정보 로드 실패:', error);
            }
        };
        fetchUserSession();
    }, []);

    const handleCardClick = (title) => {
        if (!user) {
            setModalMessage('로그인이 필요한 서비스입니다.\n먼저 로그인 해주세요.');
            setIsAccessModalOpen(true);
            return;
        }

        let message = '';

        switch (title) {
            case '대출(전세/주택담보)':
                setTermsType('loan');
                setIsTermsModalOpen(true);
                return;
            case '청약저축 가입':
                setTermsType('subscription');
                setIsTermsModalOpen(true);
                return;
            case '입/출금 및 이체':
                navigate("/my");
                return;
            case '통장 비밀번호 재설정':
                message = '통장 비밀번호 재설정은 본인 확인 서류 원본 대조를 위해\n영업점 방문이 필수적인 업무입니다.';
                break;
            case '체크카드 발급':
                navigate('/CheckCard');
                return;
            case '펀드/보험 상담':
                message = '고객님께 최적화된 펀드 및 보험 포트폴리오 구성을 위해\n영업점 방문을 권장합니다.';
                break;
            case '퇴직연금 관리':
                message = '퇴직연금은 세무 및 자산 설계가 통방되어\n전문 상담사의 대면 안내가 필수적입니다.';
                break;
                
            case '기업 대출 신청':
            case '법인 계좌 개설':
                if (user.userType === 'corporate' || user.userType === 'admin') {
                    message = '전문적인 상담과 법적 절차 확인을 위해\n오프라인 창구 방문이 필요합니다.';
                    break; 
                } else {
                    setModalMessage('기업회원만 접근 가능합니다.\n기업 계정으로 로그인해주세요.');
                    setIsAccessModalOpen(true);
                    return;
                }

            case '기업 연체 관리':
                switch (user.userType) {
                    case 'corporate':
                    case 'admin':
                        navigate('/overdue'); 
                        break;
                    default:
                        setModalMessage('기업회원만 접근 가능합니다.\n기업 계정으로 로그인해주세요.');
                        setIsAccessModalOpen(true);
                        break;
                }
                return;

            default:
                console.log(`${title} 페이지로 이동합니다.`);
                return;
        }

        setModalContent(message);
        setIsModalOpen(true);
    };

    return (
        <>            
            <div className={styles.homeContainer}>
                <div className={styles.heroWrapper}>
                    {/* <img src={HomeImage} alt="BankScope 메인 배너" className={styles.heroImage} /> */}
                    <div className={styles.sliderContainer}>
                        <div className={styles.sliderTrack}>
                            {banners.map((banner, index) => (
                                <img
                                    key={index}
                                    src={banner}
                                    alt={`BankScop 메인 배너 &{index + 1}`}
                                    className={styles.heroImage}/>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. 메인 콘텐츠 (메뉴들) */}
                <main className={styles.mainContent}>
                    
                    {/* 빠른 업무 */}
                    <section className={styles.menuSection}>
                        <div className={styles.sectionHeader}>
                            <h2>빠른 업무</h2>
                            <p>기본적인 업무입니다. 통장 비밀번호, 체크카드 발급은 영업점 방문이 필수입니다.</p>
                        </div>
                        <div className={styles.cardGrid}>
                            {fastTasks.map((task) => (
                                <div key={task.id} className={styles.card} onClick={() => handleCardClick(task.title)}>
                                    <div className={styles.iconPlaceholder}>
                                        <img src={task.icon} alt={task.title} className={styles.cardIcon} />
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3>{task.title}</h3>
                                        {task.isVisitRequired && <span className={styles.redText}>영업점 방문 필수</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 상담 및 금융 상품 */}
                    <section className={styles.menuSection}>
                        <div className={styles.sectionHeader}>
                            <h2>상담 및 금융 상품</h2>
                            <p>자산관리와 대출 상담이 가능합니다. 항목에 따라 방문이 필요할 수 있습니다.</p>
                        </div>
                        <div className={styles.cardGrid}>
                            {consultTasks.map((task) => (
                                <div key={task.id} className={styles.card} onClick={() => handleCardClick(task.title)}>
                                    <div className={styles.iconPlaceholder}>
                                        <img src={task.icon} alt={task.title} className={styles.cardIcon} />
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3>{task.title}</h3>
                                        {task.isVisitRequired && <span className={styles.redText}>영업점 방문 필수</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 기업 및 특수 관리 */}
                    <section className={styles.menuSection}>
                        <div className={styles.sectionHeader}>
                            <h2>기업 및 특수 관리</h2>
                            <p>기업 회원 및 리스크 관리를 위한 전용 서비스입니다.</p>
                        </div>
                        <div className={styles.cardGrid}>
                            {corporateTasks.map((task) => (
                                <div key={task.id} className={styles.card} onClick={() => handleCardClick(task.title)}>
                                    <div className={styles.iconPlaceholder}>
                                        <img src={task.icon} alt={task.title} className={styles.cardIcon} />
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3>{task.title}</h3>
                                        {task.isVisitRequired && <span className={styles.redText}>영업점 방문 필수</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 하단 위젯 (새소식 & 추천상품) */}
                    <section className={styles.bottomWidgets}>
                        {/* 새소식/이벤트 위젯 */}
                        <div className={styles.newsWidget}>
                            <div className={styles.widgetHeader}>
                                <div className={styles.tabs}>
                                    <span 
                                        className={activeTab === 'notice' ? styles.activeTab : styles.inactiveTab}
                                        onClick={() => setActiveTab('notice')}
                                    >
                                        새소식
                                    </span>
                                    <span 
                                        className={activeTab === 'event' ? styles.activeTab : styles.inactiveTab}
                                        onClick={() => setActiveTab('event')}
                                    >
                                        이벤트
                                    </span>
                                </div>
                                <span 
                                    className={styles.moreBtn} 
                                    onClick={() => navigate(`/board/${activeTab}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    더보기
                                </span>
                            </div>

                            {isLoadingBoard ? (
                                <p style={{ padding: '20px 0', color: '#888' }}>데이터를 불러오는 중입니다...</p>
                            ) : (
                                <ul className={styles.newsList}>
                                    {boardList.length > 0 ? (
                                        boardList.map((board) => (
                                            /*<li
                                                key={board.boardId} // board.id -> board.boardId로 수정
                                                onClick={() => navigate(`/board/detail/${board.boardId}`)} // id -> boardId
                                                style={{cursor: 'pointer'}}
                                            >*/
                                             <li
                                                    key={board.boardId} // board.id -> board.boardId로 수정
                                                    onClick={() => navigate(`/board/detail/${board.boardId}`)}                                                    style={{cursor: 'pointer'}}
                                             >
                                             <span className={styles.newsTitle}>• {board.title}</span>
                                             <span className={styles.newsDate}>
                                                    {board.createdAt ? board.createdAt.split('T')[0].replaceAll('-', '.') : ''}
                                             </span>
                                            </li>
                                        ))
                                    ) : (
                                        <p style={{ padding: '20px 0', color: '#888' }}>등록된 게시글이 없습니다.</p>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* 추천상품 위젯 (마우스 오버 시 애니메이션 효과) */}
                        <div className={styles.promoWidget}>
                            <div className={styles.promoContent}>
                                <div className={styles.promoIcon}>
                                    <span style={{ fontSize: '40px' }}>🪙</span>
                                </div>
                                <div className={styles.promoText}>
                                    <h3>추천 상품</h3>
                                    <p>고객님께 추천드리는 상품</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {isModalOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIconWrapper}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        </div>
                        <h2 className={styles.modalTitle}>
                            가까운 영업점에 방문해주세요.
                        </h2>
                        <div className={styles.modalMessageContainer}>
                            <p className={styles.modalMessage}>
                                {modalContent.split('\n').map((line, idx) => (
                                    <React.Fragment key={idx}>
                                        {line}<br />
                                    </React.Fragment>
                                ))}
                            </p>
                        </div>
                        <button className={styles.modalButton} onClick={() => setIsModalOpen(false)}>
                            메인으로 돌아가기
                        </button>
                    </div>
                </div>
            )}

            {isAccessModalOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsAccessModalOpen(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIconWrapper}>
                            {/* 엑스(X) 아이콘 */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <h2 className={styles.modalTitle}>접근 권한 안내</h2>
                        <div className={styles.modalMessageContainer}>
                            <p className={styles.modalMessage} style={{ whiteSpace: 'pre-line' }}>
                                {modalMessage}
                            </p>
                        </div>
                        <button className={styles.modalButton} onClick={() => setIsAccessModalOpen(false)}>
                            확인
                        </button>
                    </div>
                </div>
            )}

            {isTermsModalOpen && (
                <div className={styles.modalBackdrop} onClick={() => setIsTermsModalOpen(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px' }}>
                        <h2 className={styles.modalTitle} style={{ textAlign: 'left', marginBottom: '15px' }}>
                            {termsType === 'loan' ? '대출 상품 가입 약관' : '주택청약종합저축 가입 약관'}
                        </h2>
                        
                        <div className={styles.termsContentBox}>
                            {termsType === 'loan' ? (
                                <>
                                    <strong>제 1조 (목적)</strong><br />
                                    본 약관은 은행과 대출 신청인 간의 전세자금 및 주택담보대출 조건 및 절차를 규정함을 목적으로 합니다.<br /><br />
                                    
                                    <strong>제 2조 (대출금리 및 상환)</strong><br />
                                    ① 대출금리는 기준금리에 가산금리를 더하여 산정되며, 우대금리 조건(급여이체, 카드실적 등)에 따라 변동될 수 있습니다.<br />
                                    ② 만기일시상환, 원리금균등분할상환 중 고객이 선택한 방식으로 매월 지정된 결제일에 상환합니다.<br /><br />

                                    <strong>제 3조 (지연배상금 및 기한의 이익 상실)</strong><br />
                                    ① 이자 지급 또는 원금 상환을 지체한 경우 은행이 정한 연체이자율이 적용된 지연배상금을 납부해야 합니다.<br />
                                    ② 고객의 신용상태에 중대한 변동이 생기거나 허위 자료를 제출한 경우 대출금 전액을 즉시 상환해야 할 의무를 가집니다.
                                </>
                            ) : (
                                <>
                                    <strong>제 1조 (목적)</strong><br />
                                    본 약관은 주택청약종합저축 가입자의 권리와 의무를 규정하며, 국민주택 및 민영주택 청약 자격 부여를 목적으로 합니다.<br /><br />
                                    
                                    <strong>제 2조 (가입대상 및 계좌 제한)</strong><br />
                                    ① 국내 거주자인 국민 및 외국인 누구나 가입 가능합니다.<br />
                                    ② 전 금융기관을 통틀어 1인 1계좌만 보유할 수 있습니다. (중복 가입 불가)<br /><br />

                                    <strong>제 3조 (납입금액 및 이율)</strong><br />
                                    ① 매월 2만원 이상 50만원 이하의 금액을 자유롭게 10원 단위로 납입할 수 있습니다.<br />
                                    ② 적용 이율은 정부의 주택도시기금 운용 계획에 따라 변동될 수 있습니다.<br /><br />
                                    
                                    <strong>제 4조 (해지)</strong><br />
                                    본 상품은 일부 인출이 불가능하며, 청약 당첨 시 또는 가입자의 요청에 의해 전액 해지 처리됩니다.
                                </>
                            )}
                        </div>
                        
                        <div className={styles.modalSingleButtonWrapper}>
                            {/* 💡 취소 버튼은 과감히 삭제! */}
                            <button 
                                className={styles.singleButton}
                                onClick={() => {
                                    // alert창 없이 모달만 닫기
                                    setIsTermsModalOpen(false);
                                }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ChatBot />
        </>
    );
};

export default Home;
