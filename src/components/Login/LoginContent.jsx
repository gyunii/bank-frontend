import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginContent.module.css';
import { useAuth } from '../../context/AuthContext';

const LoginContent = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        residentNumber: ''
    });
    const [rememberEmail, setRememberEmail] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberEmail(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCheckboxChange = (e) => {
        setRememberEmail(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const queryParams = new URLSearchParams({
                email: formData.email,
                password: formData.password,
                residentNumber: formData.residentNumber
            }).toString();

            const response = await fetch(`/api/user/login?${queryParams}`, {
                method: 'POST',
                headers: {
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    await login(); 
                    
                    if (rememberEmail) {
                        localStorage.setItem('savedEmail', formData.email);
                    } else {
                        localStorage.removeItem('savedEmail');
                    }

                    alert('로그인 성공!');
                    navigate(from, { replace: true });
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
            <h2>금융 선택에 초점을 맞추다.</h2>
            <h1>BankScope</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="이메일을 입력해주세요"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호를 입력해주세요"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="residentNumber">주민등록번호</label>
                    <input
                        type="text"
                        id="residentNumber"
                        name="residentNumber"
                        value={formData.residentNumber}
                        onChange={handleChange}
                        placeholder="'-' 없이 입력해주세요"
                        required
                    />
                </div>
                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="rememberEmail"
                        checked={rememberEmail}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="rememberEmail">이메일 기억하기</label>
                </div>
                <button type="submit" className={styles.submitButton}>로그인</button>
            </form>
            <div className={styles.registerLink}>
                <span>아직 회원이 아니신가요? </span>
                <Link to="/Register">회원가입</Link>
                <span> 하기  </span>
            </div>
            <div className={styles.registerLink}>
                <span>임직원 이신가요?</span>
                <Link to="/AdminLogin"> 임직원로그인</Link>
                <span> 하기  </span>
            </div>
        </div>
    );
};

export default LoginContent;
