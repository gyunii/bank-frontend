import React, { useState } from "react";
import styles from "./TaskSelect.module.css";
import accountIcon from '../../images/Banker/account-create.png';
import withdrawIcon from '../../images/Banker/GetCash.png';
import depositIcon from '../../images/Banker/Deposit.png';
import cardIcon from '../../images/Banker/card.png'
import MoneyFly from '../../images/Banker/transfer.png';
import loansIcon from '../../images/Home/Loans.png';
import corporationIcon from '../../images/Home/Corporation.png';
import LockIcon from '../../images/Home/Lock.png';
import WarningIcon from '../../images/Home/Warning.png';
import Transfer from '../../images/Home/Transfer.png';
import PiggyBank from '../../images/Home/PiggyBank.png';


const TaskSelect = ({ onSelectTask }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(1);

    // 이미지 찾아서 싹다 바꿔놓기
    const allTasks = [
        {
            id: 1,
            title: "계좌 개설",
            subTitle: "Open an Account",
            icon: accountIcon
        },
        { id: 2, title: "출금", subTitle: "Withdraw", icon: withdrawIcon },
        { id: 3, title: "입금", subTitle: "Deposit", icon: depositIcon },
        { id: 4, title: "이체", subTitle: "Check Card Status", icon: Transfer},
        { id: 5, title: "카드수령", subTitle: "Repay Loan", icon: cardIcon },
        { id: 6, title: "체크카드발급", subTitle: "Apply for Product", icon: cardIcon },
        // 2~4페이지 가상 데이터
        { id: 7, title: "통장비밀번호 변경", subTitle: "Pay Bills", icon: accountIcon},
        { id: 8, title: "예금", subTitle: "Deposit Account", icon: PiggyBank },
        { id: 9, title: "적금", subTitle: "Exchange Money", icon: PiggyBank },
        { id: 10, title: "신용카드 발급", subTitle: "Issue Documents", icon: cardIcon },
        { id: 11, title: "대출 상환", subTitle: "Join Fund", icon: loansIcon },
        { id: 12, title: "금융상품가입", subTitle: "Register OTP", icon: MoneyFly },
        { id: 13, title: "기업대출", subTitle: "Pay Tax", icon: loansIcon },
        { id: 14, title: "법인계좌 개설", subTitle: "Insurance Consult", icon: corporationIcon },
        { id: 15, title: "부도관리", subTitle: "Change Limit", icon: WarningIcon },
        { id: 16, title: "연체관리", subTitle: "Join Pension", icon: WarningIcon }
    ];

    const itemsPerPage = 6;
    const totalPages = Math.ceil(allTasks.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTasks = allTasks.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleCardClick = (task) => {
        setSelectedId(task.id);
        if (onSelectTask) {
            onSelectTask(task.title);
        }
    };

    return (
        <div className={styles.container}>
            {/* 상단 안내 바 (텍스트 변경) */}
            <header className={styles.header}>
                <h2 className={styles.welcomeText}>김갑수 고객님의 업무를 선택해주세요</h2>
            </header>

            {/* 검색 및 태그 영역 (디자인 수정: 우측 정렬) */}
            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="계좌 개설"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.tags}>
                    <span>#공과금</span>
                    <span>#대출</span>
                    <span>#서류 발급</span>
                </div>
            </div>

            {/* 업무 그리드 영역 (디자인 수정: 2컬럼, 아이콘/텍스트) */}
            <div className={styles.taskGrid}>
                {currentTasks.map((task) => (
                    <div
                        key={task.id}
                        className={`${styles.taskCard} ${selectedId === task.id ? styles.activeCard : ""}`}
                        onClick={() => handleCardClick(task)}
                    >
                        <div className={styles.iconBox}>
                            {task.icon.includes('/') || task.icon.includes('.') ? (
                                <img src={task.icon} alt={task.title} className={styles.taskIconImg} />
                            ) : (
                                <span>{task.icon}</span>
                            )}
                        </div>
                        <div className={styles.textBox}>
                            <span className={styles.taskTitle}>{task.title}</span>
                            <p className={styles.taskSubTitle}>{task.subTitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 하단 페이지네이션 (디자인 및 기능 수정: 실제 작동) */}
            <footer className={styles.pagination}>
                <button
                    className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabledBtn : ""}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.activePageBtn : ""}`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
                <span className={styles.dots}>...</span>
                <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(15)} // 예시: 최종 페이지로 이동
                >
                    15
                </button>
                <button
                    className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabledBtn : ""}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </footer>
        </div>
    );
};

export default TaskSelect;