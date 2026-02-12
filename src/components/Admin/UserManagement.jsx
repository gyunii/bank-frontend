import React, { useState } from 'react';
import styles from './UserMangement.module.css';
import AdminModal from './AdminModal.jsx';

const UserManagement = () => {
    // 예시 데이터
    const [users, setUsers] = useState([
        { id: 1, name: '노구', email: 'superadmin@bank.com', role: '최고관리자', dept: '대표 이사', joinDate: '2020.01.15', lastLogin: '5분 전', status: '활성' },
        { id: 2, name: '김갑수', email: 'admin@bank.com', role: '관리자', dept: '관리팀', joinDate: '2021.03.20', lastLogin: '1시간 전', status: '활성' },
        { id: 3, name: '박명수', email: 'park@bank.com', role: '사원', dept: '관리팀', joinDate: '2022.06.10', lastLogin: '30분 전', status: '비활성' },
        { id: 4, name: '침착맨', email: 'chim@bank.com', role: '사원', dept: '상품팀', joinDate: '2023.01.05', lastLogin: '2시간 전', status: '비활성' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleAddClick = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = (userData) => {
        if (selectedUser) {
            // 수정 로직
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
        } else {
            // 추가 로직
            const newUser = {
                id: users.length + 1,
                ...userData,
                joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                lastLogin: '-',
            };
            setUsers([...users, newUser]);
        }
        handleCloseModal();
    };

    return (
        <div className={styles.userContainer}>
            <h2 className={styles.title}>사용자 관리</h2>

            <div className={styles.topBar}>
                <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="이름 혹은 이메일을 검색해주세요" className={styles.searchInput} />
                </div>
                <div className={styles.actionBtns}>
                    <select className={styles.roleSelect}>
                        <option>관리자</option>
                        <option>사원</option>
                    </select>
                    <button className={styles.deleteBtn}>- 삭제</button>
                    <button className={styles.addBtn} onClick={handleAddClick}>+ 추가</button>
                </div>
            </div>

            <table className={styles.userTable}>
                <thead>
                <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>권한</th>
                    <th>소속</th>
                    <th>입사일</th>
                    <th>마지막접속</th>
                    <th>상태</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                            {user.role === '최고관리자' ? (
                                user.role
                            ) : (
                                <select className={styles.inlineSelect} defaultValue={user.role}>
                                    <option>관리자</option>
                                    <option>사원</option>
                                </select>
                            )}
                        </td>
                        <td>{user.dept}</td>
                        <td>{user.joinDate}</td>
                        <td>{user.lastLogin}</td>
                        <td>
                                <span className={`${styles.statusBadge} ${user.status === '활성' ? styles.active : styles.inactive}`}>
                                    {user.status === '활성' ? '활성화' : '비 활성화'}
                                </span>
                        </td>
                        <td>
                            {user.role !== '최고관리자' && (
                                <button className={styles.editBtn} onClick={() => handleEditClick(user)}>📝 수정</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <AdminModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveUser} 
                user={selectedUser}
            />
        </div>
    );
};

export default UserManagement;