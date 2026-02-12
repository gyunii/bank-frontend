import React from "react";
import { useNavigate } from 'react-router-dom';
import HomeImage from '../images/Home/Home.png';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.homeContainer}>
            <img src={HomeImage} alt="Home Banner" className={styles.bannerImage} />
            <button className={styles.startButton} onClick={() => navigate('/Option')}>
                시작하기
            </button>
        </div>
    )
}

export default Home
