import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BankerWorkSpace.module.css';
import WorkSpaceBackground from '../../images/Banker/WorkSpaceBackground.png';
import { useAuth } from '../../context/AuthContext';
import BankerModal from '../../components/Banker/BankerModal.jsx';
import AccountCreateForm from "../../pages/Banker/AccountCreate";
import ChatModal from "../../pages/Banker/ChatModal.jsx";

const BankerWorkSpace = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
    { sender: "customer", text: "안녕하세요 상담 요청드립니다." },
    { sender: "banker", text: "네 고객님 무엇을 도와드릴까요?" }
    ]);

    const [selectedWorkType, setSelectedWorkType] = useState(null);


    const [accountType, setAccountType] = useState("");
    const [accountAlias, setAccountAlias] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (!loading && !user) {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/AdminLogin");
        }
    }, [user, loading, navigate]);

    // 업무 목록 조회 API 호출
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/member/task', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch tasks');
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
            const interval = setInterval(fetchTasks, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // 자동 스크롤
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 고객 바뀌면 채팅 초기화
useEffect(() => {
    setSelectedWorkType(null);

    if (selectedTask) {
        setMessages([
            { sender: "customer", text: "안녕하세요 상담 요청드립니다." },
            { sender: "banker", text: "네 고객님 무엇을 도와드릴까요?" }
        ]);
    }
}, [selectedTask]);


    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/AdminLogin');
    };

    /*채팅 전송 함수*/
    const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [
        ...prev,
        { sender: "banker", text: input }
    ]);

        setInput("");
    };

    // 계좌번호 자동 생성 함수
    const generateAccountNumber = () => {
        const part1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const part3 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `${part1}-${part2}-${part3}`;
    };
    
        /* 계좌 생성 함수 */
        const handleCreateAccount = async () => {
            if (!selectedTask) return;

            if (accountPassword !== confirmPassword) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
            }


            try {

                const params = new URLSearchParams({
                    userId: selectedTask.userId,
                    accountType: accountType,
                    accountAlias: accountAlias,
                    accountPassword: accountPassword
                });

                const response = await fetch(`/api/account/register?${params}`, {
                    method: "POST"
                });

                if (response.ok) {
                    const data = await response.json();

                    alert(`계좌가 생성되었습니다.\n계좌번호: ${data.account.accountNumber}`);
                    setSelectedWorkType(null);

                    // 폼 초기화
                    setAccountType("");
                    setAccountAlias("");
                    setAccountPassword("");
                    setConfirmPassword("");
                } else {
                    alert("계좌 생성 실패");
                }

            } catch (error) {
                console.error("계좌 생성 오류:", error);
            }
        };
    // 업무 수락 (WAITING -> IN_PROGRESS)
    const handleAcceptTask = async (task) => {
        try {
            const response = await fetch(`/api/member/task/${task.taskId}/status?status=IN_PROGRESS`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    // 상태 변경 성공 시 모달 열기
                    setSelectedTask(task);
                    setIsModalOpen(true);
                    fetchTasks(); // 목록 갱신
                    
                    // 3초 후 모달 닫기 (하지만 selectedTask는 유지하여 화면에 계속 표시)
                    setTimeout(() => {
                        setIsModalOpen(false);
                    }, 3000);
                } else {
                    alert('업무 수락 실패');
                }
            } else {
                alert('서버 오류 발생');
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            alert('오류가 발생했습니다.');
        }
    };

    // 업무 종료 (IN_PROGRESS -> COMPLETED)
    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        try {
            const response = await fetch(`/api/member/task/${selectedTask.taskId}/status?status=COMPLETED`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    alert('업무가 종료되었습니다.');
                    setSelectedTask(null); // 업무 종료 시에만 selectedTask 초기화
                    fetchTasks(); // 목록 갱신
                } else {
                    alert('업무 종료 실패');
                }
            } else {
                alert('서버 오류 발생');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('오류가 발생했습니다.');
        }
    };

    // 대기 중인 업무와 처리 중인 업무 모두 표시
    const visibleTasks = tasks.filter(task => task.status === 'WAITING' || task.status === 'IN_PROGRESS');
    
    // 초기 로드 시 또는 갱신 시 IN_PROGRESS 상태인 업무가 있다면 자동으로 선택 (선택된 업무가 없을 때만)
    useEffect(() => {
        if (!selectedTask && tasks.length > 0) {
            const inProgressTask = tasks.find(task => task.status === 'IN_PROGRESS');
            if (inProgressTask) {
                setSelectedTask(inProgressTask);
            }
        }
    }, [tasks, selectedTask]);


    return (
        <div className={styles.container}>
            <img src={WorkSpaceBackground} alt="WorkSpace Background" className={styles.backgroundImage} />

            <div className={styles.glassWrapper}>
                <div className={styles.topControls}>
                    <div className={styles.themeToggle}>
                        <span className={styles.sunIcon}>☀️</span>
                        <div className={styles.toggleKnob}></div>
                    </div>
                    <div className={styles.windowBtns}>
                        <button className={`${styles.winBtn} ${styles.btnMaximize}`}>{'<>'}</button>
                        <button className={`${styles.winBtn} ${styles.btnMinimize}`}>—</button>
                        <button className={`${styles.winBtn} ${styles.btnClose}`}>X</button>
                    </div>
                </div>

                <div className={styles.workspaceWrapper}>
                    <header className={styles.header}>
                        <h1 className={styles.logo}>BankScope</h1>

                        <div className={styles.headerRightContainer}>
                            <div className={styles.headerRight}>
                                <select className={styles.statusSelect}>
                                    <option>업무 중</option>
                                    <option>자리 비움</option>
                                </select>
                                <div className={styles.userInfo}>
                                    <span className={styles.userIcon}>👤</span>
                                    <span className={styles.userName}>{user?.name || '김행원'} {user?.level ? `Lv.${user.level}` : ''}</span>
                                </div>
                                <button className={styles.headerBtn} onClick={handleLogout}>로그아웃</button>
                                <button className={styles.headerBtn}>비밀번호 변경</button>
                            </div>

                            {selectedTask && (
                                <div
                                    className={styles.notificationBanner}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("chat open");
                                    setIsChatOpen(true);
                                }}
                                >
                                    🔔 고객님의 채팅 상담업무가 도착했습니다
                                </div>
                                )}
                        </div>
                    </header>

                    <div className={styles.contentBody}>
                        <aside className={styles.leftSidebar}>
                            <div className={styles.sidebarHeader}>
                                <span>접수고객</span>
                                <span className={styles.waitingCount}>••• {visibleTasks.length}명 대기/처리중</span>
                            </div>
                            <div className={styles.customerList}>
                                {isLoading ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>로딩 중...</div>
                                ) : visibleTasks.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>대기 중인 고객이 없습니다.</div>
                                ) : (
                                    visibleTasks.map((task) => (
                                        <div
                                            key={task.taskId}
                                            className={`${styles.customerCard} ${selectedTask?.taskId === task.taskId ? styles.activeCard : ''}`}
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.customerName}>{task.userName} <small>{task.ticketNumber}</small></span>
                                                <span className={`${styles.tierBadge} ${styles.일반}`}>{task.grade || '일반'}</span>
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <span className={styles.time}>🕗 {task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                                <span className={styles.taskLine}></span>
                                                <span className={styles.task}>{task.taskDetailType}</span>
                                            </div>
                                            <div className={styles.riskBarContainer}>
                                                <div className={styles.riskBar} style={{ width: '0%' }}>0%</div>
                                                <span className={styles.riskText}>연체 / 리스크 지수</span>
                                            </div>
                                            <div className={styles.cardActions}>
                                                {task.status === 'IN_PROGRESS' ? (
                                                    <>
                                                        <button className={styles.btnProcessing}>처리중..</button>
                                                        <button 
                                                            className={styles.btnComplete}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCompleteTask(task); 
                                                            }}
                                                        >
                                                            처리 완료
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className={styles.btnAccept} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAcceptTask(task);
                                                        }}
                                                    >
                                                        업무 수락
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </aside>

                        <main className={styles.mainContent}>
                            {!selectedTask ? (
                                <div className={styles.welcomeScreen}>
                                    <h2>업무를 시작해주세요</h2>
                                    <h1 className={styles.bigLogo}>BankScope</h1>
                                </div>
                            ) : (
                                <div className={styles.detailScreen}>
                                    <div className={styles.detailMain}>
                                        <div className={styles.detailHeader}>
                                            <div className={styles.detailCustomerInfo}>
                                                <span className={`${styles.tierBadge} ${styles.일반}`}>{selectedTask.grade || '일반'}</span>
                                                <h2>{selectedTask.userName} <small>{selectedTask.ticketNumber}</small></h2>
                                                <span className={styles.customerId}>접수번호: {selectedTask.taskId}</span>
                                            </div>
                                            <div className={styles.detailRisk}>
                                                예상 대기 시간 <strong>{selectedTask.expectedWaitingTime}분</strong>
                                            </div>
                                        </div>
                                        <div className={styles.accountList}>

                                            <div className={styles.accountCard}>

                                                <div className={styles.accountHeader}>
                                                    <h3>요청 업무</h3>
                                                    <span className={styles.tagBlue}>{selectedTask.taskType}</span>
                                                </div>

                                                <p>상세 내용: {selectedTask.taskDetailType}</p>
                                                <p>접수 시간: {selectedTask.createdAt}</p>

                                                {/* 버튼 (폼 열기 전만 보임) */}
                                                {!selectedWorkType && (
                                                    (selectedTask.taskType === "계좌 개설" ||
                                                    selectedTask.taskDetailType === "계좌 개설") && (
                                                        <button
                                                            className={styles.btnAccept}
                                                            style={{ marginTop: "10px" }}
                                                            onClick={() => setSelectedWorkType("ACCOUNT_CREATE")}
                                                        >
                                                            계좌 개설 처리
                                                        </button>
                                                    )
                                                )}

                                                {selectedWorkType === "ACCOUNT_CREATE" && (
                                                        <AccountCreateForm
                                                            accountType={accountType}
                                                            setAccountType={setAccountType}
                                                            accountAlias={accountAlias}
                                                            setAccountAlias={setAccountAlias}
                                                            accountPassword={accountPassword}
                                                            setAccountPassword={setAccountPassword}
                                                            confirmPassword={confirmPassword}
                                                            setConfirmPassword={setConfirmPassword}
                                                            onCancel={() => setSelectedWorkType(null)}
                                                            onCreate={handleCreateAccount}
                                                        />
                                                    )}

                                            </div>



                                        </div>
                                    </div>

                                    <aside className={styles.rightSidebar}>
                                        <div className={styles.infoBox}>
                                            <h4>고객 특이사항</h4>
                                            <div className={styles.alertItem}>⚠️ 특이사항 없음</div>
                                        </div>
                                        <div className={styles.infoBox}>
                                            <h4>AI 추천 상품/서비스</h4>
                                            <ul>
                                                <li>1. 추천 상품 A</li>
                                                <li>2. 추천 상품 B</li>
                                            </ul>
                                        </div>
                                        <h4>연령대 분석</h4>
                                        {/*이부분 건들지말것*/}
                                        <div className={styles.ageGrid}>
                                            <div className={styles.ageItem}>10대</div>
                                            <div className={styles.ageItem}>20대</div>
                                            <div className={styles.ageItem}>30대</div>
                                            <div className={styles.ageItem}>40대</div>
                                            <div className={styles.ageItem}>50대</div>
                                            <div className={`${styles.ageItem} ${styles.ageActive}`}>60대</div>
                                        </div>
                                        <div className={styles.ageDescription}>
                                            <strong>60대+ 고객 주요 관심사</strong><br />
                                            : 노후자산관리, 역모기지, 시니어 우대상품
                                        </div>
                                    </aside>
                                </div>
                            )}
                        </main>
                    </div>
                </div>

                <div className={styles.zoomSidebar}>
                    <div className={styles.zoomTrack}>
                        <div className={styles.zoomHandle}>
                            <div className={styles.zoomPlus}>+</div>
                            <div className={styles.zoomText}>돋<br/>보<br/>기</div>
                        </div>
                    </div>
                </div>

            </div>


                    {isChatOpen && (
                        <ChatModal
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            onSend={handleSend}
                            onClose={() => setIsChatOpen(false)}
                            chatEndRef={chatEndRef}
                        />
                    )}
                </div>
            );
        };

export default BankerWorkSpace;
