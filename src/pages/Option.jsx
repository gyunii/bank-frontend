import React from "react";
import { useNavigate } from 'react-router-dom';
import styles from './Option.module.css';
import first from "../images/Opt/opt1.png";
import second from "../images/Opt/opt2.png";
import third from "../images/Opt/opt3.png";

const Option = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>큰 카테고리 선택</h2>
            <div className={styles.content}>
                <div className={styles.box} onClick={() => navigate('/fast-task')}>
                    <img src={first} alt="빠른 업무" className={styles.bannerImage} />
                    <span className={styles.text}>빠른 업무</span>
                    <span className={styles.sub_text}>입출금, 공과금, 변경</span>
                </div>
                <div className={styles.box} onClick={() => navigate('/consult-task')}>
                    <img src={second} alt="상담 업무" className={styles.bannerImage} />
                    <span className={styles.text}>상담 업무</span>
                    <span className={styles.sub_text}>대출, 예적금, 자산관리</span>
                </div>
                <div className={styles.box} onClick={() => navigate('/special-task')}>
                    <img src={third} alt="기업 특수" className={styles.bannerImage} />
                    <span className={styles.text}>기업 특수</span>
                    <span className={styles.sub_text}>사업자 외환 관리</span>
                </div>
            </div>
        </div>
    )
}

export default Option;
