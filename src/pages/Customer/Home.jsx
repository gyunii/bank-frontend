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

const Home = () => {

    // 모달창 상태 관리
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
        { id: 1, title: '대출(전체/주택담보)', icon: Loans, isVisitRequired: false },
        { id: 2, title: '청약저축 가입', icon: House, isVisitRequired: false },
        { id: 3, title: '신용카드 신청', icon: Card, isVisitRequired: true },
        { id: 4, title: '펀드/보험 상담', icon: Counseling, isVisitRequired: true },
        { id: 5, title: '퇴직연금 관리', icon: RetirementPension, isVisitRequired: true },
    ];

    const corporateTasks = [
        { id: 1, title: '기업 대출 신청', icon: Briefcase, isVisitRequired: true },
        { id: 2, title: '법인 계좌 개설', icon: Corporation, isVisitRequired: true },
        { id: 3, title: '부도 및 연체 관리', icon: Warning, isVisitRequired: false },
    ];

    // [API 연동] 게시글 데이터 및 탭 상태 관리
    const [boardList, setBoardList] = useState([]);
    const [isLoadingBoard, setIsLoadingBoard] = useState(true);
    const [activeTab, setActiveTab] = useState('notice'); // 'notice' (새소식) 또는 'event' (이벤트)

    // activeTab이 변경될 때마다 데이터를 새로 불러옵니다.
    useEffect(() => {
        const fetchBoardData = async () => {
            setIsLoadingBoard(true);
            try {
                // boardType 전달 및 세션 검증(credentials) 포함
                // 실제 백엔드 API 주소 형태에 맞게 쿼리 파라미터나 경로를 수정 (예: /api/board?boardType=notice)
                const response = await fetch(`/api/board?boardType=${activeTab}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 세션(쿠키) 정보를 서버로 함께 보내기 위한 필수 설정
                }); 
                
                if (!response.ok) throw new Error('API 연결 실패');
                
                const data = await response.json();
                setBoardList(data); // 응답 데이터 구조에 맞게 수정 (예: data.content, data.list 등)

            } catch (error) {
                console.log(`${activeTab} API 연결 실패. 개발용 임시 데이터를 표시합니다.`, error);
                
                // 아직 ERP에서 글을 안 썼거나 통신 전일 때 화면 구성을 확인하기 위한 목업 데이터
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
    }, [activeTab]); // activeTab이 바뀔 때마다 useEffect 재실행

    // 특정 업무 클릭 시 모달창 띄우기
    const handleCardClick = (title) => {
        let message = '';

        switch (title) {
            case '통장 비밀번호 재설정':
                message = '통장 비밀번호 재설정은 본인 확인 서류 원본 대조를 위해\n영업점 방문이 필수적인 업무입니다.';
                break;
            case '펀드/보험 상담':
                message = '고객님께 최적화된 펀드 및 보험 포트폴리오 구성을 위해\n영업점 방문을 권장합니다.';
                break;
            case '퇴직연금 관리':
                message = '퇴직연금은 세무 및 자산 설계가 통방되어\n전문 상담사의 대면 안내가 필수적입니다.';
                break;
            case '기업 대출 신청':
                message = '전문적인 상담과 법적 절차 확인을 위해\n오프라인 창구 방문이 필요합니다.';
                break;
            case '법인 계좌 개설':
                message = '전문적인 상담과 법적 절차 확인을 위해\n오프라인 창구 방문이 필요합니다.';
                break;
            default:
                console.log(`${title} 페이지로 이동합니다.`);
                return;
        }

        setModalContent(message);
        setIsModalOpen(true);
    }

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
                                <span className={styles.moreBtn}>더보기</span>
                            </div>

                            {isLoadingBoard ? (
                                <p style={{ padding: '20px 0', color: '#888' }}>데이터를 불러오는 중입니다...</p>
                            ) : (
                                <ul className={styles.newsList}>
                                    {boardList.length > 0 ? (
                                        boardList.map((board) => (
                                            <li key={board.id}>
                                                <span className={styles.newsTitle}>• {board.title}</span>
                                                <span className={styles.newsDate}>{board.date}</span>
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

            {/*isModalOpen이 true일 때만 렌더링*/}
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
        </>
    );
};

export default Home
