import React, { useState } from "react";
import styles from "./Accounts.module.css";

const Accounts = (  {onCancel,
                    onCreate}) => {
    // 활성화된 탭 및 라디오 버튼 상태 관리
    const [activeTab, setActiveTab] = useState("예금 계좌");
    const [customerType, setCustomerType] = useState("기존 고객님");

    const tabs = ["예금 계좌","적금 계좌"];

    return (
        <div className={styles.accountsContainer}>
            {/* 상단 탭 메뉴 */}
            <div className={styles.tabContainer}>
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* 입력 폼 영역 */}
            <div className={styles.formGrid}>
                {/* 1행: 이름, 주민등록번호, 계좌별칭 */}
                <div className={styles.inputGroup}>
                    <label>이름</label>
                    <input type="text" defaultValue="김갑수" className={styles.input} />
                    <div className={styles.radioGroup}>
                        <label>
                            <input
                                type="radio"
                                name="customerType"
                                checked={customerType === "신규 가입"}
                                onChange={() => setCustomerType("신규 가입")}
                            />
                            신규 가입
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="customerType"
                                checked={customerType === "기존 고객님"}
                                onChange={() => setCustomerType("기존 고객님")}
                            />
                            기존 고객님
                        </label>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>주민등록번호</label>
                    <input type="text" defaultValue="701012-1324567" className={styles.input} />
                </div>

                <div className={`${styles.inputGroup} ${styles.alignRight}`}>
                    <label>계좌 별칭</label>
                    <input type="text" defaultValue="갑수 통장" className={styles.input} />
                </div>

                {/* 2행: 통신사, 전화번호 */}
                <div className={styles.inputGroup}>
                    <label>통신사</label>
                    <select className={styles.select} defaultValue="SKT">
                        <option value="SKT">SKT</option>
                        <option value="KT">KT</option>
                        <option value="LGU+">LG U+</option>
                        <option value="알뜰폰">알뜰폰</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label>전화번호</label>
                    <input type="text" defaultValue="010-1234-5678" className={styles.input} />
                </div>

                {/* 빈 공간으로 3열 비우기 */}
                <div></div>

                {/* 3행: 상품 선택 및 금리 안내 (2칸 차지) */}
                <div className={`${styles.inputGroup} ${styles.colSpan2}`}>
                    <label>상품 선택</label>
                    <select className={styles.select}>
                        <option value=""></option>
                    </select>
                    <div className={styles.infoBox}>
                        금리 안내 (Applied Interest Rate)
                    </div>
                </div>

                {/* 빈 공간으로 3열 비우기 */}
                <div></div>

                {/* 4행: 계좌 번호, 계좌 비밀번호 */}
                <div className={styles.inputGroup}>
                    <label>계좌 번호</label>
                    <input type="text" className={styles.input} />
                </div>

                <div className={styles.inputGroup}>
                    <label>계좌 비밀번호</label>
                    <input type="password" defaultValue="123456" className={styles.input} />
                </div>
            </div>
            <div className={styles.accountBtnRow}>
                <button className={styles.btnCancel} onClick={onCancel}>
                    취소
                </button>

                <button className={styles.btnCreate} onClick={onCreate}>
                    계좌 개설
                </button>
            </div>
        </div>
    );
};

export default Accounts;