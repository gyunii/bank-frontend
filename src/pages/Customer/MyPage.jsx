import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';
import profileImg from "../../images/Mypage/Profile.png"
import lockImg from "../../images/Mypage/Lock.png"
import otpImg from "../../images/Mypage/Mobile.png"
import arrowImg from "../../images/Mypage/ArrowRight.png"

const MyPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('accounts');
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/Login");
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (activeTab === 'accounts' && user) {
            const fetchMyAccounts = async () => {
                try {
                    const response = await fetch('/api/account/list', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.result === 'SUCCESS') {
                        setAccounts(data.accounts);
                    } else {
                        console.error("계좌 불러오기 실패:", data.message);
                    }
                } catch (error) {
                    console.error("API 호출 중 에러 발생:", error);
                }
            };

            fetchMyAccounts();
        }
    }, [activeTab, user]);

    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    console.log("User Info:", user);

    // const maskResidentNumber = (residentNumber) => {
    //     if (!residentNumber) return '';
    //     if (residentNumber.length < 7) return residentNumber;
    //     return residentNumber.substring(0, 6) + '-*******';
    // };

    // 1. 계정 관리
    const renderAccountManagement = () => (
        <div className={styles.managementWrapper}>
            <h2 className={styles.managementTitle}>개인 정보 변경</h2>
            <div className={styles.formWrapper}>
                {/* 닉네임 -> 이름으로 변경, defaultValue에 DB 데이터(user.name) 연결 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>이름</label>
                    <input 
                        type="text" 
                        defaultValue={user.name} 
                        placeholder="이름을 입력해주세요" 
                        className={styles.input} 
                    />
                </div>
                
                {/* defaultValue에 DB 데이터(user.email) 연결 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>이메일</label>
                    <div className={styles.inputRow}>
                        <input 
                            type="text" 
                            defaultValue={user.email} 
                            placeholder="이메일을 입력해주세요" 
                            className={`${styles.input} ${styles.flex1}`} 
                        />
                        <button className={styles.formBtn}>인증 번호</button>
                    </div>
                    <div className={styles.inputRow}>
                        <input type="text" placeholder="인증번호를 입력해주세요" className={`${styles.input} ${styles.flex1}`} />
                        <button className={styles.formBtn}>확인</button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>비밀번호</label>
                    <input type="password" placeholder="비밀번호를 입력해주세요" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>비밀번호 재확인</label>
                    <input type="password" placeholder="비밀번호를 동일하게 입력해주세요" className={styles.input} />
                </div>
            </div>
        </div>
    );

    // 2. 계정 보안
    const renderSecurity = () => (
        <div className={styles.securityWrapper}>
            <div className={styles.securityCard}>
                <img src={lockImg} alt="Lock" className={styles.securityIconImg} />
                <span className={styles.securityTitle}>핀 번호관리</span>
            </div>
            <div className={styles.securityCard}>
                <img src={otpImg} alt="OTP" className={styles.securityIconImg} />
                <span className={styles.securityTitle}>디지털 OTP 관리</span>
            </div>
        </div>
    );

    // 계좌 유형 한글로 변환
    const getAccountTypeName = (type) => {
        switch(type) {
            case 'DEMAND': return '입출금';
            case 'DEPOSIT': return '예금';
            case 'SAVINGS': return '적금';
            default: return '계좌';
        }
    };

    // 3. 계좌 관리
    const renderAccounts = () => {
        return (
            <div className={styles.accountsWrapper}>
                <h2 className={styles.sectionTitle}>계좌 조회</h2>
                
                <div className={styles.accountList}>
                    {accounts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            보유하신 계좌가 없습니다.
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <div key={account.id || account.accountId} className={styles.accountCard}>
                                <div className={styles.accountInfo}>
                                    <div className={styles.accountNameRow}>
                                        {/* accountAlias가 있으면 그걸 띄우고, 없으면 accountType을 한글로 변환해서 띄움 */}
                                        <span className={styles.accountName}>
                                            {account.accountAlias || `기본 ${getAccountTypeName(account.accountType)}`}
                                        </span>
                                    </div>
                                    <span className={styles.accountNumber}>{account.accountNumber}</span>
                                </div>
                                
                                <div className={styles.accountActions}>
                                    <span className={styles.balance}>{account.balance?.toLocaleString()} 원</span>
                                    <button className={styles.transferBtn}>이체</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.layoutWrapper}>
                
                {/* 왼쪽 사이드바 */}
                <div className={styles.sidebar}>
                    {/* 프로필 영역 */}
                    <div className={styles.profileArea}>
                        <img src={profileImg} alt="Profile" className={styles.profileImage} />
                        <div className={styles.textCenter}>
                            <p className={styles.profileName}>
                                환영합니다. <strong>{user.name}</strong>님
                            </p>
                            <p className={styles.profileEmail}>{user.email}</p>
                        </div>
                    </div>

                    {/* 메뉴 영역 */}
                    <div className={styles.menuArea}>
                        <div 
                            className={`${styles.menuItem} ${activeTab === 'account' ? styles.active : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <span>계정 관리</span>
                            <img src={arrowImg} alt="Select" className={styles.chevronImg} />
                        </div>
                        <div 
                            className={`${styles.menuItem} ${activeTab === 'security' ? styles.active : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <span>계정 보안</span>
                            <img src={arrowImg} alt="Select" className={styles.chevronImg} />
                        </div>
                        <div 
                            className={`${styles.menuItem} ${activeTab === 'accounts' ? styles.active : ''}`}
                            onClick={() => setActiveTab('accounts')}
                        >
                            <span>계좌 관리</span>
                            <img src={arrowImg} alt="Select" className={styles.chevronImg} />
                        </div>
                    </div>
                </div>

                {/* 오른쪽 콘텐츠 영역 */}
                <div className={styles.contentArea}>
                    {activeTab === 'account' && renderAccountManagement()}
                    {activeTab === 'security' && renderSecurity()}
                    {activeTab === 'accounts' && renderAccounts()}
                </div>

            </div>
        </div>
    );
};

export default MyPage;
