import React, { useState } from 'react';
import styles from './AdminMyPage.module.css';

const mockUser = {
  name: "관리팀 김 갑수",
  email: "admin1 @ naver.com",
  role: "관리자"
};

const AdminMyPage = () => {
  const [user] = useState(mockUser);
  
  // 비밀번호 변경 상태 관리 (카멜 케이스 적용)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 유효성 검사 로직
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    
    // 성공 시 처리 (향후 API 연동 시 이 부분에 axios 등을 넣으시면 됩니다)
    setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // 3초 후 알림 메시지 제거
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className={styles.container}>
      {/* 마이페이지 헤더 영역 */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>마이 페이지</h1>
        <div className={styles.divider}></div>
      </div>

      {/* 기본 정보 섹션 */}
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>기본 정보</h2>
        <div className={styles.infoCard}>
          <div className={styles.statusWrapper}>
            <select className={styles.statusSelect} defaultValue="active">
              <option value="active">활성화</option>
              <option value="inactive">비활성화</option>
            </select>
          </div>

          <div className={styles.profileIconWrapper}>
            <svg viewBox="0 0 24 24" fill="#00c09a" width="60" height="60">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div className={styles.userInfo}>
            <p className={styles.welcomeText}>
              환영합니다. <span className={styles.userName}>{user.name}</span>님
            </p>
            <p className={styles.userEmail}>{user.email}</p>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        </div>
      </section>

      {/* 비밀번호 변경 폼 섹션 */}
      <section className={styles.passwordSection}>
        <div className={styles.passwordWrapper}>
          <h2 className={styles.passwordTitle}>비밀번호 변경</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="현재 비밀번호를 입력해주세요"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="새로운 비밀번호를 입력해주세요"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="새로운 비밀번호를 한번 더 입력해주세요"
              />
            </div>

            <div className={styles.messageWrapper}>
              {message.text && (
                <p className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                  {message.text}
                </p>
              )}
            </div>

            <button type="submit" className={styles.submitBtn}>
              비밀번호 변경
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdminMyPage;