import React, { useState, useEffect } from 'react';
import styles from './BoardManagement.module.css';
import CustomModal from '../common/CustomModal.jsx';

const BoardManagement = ({ type, title }) => {
    const [viewMode, setViewMode] = useState('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [postList, setPostList] = useState([]);

    useEffect(() => {
        //여기서 API를 호출. (`/api/${type}`)
        const mockData = [
            { id: 1, title: `${title} 게시판의 1번 글입니다.`, date: '2026.03.11', content: '상세 내용' },
            { id: 2, title: `${title} 게시판의 2번 글입니다.`, date: '2026.03.11', content: '상세 내용' },
        ];
        
        setPostList(mockData);
        setViewMode('list'); 
    }, [type, title]); 

    const handleWrite = () => {
        setSelectedItem(null); 
        setViewMode('write');
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setViewMode('edit');
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        setPostList(postList.filter(p => p.id !== selectedItem.id));
        setIsModalOpen(false);
    };

    

    return (
        <div className={styles.container}>
            {viewMode === 'list' ? (
                <>
                    <div className={styles.headerRow}>
                        <h2 className={styles.title}>{title} 관리</h2>
                        <button className={styles.writeBtn} onClick={handleWrite}>작성</button>
                    </div>

                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th} style={{ width: '80px' }}>번호</th>
                                <th className={`${styles.th} ${styles.titleCell}`}>제목</th>
                                <th className={styles.th} style={{ width: '150px' }}>등록일</th>
                                <th className={styles.th} style={{ width: '150px' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postList.map((item) => (
                                <tr key={item.id} className={styles.tr}>
                                    <td className={styles.td}>{item.id}</td>
                                    <td className={`${styles.td} ${styles.titleCell}`}>{item.title}</td>
                                    <td className={styles.td}>{item.date}</td>
                                    <td className={styles.td}>
                                        <button className={styles.deleteBtn} onClick={() => handleDeleteClick(item)}>삭제</button>
                                        <button className={styles.editBtn} onClick={() => handleEdit(item)}>수정</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>{viewMode === 'write' ? `${title} 작성` : `${title} 수정`}</h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>제목</label>
                        <input type="text" className={styles.inputTitle} placeholder="제목" defaultValue={selectedItem?.title || ''} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>내용</label>
                        <textarea className={styles.textarea} placeholder="내용을 입력하세요." defaultValue={selectedItem?.content || ''} />
                    </div>
                    <div className={styles.btnRow}>
                        <button className={styles.cancelBtn} onClick={() => setViewMode('list')}>취소</button>
                        <button className={styles.submitBtn} onClick={() => setViewMode('list')}>등록</button>
                    </div>
                </div>
            )}

            <CustomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="알림"
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
                confirmText="확인"
                cancelText="취소"
            >
                <p style={{ textAlign: 'center', padding: '20px' }}>정말로 삭제하시겠습니까?</p>
            </CustomModal>
        </div>
    );
};

export default BoardManagement;