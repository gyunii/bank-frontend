import React, { useState, useEffect } from 'react';
import styles from './UserMangement.module.css';
import AdminModal from './AdminModal.jsx';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // 멤버 목록 조회 함수
    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/user/members');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    // 컴포넌트 마운트 시 멤버 목록 조회
    useEffect(() => {
        fetchMembers();
    }, []);

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

    const handleSaveUser = async (userData) => {
        // 백엔드 API 요구사항에 맞춰 데이터 변환
        const memberData = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            level: userData.level,
            auth: userData.auth,
            team: userData.team,
            status: userData.status, // Integer 그대로 전송
        };

        try {
            let response;
            if (selectedUser) {
                // 수정 모드: PATCH 요청
                response = await fetch('/api/user/member', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(memberData),
                });
            } else {
                // 등록 모드: POST 요청
                response = await fetch('/api/user/member', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(memberData),
                });
            }

            if (response.ok) {
                const result = await response.json();
                if (result.result === 'SUCCESS') {
                    alert(selectedUser ? '멤버 수정 성공!' : '멤버 등록 성공!');
                    fetchMembers(); // 목록 갱신
                } else {
                    alert(selectedUser ? '멤버 수정 실패' : '멤버 등록 실패');
                }
            } else {
                alert('서버 오류 발생');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('오류가 발생했습니다.');
        }

        handleCloseModal();
    };

    // 레벨 표시 헬퍼 함수
    const getLevelLabel = (level) => {
        switch (level) {
            case 1: return 'Lv.1 (신입/서포터)';
            case 2: return 'Lv.2 (일반 행원)';
            case 3: return 'Lv.3 (대리/과장)';
            case 4: return 'Lv.4 (차장/팀장)';
            case 5: return 'Lv.5 (지점장급)';
            default: return level;
        }
    };

    return (
        <div className={styles.userContainer}>
            <h2 className={styles.title}>임직원 관리</h2>

            <div className={styles.topBar}>
                <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="이름 혹은 이메일을 검색해주세요" className={styles.searchInput} />
                </div>
                <div className={styles.actionBtns}>
                    <select className={styles.roleSelect}>
                        <option>전체</option>
                        <option>활성</option>
                        <option>비활성</option>
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
                    <th>직급</th>
                    <th>권한</th>
                    <th>소속</th>
                    <th>입사일</th>
                    <th>마지막접속</th>
                    <th>상태</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {users.length === 0 ? (
                    <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                            등록된 임직원이 없습니다.
                        </td>
                    </tr>
                ) : (
                    users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{getLevelLabel(user.level)}</td>
                            <td>{user.auth}</td>
                            <td>{user.team}</td>
                            <td>{user.joinDate}</td>
                            <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
                            <td>
                                    <span className={`${styles.statusBadge} ${user.status === 1 ? styles.active : styles.inactive}`}>
                                        {user.status === 1 ? '활성' : '비활성'}
                                    </span>
                            </td>
                            <td>
                                <button className={styles.editBtn} onClick={() => handleEditClick(user)}>📝 수정</button>
                            </td>
                        </tr>
                    ))
                )}
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