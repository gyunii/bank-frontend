import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BankerWorkSpace.module.css';
import { useModal } from '../../context/ModalContext';
import WorkSpaceBackground from '../../images/Banker/WorkSpaceBackground.png';
import { useAuth } from '../../context/AuthContext';
import AccountCreateForm from "../../components/Banker/AccountCreate.jsx";
import Accounts from "../../components/Banker/Accounts.jsx";
import ChatModal from "../../pages/Banker/ChatModal.jsx";
import CustomModal from '../../components/common/CustomModal';
import TossModal from '../../components/Banker/TossModal';
import Deposit from '../../components/Banker/Deposit';
import Withdraw from "../../components/Banker/Withdraw.jsx";
import TaskSelect from "../../components/Banker/TaskSelect.jsx";
import Card from "../../components/Banker/Card.jsx";
import Transfer from "../../components/Banker/Transfer.jsx";
import LoanPayment from "../../components/Banker/LoanPayment.jsx";
import FinancialProduct from "../../components/Banker/FinancialProduct.jsx";
import CorporateLoan from "../../components/Banker/CorporateLoan.jsx"; 
import CorporateAccount from "../../components/Banker/CorporateAccount.jsx";
import CorporateCard from "../../components/Banker/CorporateCard.jsx";
import CorporateBankrupt from "../../components/Banker/CorporateBankrupt.jsx";
import CorporateArrears from "../../components/Banker/CorporateArrears.jsx";
import ChangePassword from "../../components/Banker/ChangePassword.jsx";
import ProductModal from '../../components/Banker/ProductModal.jsx';


const RECOMM_PRODUCTS = [
  { 
    id: 1, 
    name: "든든 직장인 우대적금", 
    description: "최고 연 5.5% 금리 혜택!", 
    detail: "직장인을 위한 맞춤형 적금 상품으로, 급여 이체 및 주거래 요건 충족 시 우대 금리를 제공합니다." 
  },
  { 
    id: 2, 
    name: "MZ 청년 희망 적금", 
    description: "청년들의 목돈 마련을 위한 필수템", 
    detail: "만 19세~34세 청년을 대상으로 하며, 높은 기본 금리에 정부 지원 혜택이 더해진 상품입니다." 
  },
  { 
    id: 3, 
    name: "시니어 상생 통장", 
    description: "60대 이상 고객 전용 특화 상품", 
    detail: "연금 수령 시 수수료 면제 및 병원비 할인 등 실질적인 생활 혜택을 담은 입출금 통장입니다." 
  }
];

const BankerWorkSpace = () => {
    const { openModal } = useModal();
    const [isWorking, setIsWorking] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
};
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "customer", text: "안녕하세요 상담 요청드립니다." },
        { sender: "banker", text: "네 고객님 무엇을 도와드릴까요?" }
    ]);
    const [isTossModalOpen, setIsTossModalOpen] = useState(false);
    const [taskToToss, setTaskToToss] = useState(null); // 어떤 업무를 이관할지 저장

    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [note, setNote] = useState("");

    // 계좌 유형의 초기값을 "CHECKING"으로 설정
    const [accountType, setAccountType] = useState("CHECKING");
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



    const handleTaskMenuSelect = (taskTitle) => {
        // TaskSelect에서 넘어온 제목에 따라 mapping
        switch (taskTitle) {
            case "계좌 개설":
                setSelectedWorkType("ACCOUNT_CREATE");
                break;
            case "입금":
                setSelectedWorkType("DEPOSIT");
                break;
            case "출금":
                setSelectedWorkType("WITHDRAW");
                break;
            case "예금":
                setSelectedWorkType("ACCOUNTS");
                break;
            case "적금":
                setSelectedWorkType("ACCOUNTS");
                break;
            case "이체" :
                setSelectedWorkType("TRANSFER")
                break;
            case "카드수령":
                setSelectedWorkType("CARD");
                break;
            case "체크카드 발급":
                setSelectedWorkType("CARD");
                break;
            case "신용카드 발급":
                setSelectedWorkType("CARD");
                break;
            /*case "법인카드 발급":
                setSelectedWorkType("CARD");
                break;*/
            case "대출 상환" :
                setSelectedWorkType("LOAN-PAYMENT");
                break;
            case "금융상품가입":
                setSelectedWorkType("FINANCIAL-PRODUCT");
                break;
            case "기업대출": 
                setSelectedWorkType("CORPORATE-LOAN");
                break;
            case "법인계좌 개설": 
                setSelectedWorkType("CORPORATE-ACCOUNT");
                break;
            case "법인카드 발급":
                setSelectedWorkType("CORPORATE-CARD");
                break;
            case "부도관리":
                setSelectedWorkType("BANKRUPT-MANAGEMENT");
                break;
            case "연체관리":
                setSelectedWorkType("CORPORATE-ARREARS");
                break;
            case "통장비밀번호 변경":
                setSelectedWorkType("CHANGE-PASSWORD");
                break;
            default:
                setSelectedWorkType(null);
                break;
     }
     }

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
                (selectedTask.taskDetailType === "입출금 계좌개설" || selectedTask.taskDetailType === "계좌개설" || selectedTask.taskDetailType === "입출금 계좌 개설")) {
                setSelectedWorkType("ACCOUNT_CREATE");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType === "예금" || selectedTask.taskDetailType === "적금" || selectedTask.taskDetailType === "법인계좌 개설")) {
                setSelectedWorkType("ACCOUNTS");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="입금")) {
                setSelectedWorkType("DEPOSIT");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="출금")) {
                setSelectedWorkType("WITHDRAW");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="이체")) {
                setSelectedWorkType("TRANSFER");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType.includes('카드'))) {
                setSelectedWorkType("CARD");
            }
            /*if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="카드")) {
                setSelectedWorkType("CREDIT");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="신용카드")) {
                setSelectedWorkType("CHECK");
            }*/
            /*if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="법인카드")) {
                setSelectedWorkType("CORPORATE-CARD");
            }*/
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="대출 상환")) {
                setSelectedWorkType("LOAN-PAYMENT");
            }

            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType.includes("금융상품"))) {
                setSelectedWorkType("FINANCIAL-PRODUCT");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="통장비밀번호 변경")) {
                setSelectedWorkType("CHANGE-PASSWORD");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="기업대출")) {
                setSelectedWorkType("CORPORATE-LOAN");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="법인계좌")) {
                setSelectedWorkType("CORPORATE-ACCOUNT");
            }

            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="부도관리")) {
                setSelectedWorkType("BANKRUPT-MANAGEMENT");
            }
            if (selectedTask.status === 'IN_PROGRESS' &&
                ( selectedTask.taskDetailType ==="연체관리")) {
                setSelectedWorkType("DELINQUENT-MANAGEMENT");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
                selectedTask.taskDetailType === "기업대출") {
                setSelectedWorkType("CORPORATE-LOAN");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
                selectedTask.taskDetailType === "법인계좌 개설") {
                setSelectedWorkType("CORPORATE-ACCOUNT");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
                selectedTask.taskDetailType === "법인카드 발급") {
                setSelectedWorkType("CORPORATE-CARD");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
                selectedTask.taskDetailType === "부도관리") {
                setSelectedWorkType("BANKRUPT-MANAGEMENT");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
                selectedTask.taskDetailType === "연체관리") {
                setSelectedWorkType("CORPORATE-ARREARS");
            }

            if (selectedTask.status === 'IN_PROGRESS' && 
            (selectedTask.taskDetailType === "통장 비밀번호 변경")) {
            setSelectedWorkType("CHANGE-PASSWORD");
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
                    setAccountType("CHECKING"); // 초기값으로 리셋
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

    // 연령대 계산 로직 추가
    const determineAgeGroup = (age) => {
        console.log("Customer Age:", age); // 💡 연령대 확인용 콘솔 로그 추가
        if (!age) return null;
        const numAge = Number(age);
        if (isNaN(numAge)) return null;

        if (numAge < 20) return "10대";
        if (numAge < 30) return "20대";
        if (numAge < 40) return "30대";
        if (numAge < 50) return "40대";
        if (numAge < 60) return "50대";
        return "60대";
    };

    // 업무 기록 저장 함수 
    const handlePostLog = async (idValue) => {
        if (!note.trim()) {
            return;
        }

        if (!idValue) {
            console.error("❌ 에러: ID 값이 비어있습니다.");
            return;
        }
        const logParams = new URLSearchParams({
            note: note,
            taskId: idValue 
        }).toString();

        try {
            const response = await fetch(`/api/task-processing-log/?${logParams}`, {
                method: 'POST'
            });
            
            if (response.ok) {
                console.log("✅ DB 저장 성공! 테이블을 확인해보세요.");
                setNote(""); 
            } else {
                console.error("❌ 서버 응답 에러:", response.status);
            }
        } catch (error) {
            console.error("❌ 네트워크 에러:", error);
        }
    };

    // 멤버 상태 변경 API 연결 함수
    const handleStatusChange = async (e) => {
        const selectedValue = e.target.value; 
        const nextStatus = selectedValue === 'working';
        setIsWorking(nextStatus);

        try {
            const response = await fetch(`/api/member/status?status=${nextStatus}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                openModal({
                    title: '상태 변경 완료',
                    message: `현재 업무 상태가 [${nextStatus ? '업무 중' : '자리 비움'}]으로 변경되었습니다.`,
                    confirmText: '확인',
                    cancelText: null,      
                    onConfirm: () => {
                        console.log("변경 확인 완료");
                    }
                });
            } else {
                setIsWorking(!nextStatus); 
                openModal({
                    title: '변경 실패',
                    message: '서버 오류로 인해 상태 변경에 실패했습니다.',
                    confirmText: '확인',
                    cancelText: null,
                    onConfirm: () => {}
                });
            }
        } catch (error) {
            setIsWorking(!nextStatus); 
            openModal({
                title: '오류',
                message: '서버와 통신할 수 없습니다.',
                confirmText: '확인',
                cancelText: null,
                onConfirm: () => {}
            });
        }
    };

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
                                <select className={styles.statusSelect}
                                value={isWorking ? 'working' : 'away'} 
                                onChange={handleStatusChange}>
                                    <option value="working">업무 중</option>
                                    <option value="away">자리 비움</option>
                                </select>
                                <div className={styles.userInfo}>
                                    <span className={styles.userIcon}>👤</span>
                                    <span className={styles.userName}>{user?.name || '김행원'} {user?.level ? `Lv.${user.level}` : ''}</span>
                                </div>
                                <button className={styles.headerBtn} onClick={handleLogout}>로그아웃</button>
                                <button className={styles.headerBtn}>비밀번호 변경</button>
                            </div>
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
                                                    <>
                                                    <button
                                                        className={styles.btnAccept}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAcceptTask(task);
                                                        }}
                                                    >
                                                        업무 수락
                                                    </button>
                                                        <button
                                                            className={styles.btnToss}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTaskToToss(task); // 이관할 태스크 저장
                                                                setIsTossModalOpen(true); // 모달 열기
                                                            }}
                                                        >
                                                            창구이관
                                                        </button>
                                                    </>
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
                                                {selectedWorkType === "TASK_SELECT" ? (
                                                    <TaskSelect
                                                        onSelectTask={(taskTitle) => handleTaskMenuSelect(taskTitle)}
                                                    />
                                                ) : (
                                                    <>
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
                                                                    className={styles.btnStart}
                                                                    style={{ marginTop: "10px" }}
                                                                    onClick={() => handleAcceptTask(selectedTask)}
                                                                >
                                                                    업무 수락
                                                                </button>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                                                    <div>테스트용 취소/ 업무종료 버튼</div>
                                                                    <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                                                                        <button
                                                                            className={styles.btnAccept}
                                                                            onClick={() => handleCancelAcceptTask(selectedTask)}
                                                                            style={{ color: '#eaeaea' }}
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

                                                        {/*입출금 (일반 예금) 계좌개설*/}
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
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                onCreate={handleCreateAccount}
                                                                taskId={selectedTask?.id}
                                                                selectedTask={selectedTask}
                                                                
                                                            />
                                                        )}

                                                        {/*입금*/}
                                                        
                                                        {selectedWorkType === "DEPOSIT" && (
                                                            <Deposit
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                            taskId={selectedTask?.id || selectedTask?.taskId || 0}
                                                            selectedTask={selectedTask}
                                                            onSuccess={() => {
                                                                const finalId = selectedTask?.id || selectedTask?.taskId || selectedTask?.task_id;
                                                                handlePostLog(finalId);
                                                            }}
                                                            />
                                                        )}

                                                        {/*출금*/}
                                                        {selectedWorkType === "WITHDRAW" && (
                                                            <Withdraw
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                taskId={selectedTask?.id}
                                                                selectedTask={selectedTask}
                                                                onSuccess={() => {
                                                                    const finalId = selectedTask?.id || selectedTask?.taskId || selectedTask;
                                                                    handlePostLog(finalId);
                                                                }}
                                                            />
                                                        )}

                                                        {/*이체*/}
                                                        {selectedWorkType === "TRANSFER" && (
                                                            <Transfer
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                taskId={selectedTask?.id}
                                                                selectedTask={selectedTask}
                                                                onSuccess={() => {
                                                                    const finalId = selectedTask?.id || selectedTask?.taskId || selectedTask;
                                                                    handlePostLog(finalId);
                                                                }}
                                                            />
                                                        )}

                                                        {/*카드수령*/}
                                                        {/*체크카드발급*/}
                                                        {selectedWorkType === "CARD" && (
                                                            <Card
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);}}
                                                                />
                                                        )}

                                                        {/*통장비번변경*/}
                                                        {selectedWorkType === "CHANGE-PASSWORD" && (
                                                            <ChangePassword 
                                                                    onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                    }} 
                                                                    onComplete={(pwData) => handleChangePassword(pwData)}
                                                                    selectedTask={selectedTask}
                                                                />
                                                        )}



                                                        {/*상담업무*/}
                                                        {/*예적금계좌개설*/}
                                                        {selectedWorkType === "ACCOUNTS" && (
                                                            <Accounts
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                            />
                                                        )}

                                                        {/*신용 카드 발급*/}

                                                        {/*대출상환*/}
                                                        {selectedWorkType === "LOAN-PAYMENT" && (
                                                            <LoanPayment
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                />
                                                        )}
                                                        {/*금융상품가입: 보험, 펀드 ,대출등*/}

                                                        {selectedWorkType === "FINANCIAL-PRODUCT" && (
                                                            <FinancialProduct
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                            />
                                                        )}
                                                        {/*기업 • 특수업무*/}
                                                        
                                                        {/*기업대출*/}
                                                        {selectedWorkType === "CORPORATE-LOAN" && (
                                                            <CorporateLoan
                                                                selectedTask={selectedTask}
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask); 
                                                                }}
                                                                onComplete={() => handleCompleteTask(selectedTask)}
                                                            />
                                                        )}

                                                        {/*법인계좌개설*/}
                                                        {selectedWorkType === "CORPORATE-ACCOUNT" && (
                                                            <CorporateAccount
                                                                selectedTask={selectedTask}
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                onComplete={() => handleCompleteTask(selectedTask)}
                                                            />
                                                        )}
                                                        {/*법인카드*/}
                                                        {selectedWorkType === "CORPORATE-CARD" && (
                                                            <CorporateCard
                                                                selectedTask={selectedTask}
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                onComplete={() => handleCompleteTask(selectedTask)}
                                                            />
                                                        )}
                                                        {/*부도관리*/}
                                                        {selectedWorkType === "BANKRUPT-MANAGEMENT" && (
                                                            <CorporateBankrupt
                                                                selectedTask={selectedTask}
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask);
                                                                }}
                                                                onComplete={() => handleCompleteTask(selectedTask)}
                                                            />
                                                        )}
                                                        {/*연체관리*/}
                                                        {selectedWorkType === "CORPORATE-ARREARS" && (
                                                            <CorporateArrears
                                                                selectedTask={selectedTask}
                                                                onCancel={() => {
                                                                    setSelectedWorkType(null);
                                                                    handleCancelAcceptTask(selectedTask); 
                                                                }}
                                                                onComplete={() => handleCompleteTask(selectedTask)} 
                                                            />
                                                        )}

                                                        {selectedTask.status !== 'WAITING' && (
                                                            <>
                                                                <div className={styles.backCard}>
                                                                    <button
                                                                        className={styles.backButton}
                                                                        onClick={() => setSelectedWorkType("TASK_SELECT")}
                                                                    >
                                                                        ← 이전으로
                                                                    </button>
                                                                </div>
                                                                <div className={styles.taskLog}>
                                                                    <textarea placeholder="업무기록을 작성해주세요" className={styles.textArea} 
                                                                    value={note} 
                                                                    onChange={(e) => setNote(e.target.value)} />
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <aside className={styles.rightSidebar}>
                                        <div className={styles.infoBox}>
                                            <h4>고객 특이사항</h4>
                                            <div className={styles.alertItem}>⚠️ 특이사항 없음</div>
                                        </div>

                                        {/*  AI 추천 상품/서비스 영역 */}
                                        <div className={styles.rightSidebar_infoBox_recommend}>
                                            <h4 className={styles.rightSidebar_infoBox_recommend_title}>AI 추천 상품/서비스</h4>
                                            <div className={styles.recommendList}>
                                                {RECOMM_PRODUCTS.map((product, index) => (
                                                    <div 
                                                        key={product.id} 
                                                        className={styles.recommendItem}
                                                        onClick={() => handleProductClick(product)}
                                                    >
                                                        
                                                        <span className={styles.recommendIcon}>{index + 1}</span>
                                                        {product.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <h4>연령대 분석</h4>
                                        <div className={styles.ageGrid}>
                                            {['10대', '20대', '30대', '40대', '50대', '60대'].map((ageGroup) => (
                                                <div
                                                    key={ageGroup}
                                                    className={`${styles.ageItem} ${determineAgeGroup(selectedTask.age) === ageGroup ? styles.ageActive : ''}`}
                                                >
                                                    {ageGroup}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.ageDescription}>
                                            <strong>{determineAgeGroup(selectedTask.age) || '연령 미상'}+ 고객 주요 관심사</strong><br />
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
            
            {isTossModalOpen && (
                <TossModal
                    task={taskToToss}
                    onClose={() => {
                        setIsTossModalOpen(false);
                        setTaskToToss(null);
                    }}
                />
            )}

            {/* 금융상품 가입 모달 추가 */}
            <ProductModal 
                isOpen={isModalOpen} 
                product={selectedProduct} 
                onClose={() => setIsModalOpen(false)} 
            />

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
