import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CheckCard.module.css';
import checkIcon from '../../images/Common/Check.png';

const CheckCard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [step1Phase, setStep1Phase] = useState('account'); 

  // 약관 동의 상태 관리
  const [agreements, setAgreements] = useState({
    term1: false, // 개인회원 약관 (필수)
    term2: false, // 개인정보 수집 (필수)
    term3: false, // 마케팅 동의 (선택)
  });
  const [activeAgreementModal, setActiveAgreementModal] = useState(null); // 어떤 약관 모달을 띄울지

  // 모든 필수 약관이 동의되었는지 확인
  const isAllRequiredAgreed = agreements.term1 && agreements.term2;

  const handleAgreeClick = () => {
    setAgreements(prev => ({ ...prev, [activeAgreementModal]: true }));
    setActiveAgreementModal(null);
  };

  const [selectedDesign, setSelectedDesign] = useState(1);
  const [cardPwd, setCardPwd] = useState('');
  const [cardPwdConfirm, setCardPwdConfirm] = useState('');
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  const handleKeyClick = (val) => {
    if (pinInput.length < 6) {
      setPinInput(prev => prev + val);
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const handlePinConfirm = () => {
    if (pinInput.length !== 6) return;
    // user_pin api 연결
    setIsPinModalOpen(false);
    setStep(4);
  };

  const steps = [
    { id: 1, title: '계좌 선택/동의' },
    { id: 2, title: '디자인 선택' },
    { id: 3, title: '비밀번호 설정' },
    { id: 4, title: '발급 완료' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.stepperLayout}>
        
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>BANKSCOPE<br />카드 개설</h2>
          <div className={styles.stepList}>
            {steps.map((s) => (
              <div key={s.id} className={`${styles.stepItem} ${step >= s.id ? styles.active : ''}`}>
                <div className={styles.stepCircle}>{s.id}</div>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.mainContent}>
          
          {step === 1 && step1Phase === 'account' && (
            <div className={styles.stepBox}>
              <h3 className={styles.stepTitle}>카드를 연결할 계좌를 선택해주세요.</h3>
              <div className={styles.accountCard}>
                <div className={styles.accountInfo}>
                  <h4>ㅇㅇ예금(입출금) <span className={styles.mainBadge}>주계좌</span></h4>
                  <p>000-00000000-0</p>
                </div>
                <div className={styles.accountRight}>
                  <span>1,000,000 원</span>
                  <button className={styles.selectBtn} onClick={() => setStep1Phase('agreement')}>선택</button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && step1Phase === 'agreement' && (
            <div className={styles.stepBox}>
              <h3 className={styles.stepTitle}>가입 약관을 확인해 주세요</h3>
              
              <div className={`${styles.agreementBox} ${agreements.term1 ? styles.agreed : ''}`} onClick={() => setActiveAgreementModal('term1')}>
                <span>[필수] 체크카드 개인회원 약관 동의</span>
                {agreements.term1 && <span className={styles.agreedBadge}>동의 완료 ✔</span>}
              </div>
              
              <div className={`${styles.agreementBox} ${agreements.term2 ? styles.agreed : ''}`} onClick={() => setActiveAgreementModal('term2')}>
                <span>[필수] 개인정보 수집 및 이용 동의</span>
                {agreements.term2 && <span className={styles.agreedBadge}>동의 완료 ✔</span>}
              </div>
              
              <div className={`${styles.agreementBox} ${agreements.term3 ? styles.agreed : ''}`} onClick={() => setActiveAgreementModal('term3')}>
                <span>[선택] 마케팅 정보 수신 동의</span>
                {agreements.term3 && <span className={styles.agreedBadge}>동의 완료 ✔</span>}
              </div>
              
              <button 
                className={`${styles.nextBtn} ${!isAllRequiredAgreed ? styles.disabledBtn : ''}`} 
                disabled={!isAllRequiredAgreed}
                onClick={() => setStep(2)}
              >
                다음 단계로
              </button>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepBox}>
              <h3 className={styles.stepTitle}>디자인을 선택해주세요</h3>
              <div className={styles.designGrid}>
                <div className={`${styles.designItem} ${selectedDesign === 1 ? styles.selected : ''}`} onClick={() => setSelectedDesign(1)}>
                  <div className={styles.mockCardImage}></div>
                </div>
                <div className={`${styles.designItem} ${selectedDesign === 2 ? styles.selected : ''}`} onClick={() => setSelectedDesign(2)}>
                  <div className={`${styles.mockCardImage} ${styles.blue}`}></div>
                </div>
              </div>
              <button className={styles.nextBtn} onClick={() => setStep(3)}>선택 완료</button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepBox}>
              <h3 className={styles.stepTitle}>카드 비밀번호 설정</h3>
              <input 
                type="password" 
                className={styles.pwdInput}
                placeholder="사용하실 카드 비밀번호 4자리 입력"
                maxLength={4}
                value={cardPwd}
                onChange={(e) => setCardPwd(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <input 
                type="password" 
                className={styles.pwdInput}
                placeholder="카드 비밀번호 재입력"
                maxLength={4}
                value={cardPwdConfirm}
                onChange={(e) => setCardPwdConfirm(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <button 
                className={`${styles.nextBtn} ${cardPwd.length !== 4 || cardPwd !== cardPwdConfirm ? styles.disabledBtn : ''}`}
                disabled={cardPwd.length !== 4 || cardPwd !== cardPwdConfirm}
                onClick={() => setIsPinModalOpen(true)}
              >
                다음 단계로
              </button>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepBox}>
              <div className={styles.completeBox}>
                <img src={checkIcon} alt="완료 체크" className={styles.checkIcon} />
                <h3 className={styles.completeTitle}>카드 개설 완료!</h3>
                <p className={styles.completeDesc}>영업점에 방문해 실물카드를<br/>발급 받아주세요</p>
              </div>
              <button className={styles.nextBtn} onClick={() => navigate('/Main')}>홈 화면으로 이동</button>
            </div>
          )}

        </main>
      </div>

      {activeAgreementModal && (
        <div className={styles.pinModalBackdrop} onClick={() => setActiveAgreementModal(null)}>
          <div className={styles.pinModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>약관 상세 내용</h3>
            <div className={styles.termsContentBox}>
              제 1장 총칙<br/><br/>
              본 약관은 고객님의 개인정보 및 서비스 이용에 관한 권리와 의무를 규정합니다. 
              회사는 고객의 정보를 안전하게 보호하며... (중략) ...<br/><br/>
              동의 버튼을 누르시면 해당 약관에 동의한 것으로 간주됩니다.
            </div>
            <button className={styles.nextBtn} onClick={handleAgreeClick}>
              위 약관에 동의합니다
            </button>
          </div>
        </div>
      )}

      {isPinModalOpen && (
        <div className={styles.pinModalBackdrop} onClick={() => setIsPinModalOpen(false)}>
          <div className={styles.pinModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>보안 핀(PIN) 번호를 입력해주세요</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>본인 확인을 위해 6자리 핀 번호를 입력합니다.</p>
            
            <div className={styles.pinDisplay}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`${styles.pinDot} ${i < pinInput.length ? styles.pinDotFilled : ''}`} />
              ))}
            </div>

            <div className={styles.keypad}>
              {keypadLayout.map((key, idx) => {
                if (key === '') return <div key={idx} className={styles.emptyKey} />;
                if (key === 'del') {
                  return (
                    <button key={idx} className={styles.keyBtn} onClick={handleDelete}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                        <line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line>
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

            <button 
              className={`${styles.nextBtn} ${pinInput.length !== 6 ? styles.disabledBtn : ''}`} 
              disabled={pinInput.length !== 6}
              onClick={handlePinConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckCard;