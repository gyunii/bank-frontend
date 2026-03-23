import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BankerWorkSpace.module.css';
import WorkSpaceBackground from '../../images/Banker/WorkSpaceBackground.png';
import { useAuth } from '../../context/AuthContext';
import AccountCreateForm from "../../pages/Banker/AccountCreate";
import ChatModal from "../../pages/Banker/ChatModal.jsx";
import CustomModal from '../../components/common/CustomModal';

const BankerWorkSpace = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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

    // 💡 공통 모달 상태 추가
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        onConfirm: null
    });
    const modalActionHandled = useRef(false);

    const showAlert = (message, onConfirm = null) => {
        modalActionHandled.current = false;
        setModalConfig({ isOpen: true, message, onConfirm });
    };

    const handleModalClose = () => {
        if (modalActionHandled.current) return;
        modalActionHandled.current = true;
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.onConfirm) {
            modalConfig.onConfirm();
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            showAlert("로그인이 필요한 서비스입니다.", () => {
                navigate("/AdminLogin");
            });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            
            // selectedTask가 IN_PROGRESS이고 계좌 개설 업무이면 폼을 바로 염
            if (selectedTask.status === 'IN_PROGRESS' && 
                (selectedTask.taskType === "계좌 개설" || selectedTask.taskDetailType === "계좌 개설")) {
                setSelectedWorkType("ACCOUNT_CREATE");
            }
        }
    }, [selectedTask]);

    useEffect(() => {
        if (selectedTask) {
            const currentTaskInList = tasks.find(t => t.taskId === selectedTask.taskId);
            
            // 만약 목록에 아예 없거나(필터링됨), 상태가 COMPLETED라면 선택 해제
            if (!currentTaskInList || currentTaskInList.status === 'COMPLETED') {
                setSelectedTask(null);
                setSelectedWorkType(null);
            } else {
                // 목록의 상태와 selectedTask의 상태가 다르다면 동기화
                if(currentTaskInList.status !== selectedTask.status) {
                    setSelectedTask(currentTaskInList);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);


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

    /* 계좌 생성 함수 */
    const handleCreateAccount = async () => {
        // 1. 사전 검증
        if (!selectedTask) return;

        if (accountPassword !== confirmPassword) {
            showAlert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const params = new URLSearchParams({
                userId: selectedTask.userId,
                accountType: accountType,
                accountAlias: accountAlias,
                accountPassword: accountPassword
            });

            // [STEP 1] 계좌 생성 API 호출
            const response = await fetch(`/api/account/register?${params}`, {
                method: "POST"
            });

            if (!response.ok) {
                showAlert("서버 응답 오류로 계좌 생성에 실패하였습니다.");
                return;
            }

            const data = await response.json(); // 리턴값: AccountResult (SUCCESS, FAILURE, FAILURE_USER_NOT_EXIST)

            // 계좌 생성 결과 확인 (AccountResult 분기)
            switch (data.result) {
                case 'SUCCESS':
                    // 생성 성공 시에만 다음 단계(업무 종료)로 진행
                    break;
                case 'FAILURE_USER_NOT_EXIST':
                    showAlert("존재하지 않는 사용자입니다.");
                    return;
                case 'FAILURE':
                    showAlert("계좌 생성에 실패하였습니다.");
                    return;
                default:
                    showAlert("알수없는 이유로 계좌 생성에 실패하였습니다.");
                    return;
            }

            // [STEP 2] 업무 상태를 COMPLETED로 변경
            const completeResponse = await fetch(`/api/member/task/${selectedTask.taskId}/status?status=COMPLETED`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!completeResponse.ok) {
                showAlert("계좌는 생성되었으나, 업무 상태 업데이트 중 오류가 발생했습니다.");
                return;
            }

            const completeData = await completeResponse.json(); // 리턴값: TaskResult (SUCCESS, FAILURE, FAILURE_TASK_IN_PROGRESS, FAILURE_SESSION)

            // 업무 상태 업데이트 결과 확인 (TaskResult 분기)
            switch (completeData.result) {
                case 'SUCCESS':
                    showAlert(`계좌가 생성되었습니다.\n계좌번호: ${data.account?.accountNumber}`);

                    // 로컬 목록 즉시 갱신 (UI 반영)
                    setTasks(prevTasks =>
                        prevTasks.map(t => t.taskId === selectedTask.taskId ? { ...t, status: 'COMPLETED' } : t)
                    );

                    // 선택 상태 및 폼 초기화
                    setSelectedWorkType(null);
                    setSelectedTask(null);
                    setAccountType("");
                    setAccountAlias("");
                    setAccountPassword("");
                    setConfirmPassword("");

                    // 서버와 목록 동기화
                    await fetchTasks();
                    break;

                case 'FAILURE_TASK_IN_PROGRESS':
                    showAlert("해당 업무가 현재 처리 가능한 상태가 아닙니다.");
                    break;

                case 'FAILURE_SESSION':
                    showAlert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    break;

                case 'FAILURE':
                default:
                    showAlert(`업무 종료 처리 실패: ${completeData.result}`);
                    break;
            }

        } catch (error) {
            console.error("계좌 생성 프로세스 오류:", error);
            showAlert("처리 중 예기치 못한 오류가 발생했습니다.");
        }
    };


    // 업무 수락 취소 (IN_PROGRESS -> WAITING)
    const handleCancelAcceptTask = async (task) => {
        try {
            const response = await fetch(`/api/member/task/${task.taskId}/status?status=WAITING`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                showAlert('서버 오류 발생');
                return;
            }

            const data = await response.json();

            switch (data.result) {
                case 'SUCCESS':
                    { const updatedTask = { ...task, status: 'WAITING' };
                    setSelectedTask(updatedTask);
                    setTasks(prevTasks => prevTasks.map(t => t.taskId === task.taskId ? updatedTask : t));
                    setSelectedWorkType(null);
                    await fetchTasks();
                    break; }

                case 'FAILURE_SESSION':
                    showAlert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    break;

                case 'FAILURE':
                default:
                    showAlert(`업무 취소 실패: ${data.result}`);
                    break;
            }
        } catch (error) {
            console.error('Error canceling task:', error);
            showAlert('오류가 발생했습니다.');
        }
    };

    // 업무 수락 (WAITING -> IN_PROGRESS)
    const handleAcceptTask = async (task) => {
        try {
            const response = await fetch(`/api/member/task/${task.taskId}/status?status=IN_PROGRESS`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                showAlert('서버 오류 발생');
                return;
            }

            const data = await response.json();

            switch (data.result) {
                case 'SUCCESS':
                    { const updatedTask = { ...task, status: 'IN_PROGRESS' };
                    setSelectedTask(updatedTask);
                    setTasks(prevTasks => prevTasks.map(t => t.taskId === task.taskId ? updatedTask : t));
                    await fetchTasks();
                    break; }

                case 'FAILURE_TASK_IN_PROGRESS':
                    showAlert('이미 다른 담당자가 처리 중인 업무입니다.');
                    await fetchTasks(); // 목록 동기화해서 화면 갱신
                    break;

                case 'FAILURE_SESSION':
                    showAlert('세션이 만료되었습니다.');
                    break;

                case 'FAILURE':
                default:
                    showAlert('업무 수락에 실패했습니다.');
                    break;
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            showAlert('오류가 발생했습니다.');
        }
    };

    // 업무 종료 (IN_PROGRESS -> COMPLETED)
    const handleCompleteTask = async (taskToComplete) => {
        const targetTask = taskToComplete || selectedTask;
        if (!targetTask) return;

        try {
            const response = await fetch(`/api/member/task/${targetTask.taskId}/status?status=COMPLETED`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                showAlert('서버 오류 발생');
                return;
            }

            const data = await response.json();

            switch (data.result) {
                case 'SUCCESS':
                    showAlert('업무가 종료되었습니다.');
                    setTasks(prevTasks => prevTasks.map(t =>
                        t.taskId === targetTask.taskId ? { ...t, status: 'COMPLETED' } : t
                    ));
                    if (selectedTask?.taskId === targetTask.taskId) {
                        setSelectedTask(null);
                        setSelectedWorkType(null);
                    }
                    await fetchTasks();
                    break;

                case 'FAILURE_SESSION':
                    showAlert('로그인 정보가 유효하지 않습니다.');
                    break;

                default:
                    showAlert('업무 종료 처리에 실패했습니다.');
                    break;
            }
        } catch (error) {
            console.error('Error completing task:', error);
            showAlert('오류가 발생했습니다.');
        }
    };

    // 대기 중인 업무와 처리 중인 업무 모두 표시
    const visibleTasks = tasks.filter(task => task.status === 'WAITING' || task.status === 'IN_PROGRESS');

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

                                                {selectedTask.status !== 'IN_PROGRESS' && (
                                                    <>
                                                        <p>상세 내용: {selectedTask.taskDetailType}</p>
                                                        <p>접수 시간: {selectedTask.createdAt}</p>
                                                    </>
                                                )}
                                                {!selectedWorkType && (
                                                    selectedTask.status === 'WAITING' ? (
                                                        <button
                                                            className={styles.btnAccept}
                                                            style={{ marginTop: "10px" }}
                                                            onClick={() => handleAcceptTask(selectedTask)}
                                                        >
                                                            업무 수락
                                                        </button>
                                                    ) : (
                                                        <div style={{ display: 'flex',flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                                            <div>
                                                                테스트용 취소/ 업무종료 버튼
                                                            </div>
                                                            <div style={{display: 'flex' , width: '100%', gap: '10px'}}>
                                                            <button
                                                                className={styles.btnAccept}
                                                                onClick={() => handleCancelAcceptTask(selectedTask)}
                                                                style={{color: '#eaeaea'}}
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                className={styles.btnAccept}
                                                                onClick={() => handleCompleteTask(selectedTask)}
                                                            >
                                                                업무 종료
                                                            </button>
                                                            </div>
                                                        </div>
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
                                                        onCancel={() => {
                                                            setSelectedWorkType(null);
                                                            handleCancelAcceptTask(selectedTask); // 폼에서 취소 누를때 대기상태로
                                                        }}
                                                        onCreate={handleCreateAccount}
                                                    />
                                                )}


                                                {/* 아래에 계좌개설때 처럼 계속 추가하기 */}




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

            {/* CustomModal 추가 (Alert 대체용) */}
            <CustomModal 
                isOpen={modalConfig.isOpen} 
                onClose={handleModalClose} 
                title="안내"
                onConfirm={handleModalClose}
                confirmText="확인"
            >
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2rem', color: '#333', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {modalConfig.message}
                </div>
            </CustomModal>
        </div>
    );
};

export default BankerWorkSpace;