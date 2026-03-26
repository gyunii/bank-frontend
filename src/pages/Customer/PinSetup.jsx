import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PinSetup.module.css';

const PinSetup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    const [name, setName] = useState('');
    const [rrnFirst, setRrnFirst] = useState('');
    const [rrnSecond, setRrnSecond] = useState('');
    const [phone, setPhone] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');

    const isValidPhone = /^01[016789]\d{8}$/.test(phone);

    const isFormFilled = name.trim() !== '' && rrnFirst.length === 6 && rrnSecond.length === 7 && isValidPhone;

    // 1단계 로직
    const handleSendCode = () => setIsCodeSent(true);
    const handleVerifyCode = () => {
        if (verifyCode === '1234') setIsVerified(true);
    };

    // 단계 전환 로직
    const handleNextStep = () => {
        if (step === 1 && isVerified) setStep(2);
        if (step === 4) navigate('/My'); 
    };

    // 2, 3단계: 키패드 입력 로직
    const handleKeyClick = (val) => {
        if (step === 2 && pin.length < 6) {
            setPin(prev => prev + val);
        } else if (step === 3 && confirmPin.length < 6) {
            setConfirmPin(prev => prev + val);
            setPinError('');
        }
    };

    const handleDelete = () => {
        if (step === 2) setPin(prev => prev.slice(0, -1));
        else if (step === 3) setConfirmPin(prev => prev.slice(0, -1));
    };

    // 핀 번호 6자리가 다 입력되면 자동으로 넘어감
    useEffect(() => {
        if (step === 2 && pin.length === 6) {
            setTimeout(() => setStep(3), 300);
        }
    }, [pin, step]);

    useEffect(() => {
        if (step === 3 && confirmPin.length === 6) {
            if (pin === confirmPin) {
                setTimeout(() => setStep(4), 300);
            } else {
                setPinError('핀 번호가 일치하지 않습니다. 다시 입력해주세요.');
                setTimeout(() => setConfirmPin(''), 800);
            }
        }
    }, [confirmPin, pin, step]);

    // 보안 키패드 배열
    const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    // 핀 번호 동그라미 렌더링 함수
    const renderPinDots = (currentLength) => {
        return (
            <div className={styles.pinDisplay}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`${styles.pinDot} ${i < currentLength ? styles.pinDotFilled : ''}`} />
                ))}
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentBox}>
                
                <div className={styles.sidebar}>
                    <h2 className={styles.logoTitle}>BANKSCOPE</h2>
                    <h3 className={styles.pageTitle}>핀 번호 발급</h3>
                    
                    <ul className={styles.stepList}>
                        {[
                            { id: 1, text: '본인 확인' },
                            { id: 2, text: '핀 번호 설정' },
                            { id: 3, text: '핀 번호 확인' },
                            { id: 4, text: '발급 완료' }
                        ].map((s) => (
                            <li key={s.id} className={step >= s.id ? styles.activeStep : styles.inactiveStep}>
                                <div className={styles.stepCircle}>{s.id}</div>
                                <span>{s.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.mainContent}>
                    
                    {step === 1 && (
                        <div className={styles.stepContainer}>
                            <h3 className={styles.sectionTitle}>본인 인증 절차가 필요합니다.</h3>
                            <p className={styles.sectionSubtitle}>SMS 인증 구현</p>
                            
                            <div className={styles.formGroup}>
                                <label>이름</label>
                                <input type="text" placeholder="이름 입력" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>주민등록번호</label>
                                <div className={styles.rrnWrapper}>
                                    <input type="text" maxLength={6} placeholder="앞 6자리" className={styles.input} value={rrnFirst} onChange={(e) => setRrnFirst(e.target.value.replace(/[^0-9]/g, ''))} />
                                    <span>-</span>
                                    <input type="password" maxLength={7} placeholder="뒤 7자리" className={styles.input} value={rrnSecond} onChange={(e) => setRrnSecond(e.target.value.replace(/[^0-9]/g, ''))} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>휴대폰 번호</label>
                                <div className={styles.phoneWrapper}>
                                    <select className={styles.select}>
                                        <option>SKT</option><option>KT</option><option>LG U+</option><option>알뜰폰</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="- 없이 010부터 입력" 
                                        className={styles.input} 
                                        value={phone} 
                                        maxLength={11}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                                    />
                                    <button className={`${styles.actionBtn} ${!isFormFilled ? styles.disabledActionBtn : ''}`} onClick={handleSendCode} disabled={!isFormFilled || isVerified}>
                                        {isCodeSent ? '재전송' : '인증번호 전송'}
                                    </button>
                                </div>

                                {phone.length > 0 && !isValidPhone && (
                                    <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>올바른 휴대폰 번호 형식이 아닙니다.</p>
                                )}
                            </div>

                            {isCodeSent && (
                                <div className={styles.formGroup}>
                                    <label>인증번호 <span style={{fontSize: '12px', color: '#888'}}>(임시: 1234)</span></label>
                                    <div className={styles.verifyWrapper}>
                                        <input type="text" placeholder="인증번호 입력" className={styles.input} value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))} disabled={isVerified} />
                                        <button className={`${styles.actionBtn} ${isVerified ? styles.verifiedBtn : ''}`} onClick={handleVerifyCode} disabled={isVerified || verifyCode.length === 0}>
                                            {isVerified ? '인증완료' : '인증 확인'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button className={isVerified ? styles.nextBtnActive : styles.nextBtnDisabled} onClick={handleNextStep} disabled={!isVerified}>
                                다음 단계로
                            </button>
                        </div>
                    )}

                    {/* 2단계 & 3단계: 핀 번호 입력 및 확인 */}
                    {(step === 2 || step === 3) && (
                        <div className={styles.stepContainer}>
                            <h3 className={styles.sectionTitle}>
                                {step === 2 ? '사용하실 핀 번호를 입력해주세요.' : '핀 번호를 한 번 더 입력해주세요.'}
                            </h3>
                            <p className={styles.sectionSubtitle}>
                                {step === 2 ? '안전한 거래를 위한 6자리 숫자' : (pinError || '비밀번호 확인')}
                            </p>
                            {pinError && <p className={styles.errorMessage}>{pinError}</p>}

                            {renderPinDots(step === 2 ? pin.length : confirmPin.length)}

                            <div className={styles.keypad}>
                                {keypadLayout.map((key, idx) => {
                                    if (key === '') return <div key={idx} className={styles.emptyKey} />;
                                    if (key === 'del') {
                                        return (
                                            <button key={idx} className={styles.keyBtn} onClick={handleDelete}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                                                    <line x1="18" y1="9" x2="12" y2="15"></line>
                                                    <line x1="12" y1="9" x2="18" y2="15"></line>
                                                </svg>
                                            </button>
                                        );
                                    }
                                    return (
                                        <button key={idx} className={styles.keyBtn} onClick={() => handleKeyClick(key)}>
                                            {key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4단계: 완료 화면 */}
                    {step === 4 && (
                        <div className={styles.completeContainer}>
                            <div className={styles.successIcon}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4A9C82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3 className={styles.sectionTitle}>핀 번호 설정 완료</h3>
                            <p className={styles.sectionSubtitle} style={{marginBottom: '50px'}}>
                                새로운 핀 번호가 성공적으로 등록되었습니다.<br/>
                                이제 안전하게 서비스를 이용해보세요.
                            </p>
                            <button className={styles.nextBtnActive} onClick={handleNextStep}>
                                마이페이지로 돌아가기
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PinSetup;