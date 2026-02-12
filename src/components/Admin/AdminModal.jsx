import React, { useState, useEffect } from 'react';
import styles from './AdminModal.module.css';

const AdminModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // 비밀번호 필드 추가
        role: '사원',
        dept: '',
        status: '활성'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // 수정 시 비밀번호는 비워둠 (변경할 경우에만 입력)
                role: user.role,
                dept: user.dept,
                status: user.status
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: '사원',
                dept: '',
                status: '활성'
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <header className={styles.modalHeader}>
                    <h2>{user ? '직원 정보 수정' : '직원 등록'}</h2>
                </header>

                <div className={styles.modalContent}>
                    <table className={styles.formTable}>
                        <tbody>
                        <tr>
                            <th>이름</th>
                            <td>
                                <input 
                                    type="text" 
                                    name="name"
                                    className={styles.fullInput} 
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>
                                <input 
                                    type="email" 
                                    name="email"
                                    className={styles.fullInput} 
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>비밀번호</th>
                            <td>
                                <input 
                                    type="password" 
                                    name="password"
                                    className={styles.fullInput} 
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={user ? "변경 시에만 입력하세요" : "비밀번호를 입력하세요"}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>권한</th>
                            <td>
                                <select 
                                    name="role"
                                    className={styles.fullSelect} 
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="최고관리자">최고관리자</option>
                                    <option value="관리자">관리자</option>
                                    <option value="사원">사원</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>소속</th>
                            <td>
                                <input 
                                    type="text" 
                                    name="dept"
                                    className={styles.fullInput} 
                                    value={formData.dept}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td className={styles.radioGroup}>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="활성"
                                        checked={formData.status === '활성'}
                                        onChange={handleChange}
                                    /> 활성
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="비활성"
                                        checked={formData.status === '비활성'}
                                        onChange={handleChange}
                                    /> 비활성
                                </label>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <footer className={styles.modalFooter}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <span className={styles.icon}>✔</span> 저장
                    </button>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        <span className={styles.icon}>✖</span> 취소
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AdminModal;