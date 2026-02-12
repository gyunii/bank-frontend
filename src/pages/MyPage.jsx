import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';

const MyPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'account', 'history'

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/Login");
        }
    }, [user, loading, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    console.log("User Info:", user); // 디버깅용 로그: 콘솔에서 user 객체 확인 가능

    const maskResidentNumber = (residentNumber) => {
        if (!residentNumber) return '';
        if (residentNumber.length < 7) return residentNumber;
        return residentNumber.substring(0, 6) + '-*******';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <>
                        <h2 className={styles.title}>내 정보</h2>
                        <div className={styles.infoBox}>
                            <p className={styles.infoItem}><strong>이름:</strong> <span>{user.name}</span></p>
                            <p className={styles.infoItem}><strong>이메일:</strong> <span>{user.email}</span></p>
                            <p className={styles.infoItem}><strong>주민등록번호:</strong> <span>{maskResidentNumber(user.residentNumber)}</span></p>
                        </div>
                    </>
                );
            case 'account':
                return (
                    <>
                        <h2 className={styles.title}>계정 관리</h2>
                        <div className={styles.infoBox}>
                            <p>계정 관리 기능이 준비 중입니다.</p>
                        </div>
                    </>
                );
            case 'history':
                return (
                    <>
                        <h2 className={styles.title}>금융 내역 조회</h2>
                        <div className={styles.infoBox}>
                            <p>금융 내역 조회 기능이 준비 중입니다.</p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.sidebar}>
                <div 
                    className={`${styles.menuItem} ${activeTab === 'info' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    내 정보
                </div>
                <div 
                    className={`${styles.menuItem} ${activeTab === 'account' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    계정 관리
                </div>
                <div 
                    className={`${styles.menuItem} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    금융 내역 조회
                </div>
            </div>
            <div className={styles.contentArea}>
                {renderContent()}
            </div>
        </div>
    );
};

export default MyPage;
