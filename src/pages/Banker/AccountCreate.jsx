import React from "react";
import styles from "./BankerWorkSpace.module.css";

const AccountCreate = ({
  accountType,
  setAccountType,
  accountAlias,
  setAccountAlias,
  accountPassword,
  setAccountPassword,
  confirmPassword,
  setConfirmPassword,
  onCancel,
  onCreate
}) => {
  return (
    <div className={styles.accountForm}>
      <h4>계좌 개설 정보 입력</h4>

      <div className={styles.formGroup}>
        <label>계좌 종류</label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="">선택</option>
          <option value="입출금">입출금</option>
          <option value="적금">적금</option>
          <option value="예금">예금</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>별칭</label>
        <input
          value={accountAlias}
          onChange={(e) => setAccountAlias(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>비밀번호</label>
        <input
          type="password"
          value={accountPassword}
          onChange={(e) => setAccountPassword(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className={styles.accountBtnRow}>
        <button className={styles.btnCancel} onClick={onCancel}>
          취소
        </button>

        <button className={styles.btnCreate} onClick={onCreate}>
          계좌 생성
        </button>
      </div>
    </div>
  );
};

export default AccountCreate;