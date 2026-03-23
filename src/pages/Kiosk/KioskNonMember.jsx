import React, { useState, useRef } from 'react';
import styles from './Kiosk.module.css';
import CustomModal from '../../components/common/CustomModal';

const KioskNonMember = ({ formData, setFormData, onNext, onPrev }) => {
    const [localData, setLocalData] = useState({
        name: '',
        ssnFront: '',
        ssnBack: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const ssnFrontRef = useRef(null);
    const ssnBackRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 숫자만 입력되도록 처리
        if ((name === 'ssnFront' || name === 'ssnBack') && !/^\d*$/.test(value)) {
            return;
        }

        setLocalData({
            ...localData,
            [name]: value
        });

        // 앞자리 6자리 입력 완료 시 뒷자리로 포커스 이동
        if (name === 'ssnFront' && value.length === 6) {
            ssnBackRef.current?.focus();
        }
    };

    // 확인 버튼 핸들러
    const handleConfirm = async () => {
        const fullSsn = localData.ssnFront + localData.ssnBack;

        if (!localData.name || fullSsn.length !== 13) {
            setModalMessage('이름과 주민등록번호 13자리를 모두 입력해주세요.');
            setIsModalOpen(true);
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. 비회원 회원가입 (semi-register)
            const registerResponse = await fetch('/api/user/semi-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: localData.name,
                    residentNumber: fullSsn
                }),
            });

            if (registerResponse.ok) {
                const registerData = await registerResponse.json();
                
                // 성공이거나, 이미 가입된 회원이면 로그인을 시도함
                if (registerData.result === 'SUCCESS' || registerData.result === 'FAILURE_EXISTING_RESIDENT_NUMBER' || registerData.result === 'FAILURE') {
                    // 2. 키오스크 로그인 API 호출하여 세션 생성
                    const queryParams = new URLSearchParams({
                        residentNumber: fullSsn
                    }).toString();

                    const loginResponse = await fetch(`/api/user/kiosk/login?${queryParams}`, {
                        method: 'POST',
                        headers: {}
                    });

                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        switch (loginData.result) {
                            case 'SUCCESS':
                                // 로그인 성공 시 비회원 정보 저장
                                setFormData(prev => ({
                                    ...prev,
                                    ssn: fullSsn,
                                    userName: localData.name,
                                }));

                                // 성공 모달 띄우기
                                if (registerData.result === 'SUCCESS') {
                                    setModalMessage('회원등록이 완료되었습니다.\n접수 화면으로 넘어갑니다.');
                                } else {
                                    setModalMessage('이미 가입된 고객정보가 있습니다.\n접수 화면으로 넘어갑니다.');
                                }
                                setIsModalOpen(true);
                                break;
                            case 'FAILURE_NOT_ALLOWED':
                                setModalMessage('로그인 처리에 실패했습니다.\n창구에 문의해주세요.');
                                setIsModalOpen(true);
                                break;
                            case 'FAILURE':
                            default:
                                setModalMessage('일치하는 고객 정보가 없습니다.\n다시 확인해주세요.');
                                setIsModalOpen(true);
                                break;
                        }
                    } else {
                        setModalMessage('로그인 서버 통신 오류가 발생했습니다.');
                        setIsModalOpen(true);
                    }
                } else {
                    setModalMessage('가입 처리에 실패했습니다.');
                    setIsModalOpen(true);
                }
            } else {
                setModalMessage('서버 오류가 발생했습니다.');
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('비회원 가입/로그인 에러:', error);
            setModalMessage('서버와 통신 중 오류가 발생했습니다.');
            setIsModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 모달 확인 버튼 핸들러
    const handleModalConfirm = () => {
        setIsModalOpen(false);
        // 에러 메시지인 경우에는 다음으로 넘어가지 않음
        if (modalMessage.includes('넘어갑니다')) {
            onNext();
        }
    };

    return (
        <div className={styles.loginArea}>
            <div className={styles.progressIndicator}>
                <div className={`${styles.step} ${styles.active}`}></div>
                <div className={styles.step}></div>
                <div className={styles.step}></div>
                <div className={styles.step}></div>
                <div className={styles.step}></div>
            </div>

            <div className={styles.loginHeader}>
                <h2 className={styles.loginTitle}>비회원 접수</h2>
                <p className={styles.loginSubtitle}>이름과 주민등록번호를 입력해주세요</p>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                    <label htmlFor="name" style={{marginTop: '2.5rem'}}>이름</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={localData.name}
                        onChange={handleChange}
                        placeholder="이름을 입력 해주세요"
                        className={styles.inputField}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>주민등록번호</label>
                    <div className={styles.ssnWrapper} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="text"
                            name="ssnFront"
                            value={localData.ssnFront}
                            onChange={handleChange}
                            placeholder="앞 6자리"
                            maxLength="6"
                            className={styles.inputField}
                            style={{ flex: 1, textAlign: 'center', letterSpacing: '2px' }}
                            ref={ssnFrontRef}
                        />
                        <span className={styles.separator} style={{ fontWeight: 'bold', color: '#666' }}>-</span>
                        <input
                            type="password"
                            name="ssnBack"
                            value={localData.ssnBack}
                            onChange={handleChange}
                            placeholder="뒷 7자리"
                            maxLength="7"
                            className={styles.inputField}
                            style={{ flex: 1, textAlign: 'center', letterSpacing: '4px' }}
                            ref={ssnBackRef}
                        />
                    </div>
                </div>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    style={{ marginTop: '40px' }}
                >
                    확인
                </button>

            </div>

            <button className={styles.prevButton} onClick={onPrev} disabled={isSubmitting}>
                ← 이전으로
            </button>

            {/* CustomModal 추가 */}
            <CustomModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="안내"
                onConfirm={handleModalConfirm}
                confirmText="확인"
            >
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2rem', color: '#333', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {modalMessage}
                </div>
            </CustomModal>
        </div>
    );
};

export default KioskNonMember;
