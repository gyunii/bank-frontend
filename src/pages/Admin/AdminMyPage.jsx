import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../../components/common/CustomModal.jsx'; 
import styles from './AdminMyPage.module.css';

const AdminMyPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 비밀번호 입력 상태
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 에러 메시지 상태 
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 모달의 종류 관리
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/Login");
    }
  }, [user, loading, navigate]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    
    // 모든 검증 통과 시 모달 열기
    setMessage({ type: '', text: '' });
    setModalType('confirm'); 
  };

  // 비밀번호 변경 로직 실행
  const executePasswordChange = () => {
    setTimeout(() => {
      setModalType('success');
    }, 150);
  };

  // 성공 모달 확인 버튼 클릭 시 실행되는 함수
  const handleSuccessConfirm = () => {
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setModalType('');
  };

  const handleConfirmClose = () => {
    setModalType(prev => prev === 'confirm' ? '' : prev);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>마이 페이지</h1>
        <div className={styles.divider}></div>
      </div>

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
            <div className={styles.badgeWrapper}>
              <span className={styles.userRole}>{user.grade || '관리자'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.passwordSection}>
        <div className={styles.passwordWrapper}>
          <h2 className={styles.passwordTitle}>비밀번호 변경</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>현재 비밀번호</label>
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


      {/* 1. 변경 전 확인 모달 */}
      {modalType === 'confirm' && (
        <CustomModal 
          isOpen={true} 
          onClose={handleConfirmClose}
          title="비밀번호 변경 확인"
          onConfirm={executePasswordChange}
          onCancel={handleConfirmClose}
          confirmText="변경하기"
          cancelText="취소"
        >
          <p className={styles.modalConfirmText}>
            정말로 비밀번호를 변경하시겠습니까?
          </p>
        </CustomModal>
      )}

      {/* 2. 성공 완료 모달 */}
      {modalType === 'success' && (
        <CustomModal 
          isOpen={true} 
          onClose={handleSuccessConfirm}
          title="변경 완료"
          onConfirm={handleSuccessConfirm}
          confirmText="확인"
        >
          <p className={styles.modalSuccessText}>
            비밀번호가 성공적으로 변경되었습니다.
          </p>
        </CustomModal>
      )}

    </div>
  );
};

export default AdminMyPage;