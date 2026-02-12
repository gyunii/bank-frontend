import React, { useState } from 'react';
import styles from './Register.module.css';
import {Link, useNavigate} from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        residentNumber: ''
    });
    const navigate = useNavigate();

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
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result === 'SUCCESS') {
                    alert('회원가입 성공!');
                    navigate('/Login');
                } else {
                    alert('회원가입 실패');
                }
            } else {
                alert('회원가입 실패');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.registerContainer}>
            <h2>금융 선택에 초점을 맞추다.</h2>
            <h1>BankScope</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">이름</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="이름을 입력해주세요"
                        required
                    />
                </div>
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
                        required
                        placeholder="비밀번호를 입력해주세요"
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
                <button type="submit" className={styles.submitButton}>회원가입</button>
            </form>
            <div className={styles.loginLink}>
                <span>이미 회원이신가요? </span>
                <Link to="/login">로그인하기</Link>
            </div>
        </div>
    );
};

export default Register;
