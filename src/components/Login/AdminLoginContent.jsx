import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminLoginContent.module.css';
import { useAuth } from '../../context/AuthContext';
import emailIcon from '../../images/AdminLogin/Vector.png';
import passwordIcon from '../../images/AdminLogin/pw.png';

const AdminLoginContent = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const queryParams = new URLSearchParams({
                email: formData.email,
                password: formData.password
            }).toString();

            const response = await fetch(`/api/user/login-admin?${queryParams}`, {
                method: 'POST',
                headers: {
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    await login(); 
                    alert('관리자 로그인 성공!');
                    navigate('/AdminMain'); // 관리자 메인 페이지로 이동
                } else {
                    alert('로그인 실패: 정보를 확인하세요.');
                }
            } else {
                alert('서버 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <h2>통합운영관리시스템</h2>
            <h1>임직원로그인</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                        <img src={emailIcon} alt="email icon" className={styles.inputIcon} />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="EMAIL"
                        />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                        <img src={passwordIcon} alt="password icon" className={styles.inputIcon} />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="PASSWORD"
                            required
                        />
                    </div>
                </div>
                
                <button type="submit" className={styles.submitButton}>로그인</button>
            </form>
            <div className={styles.registerLink}>
                <Link to="/Login">일반 로그인으로 돌아가기</Link>
            </div>
            <div className={styles.copyright}>
                ⓒ 2026. BANK SCOPE all rights reserved. v 1.0
            </div>
        </div>
    );
};

export default AdminLoginContent;
