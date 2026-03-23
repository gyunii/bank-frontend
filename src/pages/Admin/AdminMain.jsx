import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMain.module.css';
import { useAuth } from '../../context/AuthContext.jsx';
import logoutIcon from '../../images/AdminMain/logout.png';
import pwIcon from '../../images/AdminMain/pw.png';
import navIcon from '../../images/AdminMain/icon.png';
import adminIcon from '../../images/AdminMain/admin.png';
import UserManagement from '../../components/Admin/UserManagement.jsx';
import Admin_dashboard from './Admin_dashboard.jsx';
import BoardManagement from '../../components/Admin/BoardManagement.jsx';

// ★ 마이페이지 컴포넌트 불러오기
import AdminMyPage from './AdminMyPage.jsx';

const AdminMain = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: '대시보드' },     
        { id: 'bank', label: '은행 관리' },
        { id: 'deposit', label: '예금 상품 관리' },
        { id: 'savings', label: '적금 상품 관리' },
        { id: 'loan', label: '대출 상품 관리' },
        { id: 'rates', label: '금리 등록' },
        { id: 'users', label: '사용자 관리' },
        { id: 'news', label: '새소식 관리' },    
        { id: 'events', label: '이벤트 관리' }, 
    ];

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/AdminLogin");
        }
    }, [user, loading, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    const handleLogout = async () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            await logout();
            navigate('/AdminLogin');
        }
    };

   const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return <div className={styles.card}><Admin_dashboard /></div>;
        case 'bank':
            return <div className={styles.card}><h3>은행 관리</h3><p>은행 설정 페이지 준비 중...</p></div>;
        case 'deposit':
            return <div className={styles.card}><h3>예금 상품 관리</h3><p>예금 상품 목록...</p></div>;
        case 'savings':
            return <div className={styles.card}><h3>적금 상품 관리</h3><p>적금 상품 목록...</p></div>;
        case 'loan':
            return <div className={styles.card}><h3>대출 상품 관리</h3><p>대출 상품 목록...</p></div>;
        case 'rates':
            return <div className={styles.card}><h3>금리 등록</h3><p>금리 설정 페이지...</p></div>;
        case 'users':
            return <div className={styles.card}><UserManagement /></div>;
        case 'news':
            return <div className={styles.card}><BoardManagement type="news" title="새소식"/></div>;
        case 'events':
            return <div className={styles.card}><BoardManagement type="events" title="이벤트" /></div>;
            
        // ★ 'info' 탭일 때 AdminMyPage를 보여주도록 추가
        case 'info':
            return <AdminMyPage />;
            
        default:
            return <div className={styles.card}><Admin_dashboard /></div>;
    }
};

    return (
        <div className={styles.container}>
            <nav className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>BankScope ERP</h2>
                </div>
                
                <div className={styles.menuList}>
                    {menuItems.map((item) => (
                        <div 
                            key={item.id}
                            className={`${styles.menuItem} ${activeTab === item.id ? styles.activeMenu : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <img src={navIcon} alt="icon" className={styles.navIcon} />
                            {item.label}
                        </div>
                    ))}
                </div>
                
                <div className={styles.bottomMenu}>
                    <div 
                        className={`${styles.menuItem} ${activeTab === 'info' ? styles.activeMenu : ''}`} 
                        onClick={() => setActiveTab('info')}
                    >
                        <img src={pwIcon} alt="비밀번호 변경" className={styles.menuIcon} />
                        비밀번호 변경
                    </div>
                    <div className={styles.menuItem} onClick={handleLogout}>
                        <img src={logoutIcon} alt="로그아웃" className={styles.menuIcon} />
                        로그아웃
                    </div>
                </div>
            </nav>

            <div className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.welcomeMsg}>
                        <img src={adminIcon} alt="관리자 아이콘" className={styles.adminIcon} />
                        <span><strong>최고관리자</strong>님 반갑습니다.</span>
                    </div>
                </header>
                
                <main className={styles.mainContent}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminMain;