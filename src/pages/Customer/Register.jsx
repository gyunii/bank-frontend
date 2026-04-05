import React, { useState, useEffect } from 'react';
import styles from './Register.module.css';
import { Link, useNavigate } from 'react-router-dom';
import LoginBackgroundImage from '../../images/Login/background.png';
import LeftContentImage from '../../images/Login/frame.png';
import { useModal } from '../../context/ModalContext';
import Loading from '../../components/common/Loading';


// alert showModal로 바꾸고
// 인증번호 발송시 로딩함수걸어주기


const Register = () => {
    const { openModal } = useModal();
    const showAlert = (message, callback = null) => {
        openModal({
            message: message,
            onConfirm: callback
        });
    };

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        userType: 'customer',
        name: '',
        email: '',
        password: '',
        phone: '',
        residentNumber: '',
        identificationNumber: ''
    });
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const navigate = useNavigate();

    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && isEmailSent && !isEmailVerified) {
            showAlert('인증 시간이 만료되었습니다. 이메일을 다시 입력하고 인증을 진행해주세요.');
            setIsEmailSent(false);
            setEmailVerificationCode('');
            setFormData(prev => ({ ...prev, email: '' }));
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer, isEmailSent, isEmailVerified]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePartChange = (e, field, part, maxLength) => {
        const { value } = e.target;

        setFormData(prev => {
            // 해당 필드(phone, residentNumber, identificationNumber)의 현재 값을 가져옴
            // 만약 값이 없다면 빈 문자열로 처리
            const currentFieldValue = prev[field] || '';
            const parts = currentFieldValue.split('-');

            // 배열 길이를 파트 수에 맞게 조절
            while (parts.length <= part) {
                parts.push('');
            }

            parts[part] = value;
            const newValue = parts.join('-');

            return {
                ...prev,
                [field]: newValue
            };
        });

        if (value.length === maxLength && e.target.nextElementSibling?.nextElementSibling) {
            e.target.nextElementSibling.nextElementSibling.focus();
        }
    };
    const handleSendEmailCode = async () => {
        if (!formData.email) {
            showAlert('이메일을 입력해주세요.');
            return;
        }
        
        setIsLoading(true); // 로딩 시작
        
        try {
            const response = await fetch(`/api/user/email-send?email=${formData.email}&type=register`, { method: 'POST' });
            const data = await response.json();

            if (data.result === 'SUCCESS') {
                showAlert('인증코드가 발송되었습니다.');
                setIsEmailSent(true);
                setTimer(180); // 3 minutes
            } else if (data.result === 'FAILURE_DUPLICATE_EMAIL') {
                showAlert('이미 가입된 이메일입니다.');
            } else {
                showAlert('인증코드 발송에 실패했습니다.');
            }
        } catch (error)
         {
            console.error('Error sending email code:', error);
            showAlert('오류가 발생했습니다.');
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    const handleVerifyEmailCode = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/email-code-verify', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: emailVerificationCode }),
            });
            const data = await response.json();

            if (data.result === 'SUCCESS') {
                showAlert('이메일 인증에 성공했습니다.');
                setIsEmailVerified(true);
                setTimer(0);
            } else if (data.result === 'FAILURE_EXPIRED') {
                showAlert('인증코드가 만료되었습니다. 다시 시도해주세요.');
            } else {
                showAlert('인증코드가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('Error verifying email code:', error);
            showAlert('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isStep2Valid()) {
            showAlert('모든 필드를 채워야 합니다.');
            return;
        }

        const finalData = {
            ...formData,
            phone: formData.phone.replace(/-/g, ''),
            residentNumber: formData.residentNumber.replace(/-/g, ''),
            identificationNumber: formData.userType === 'corporate' ? formData.identificationNumber.replace(/-/g, '') : undefined,
        };
        delete finalData.passwordConfirm;

        setIsLoading(true); // 회원가입 진행 중에도 로딩 표시
        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    showAlert('회원가입 성공!', () => navigate('/Login'));
                } else {
                    showAlert('회원가입 실패: ' + (data.message || ''));
                }
            } else {
                showAlert('회원가입 실패');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const isStep1Valid = () => formData.name && formData.email && formData.password && passwordConfirm && isEmailVerified;

    const nextStep = () => {
        if (!isStep1Valid()) {
            showAlert('모든 필드를 채우고 이메일 인증을 완료해야 합니다.');
            return;
        }
        if (formData.password !== passwordConfirm) {
            showAlert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setStep(step + 1);
    };
    const prevStep = () => setStep(step - 1);

    const isStep2Valid = () => {
        const phoneComplete = formData.phone.replace(/-/g, '').length >= 10;
        const residentNumberComplete = formData.residentNumber.replace(/-/g, '').length === 13;
        if (formData.userType === 'corporate') {
            const businessNumberComplete = formData.identificationNumber.replace(/-/g, '').length === 10;
            return phoneComplete && residentNumberComplete && businessNumberComplete;
        }
        return phoneComplete && residentNumberComplete;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const renderStep1 = () => (
        <>
            <div className={`${styles.inputGroup} ${styles.typeSelectionGroup}`}>
                <label className={styles.groupLabel}>회원 유형</label>
                <div className={styles.segmentedControl}>
                    <div className={styles.segmentOption}>
                        <input type="radio" id="userTypeCustomer" name="userType" value="customer" checked={formData.userType === 'customer'} onChange={handleChange} />
                        <label htmlFor="userTypeCustomer">일반회원</label>
                    </div>
                    <div className={styles.segmentOption}>
                        <input type="radio" id="userTypeCorporate" name="userType" value="corporate" checked={formData.userType === 'corporate'} onChange={handleChange} />
                        <label htmlFor="userTypeCorporate">기업회원</label>
                    </div>
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="name">이름</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="이름을 입력해주세요" required />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="email">이메일</label>
                <div className={styles.emailContainer}>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력해주세요" required disabled={isEmailSent} />
                    <button type="button" onClick={handleSendEmailCode} className={styles.emailButton} disabled={isEmailVerified}>
                        {isEmailVerified ? '인증완료' : '인증번호 발송'}
                    </button>
                </div>
            </div>
            {isEmailSent && !isEmailVerified && (
                <div className={styles.inputGroup}>
                    <label htmlFor="emailVerificationCode">인증코드</label>
                    <div className={styles.emailContainer}>
                        <input type="text" id="emailVerificationCode" value={emailVerificationCode} onChange={(e) => setEmailVerificationCode(e.target.value)} placeholder="인증코드를 입력해주세요" />
                        {timer > 0 && <span className={styles.timer}>{formatTime(timer)}</span>}
                        <button type="button" onClick={handleVerifyEmailCode} className={styles.emailButton}>인증하기</button>
                    </div>
                </div>
            )}
            <div className={styles.inputGroup}>
                <label htmlFor="password">비밀번호</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력해주세요" required />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="passwordConfirm">비밀번호 확인</label>
                <input type="password" id="passwordConfirm" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호를 다시 입력해주세요" required />
            </div>
            <button type="button" onClick={nextStep} className={styles.submitButton}>다음</button>
        </>
    );

    const renderStep2 = () => (
        <>
            <div className={styles.inputGroup}>
                <label>전화번호</label>
                <div className={styles.splitInput}>
                    <input placeholder={"3자리"} type="text" onChange={(e) => handlePartChange(e, 'phone', 0, 3)} maxLength="3" />
                    <span>-</span>
                    <input placeholder={"4자리"} type="text" onChange={(e) => handlePartChange(e, 'phone', 1, 4)} maxLength="4" />
                    <span>-</span>
                    <input placeholder={"4자리"} type="text" onChange={(e) => handlePartChange(e, 'phone', 2, 4)} maxLength="4" />
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label>주민등록번호</label>
                <div className={styles.splitInput}>
                    <input placeholder={"6자리"} type="text" onChange={(e) => handlePartChange(e, 'residentNumber', 0, 6)} maxLength="6" />
                    <span>-</span>
                    <input placeholder={"7자리"} type="password" onChange={(e) => handlePartChange(e, 'residentNumber', 1, 7)} maxLength="7" />
                </div>
            </div>
            {formData.userType === 'corporate' && (
                <div className={styles.inputGroup}>
                    <label>사업자 등록 번호</label>
                    <input type="text" style={{ display: 'none' }} readOnly />
                    <div className={styles.splitInput}>
                        <input type="text" placeholder={"3자리"} autoComplete="off" onChange={(e) => handlePartChange(e, 'identificationNumber', 0, 3)} maxLength="3" />
                        <span>-</span>
                        <input type="text" placeholder={"2자리"} autoComplete="off" onChange={(e) => handlePartChange(e, 'identificationNumber', 1, 2)} maxLength="2" />
                        <span>-</span>
                        <input type="text" placeholder={"5자리"} autoComplete="off" onChange={(e) => handlePartChange(e, 'identificationNumber', 2, 5)} maxLength="5" />
                    </div>
                </div>
            )}
            <div className={styles.stepButtons}>
                <button type="button" onClick={prevStep} className={styles.prevButton}>이전</button>
                <button type="submit" className={styles.registerButton}>회원가입</button>
            </div>
        </>
    );

    return (
        <div className={styles.pageContainer}>
            {isLoading && <Loading />} {/* 로딩 컴포넌트 추가 */}
            <div className={styles.backgroundWrapper}>
                <img src={LoginBackgroundImage} alt="Background" />
            </div>
            <div className={styles.registerCard}>
                <div className={styles.leftPane}>
                    <div className={styles.header}>
                        <h1>BankScope</h1>
                    </div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {step === 1 ? renderStep1() : renderStep2()}
                    </form>
                    <div className={styles.loginLink}>
                        <span>이미 회원이신가요? </span>
                        <Link to="/login">로그인하기</Link>
                    </div>
                </div>
                <div className={styles.rightPane}>
                    <img src={LeftContentImage} alt="Visual" />
                </div>
            </div>
        </div>
    );
};

export default Register;
