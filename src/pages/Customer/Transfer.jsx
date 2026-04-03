import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import styles from './Transfer.module.css';
import checkIcon from '../../images/Common/Check.png';

const Transfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();

  const sourceAccount = location.state?.account || { balance: 1000000 };

  const [step, setStep] = useState(1); // 1: 이체 정보 입력, 2: 이체 완료
  
  const [transferData, setTransferData] = useState({
    bank: '',
    accountNumber: '',
    amount: ''
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, '');
    setTransferData(prev => ({ ...prev, [name]: name === 'bank' ? value : onlyNumber }));
  };

  const isInsufficientBalance = Number(transferData.amount) > sourceAccount.balance;

  const isFormValid = transferData.bank && transferData.accountNumber && transferData.amount && !isInsufficientBalance; // 잔액 부족이 아닐 때만 버튼 활성화

  const handleKeyClick = (val) => {
    if (pinInput.length < 6) setPinInput(prev => prev + val);
  };
  const handleDelete = () => setPinInput(prev => prev.slice(0, -1));

  const handlePinConfirm = async () => {
    if (pinInput.length !== 6) return;

    try {
      const pinResponse = await fetch(`/api/pin/confirm?pin=${pinInput}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const pinData = await pinResponse.json();

      if (pinData.result === 'SUCCESS') {
        console.log("핀 번호 일치! 이체 정보 전송:", transferData);
        
        setIsPinModalOpen(false);
        setStep(2);
      } else {
        openModal({ message: '핀 번호가 일치하지 않습니다.\n다시 입력해주세요.' });
        setPinInput('');
      }
    } catch (error) {
      console.error('API 오류:', error);
      openModal({ message: '서버와 연결할 수 없습니다.' });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mypageLayout}>
        <main className={styles.mainContent}>
          
          {step === 1 && (
            <>
              <h2 className={styles.sectionTitle}>이체 서비스</h2>
              
              <div className={styles.balanceBox}>
                <div className={styles.balanceLabel}>
                    출금 계좌: {sourceAccount.accoutAlias || '기본 입출금'} [{sourceAccount.accountNumber}]
                </div>
                <div className={styles.balanceLabel}>출금 가능 금액</div>
                <div className={styles.balanceAmount}>
                  {sourceAccount.balance.toLocaleString()} 원
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputRow}>
                  <select 
                    name="bank" 
                    className={styles.selectBox} 
                    value={transferData.bank}
                    onChange={handleInputChange}
                  >
                    <option value="">은행 선택</option>
                    <option value="BANKSCOPE">뱅크스코프</option>
                    <option value="KB">국민은행</option>
                    <option value="SHINHAN">신한은행</option>
                    <option value="HANA">하나은행</option>
                  </select>
                  
                  <input 
                    type="text" 
                    name="accountNumber"
                    className={styles.inputBox} 
                    placeholder="계좌번호 입력 ('-' 제외)"
                    value={transferData.accountNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <input 
                  type="text" 
                  name="amount"
                  className={styles.inputBox} 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="보낼 금액 입력"
                  value={transferData.amount ? Number(transferData.amount).toLocaleString() : ''}
                  onChange={handleInputChange}
                />
                
                {isInsufficientBalance && (
                  <div style={{ color: '#E63946', fontSize: '14px', marginTop: '-10px', marginLeft: '5px', fontWeight: '600' }}>
                    출금 가능 금액을 초과했습니다.
                  </div>
                )}
              </div>

              <button 
                className={`${styles.submitBtn} ${!isFormValid ? styles.disabledBtn : ''}`}
                disabled={!isFormValid}
                onClick={() => setIsPinModalOpen(true)}
              >
                이체하기
              </button>
            </>
          )}

          {step === 2 && (
            <div className={styles.completeBox}>
              <img src={checkIcon} alt="이체 완료" className={styles.checkIcon} />
              <h3 className={styles.completeTitle}>이체 완료!</h3>
              <p className={styles.completeDesc}>
                요청하신 계좌로 {Number(transferData.amount).toLocaleString()}원이<br/>
                성공적으로 이체되었습니다.
              </p>
              <button className={styles.submitBtn} onClick={() => navigate('/Main')}>
                홈 화면으로 이동
              </button>
            </div>
          )}

        </main>
      </div>

      {isPinModalOpen && (
        <div className={styles.pinModalBackdrop} onClick={() => setIsPinModalOpen(false)}>
          <div className={styles.pinModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>핀 번호를 입력해주세요</h3>
            
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
                    <button key={idx} className={styles.keyBtn} onClick={handleDelete}>지우기</button>
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
              className={`${styles.submitBtn} ${pinInput.length !== 6 ? styles.disabledBtn : ''}`} 
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

export default Transfer;