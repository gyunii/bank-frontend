import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMain.module.css';
import { useAuth } from '../context/AuthContext';
import logoutIcon from '../images/AdminMain/logout.png';
import pwIcon from '../images/AdminMain/pw.png';
import navIcon from '../images/AdminMain/icon.png';
import adminIcon from '../images/AdminMain/admin.png';
import UserManagement from '../components/Admin/UserManagement.jsx';

const AdminMain = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('register'); // 'register', 'info'

    const handleLogout = async () => {
        await logout();
        navigate('/AdminLogin');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'register':
                return (
                    <div className={styles.card}>
                        <UserManagement />
                    </div>
                );
            case 'info':
                return (
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>정보 변경</h3>
                        <p>정보 변경 폼이 여기에 들어갑니다.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <nav className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>BankScope ERP</h2>
                </div>
                <div 
                    className={`${styles.menuItem} ${activeTab === 'register' ? styles.activeMenu : ''}`}
                    onClick={() => setActiveTab('register')}
                >
                    <img src={navIcon} alt="네비바아이콘" className={styles.navIcon} />
                    직원 등록
                </div>
                <div 
                    className={`${styles.menuItem} ${activeTab === 'info' ? styles.activeMenu : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <img src={navIcon} alt="네비바아이콘" className={styles.navIcon} />
                    정보 변경
                </div>
                
                <div className={styles.bottomMenu}>
                    <div className={styles.menuItem}>
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
                        최고관리자님 반갑습니다.
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
