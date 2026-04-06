import React, { useState, useEffect } from 'react';
import styles from './ProductManagement.module.css';
import { useModal } from '../../context/ModalContext'; 
import Loading from '../common/Loading'; 

const ProductManagement = () => {
    const { openModal } = useModal(); 
    const [activeTab, setActiveTab] = useState('DEPOSIT'); 
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [checkedItems, setCheckedItems] = useState([]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const categories = [
        { id: 'DEPOSIT', label: '예금' },
        { id: 'SAVING', label: '적금' },
        { id: 'LOAN', label: '대출' },
        { id: 'FUND', label: '펀드' }
    ];

    const initialFormState = {
        productCategory: 'DEPOSIT',
        productName: '',
        targetAudience: '개인',
        minDurationMonths: 0,
        maxDurationMonths: 0,
        minAmount: 0, 
        maxAmount: 0, 
        baseInterestRate: 0.0,    
        maxInterestRate: 0.0,     
        interestType: '단리',    
        isActive: true,         
        description: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // ==========================================
    // [백엔드 연동] 금융 상품 리스트 조회
    // ==========================================
    const fetchProducts = async () => {
        setIsLoading(true);
        // 로딩 애니메이션 확인용 
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = [
            { productId: 1, productCategory: 'DEPOSIT', productName: 'Star 정기예금', targetAudience: '개인', minDurationMonths: 6, maxDurationMonths: 12, minAmount: 1000000, maxAmount: 50000000, baseInterestRate: 3.20, maxInterestRate: 3.50, interestType: '단리', isActive: true },
            { productId: 2, productCategory: 'DEPOSIT', productName: '쏠편한 정기예금', targetAudience: '개인/법인', minDurationMonths: 1, maxDurationMonths: 6, minAmount: 500000, maxAmount: 100000000, baseInterestRate: 3.30, maxInterestRate: 3.60, interestType: '복리', isActive: true },
        ];
        
        setProductList(activeTab === 'DEPOSIT' ? mockData : []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProducts();
        setCheckedItems([]); 
    }, [activeTab]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheck = (id) => {
        setCheckedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };
    const handleCheckAll = (e) => {
        setCheckedItems(e.target.checked ? productList.map(item => item.productId) : []);
    };

    // ==========================================
    // [백엔드 연동] 상품 추가 / 수정
    // ==========================================
    const handleSubmit = async () => {
        if (!formData.productName) {
            openModal({ message: "상품명을 입력해주세요.", confirmText: "확인" });
            return;
        }

        setIsLoading(true);
        // 백엔드 연동 시 여기에 API 전송 로직 작성
        await new Promise(resolve => setTimeout(resolve, 500)); // 가짜 딜레이

        const isEdit = selectedItem !== null;
        
        setIsFormModalOpen(false); 
        openModal({
            message: isEdit ? "상품 정보가 수정되었습니다." : "상품이 등록되었습니다.",
            confirmText: "확인",
            onConfirm: () => fetchProducts() // 임시로 다시 목록 불러오기
        });
        setIsLoading(false);
    };

    // ==========================================
    // [백엔드 연동] 상품 삭제
    // ==========================================
    const handleDelete = (id) => {
        openModal({
            message: "정말로 이 상품을 삭제하시겠습니까?",
            confirmText: "삭제",
            cancelText: "취소",
            onConfirm: async () => {
                setIsLoading(true);
                // 백엔드 연동 시 여기에 API 호출
                await new Promise(resolve => setTimeout(resolve, 500)); // 가짜 딜레이
                
                // 화면에서 임시로 삭제 처리 보여주기
                setProductList(prev => prev.filter(item => item.productId !== id));
                openModal({ message: "삭제되었습니다.", confirmText: "확인" });
                
                setIsLoading(false);
            }
        });
    };

    const handleWriteClick = () => {
        setFormData({ ...initialFormState, productCategory: activeTab });
        setSelectedItem(null); 
        setIsFormModalOpen(true);
    };

    const handleEditClick = (item) => {
        setSelectedItem(item);
        setFormData({ ...item }); 
        setIsFormModalOpen(true);
    };

    return (
        <>
            {isLoading && <Loading message="데이터를 처리 중입니다..." />}

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.pageTitle}>금융 상품 관리</h2>
                </div>

                <div className={styles.searchAndTabRow}>
                    <div className={styles.tabContainer}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.tabBtn} ${activeTab === cat.id ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className={styles.actionButtons}>
                        <button className={styles.outlineBtn}>- 삭제</button>
                        <button className={styles.primaryBtn} onClick={handleWriteClick}>+ 추가</button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th width="4%">
                                    <input type="checkbox" onChange={handleCheckAll} checked={checkedItems.length === productList.length && productList.length > 0} />
                                </th>
                                <th width="16%" className={styles.leftAlign}>상품명</th>
                                <th width="8%">대상</th>
                                <th width="10%">가입 기간</th>
                                <th width="15%">가입 금액</th>
                                <th width="9%">기본금리</th>
                                <th width="9%">최고금리</th>
                                <th width="9%">이자방식</th>
                                <th width="8%">상태</th>
                                <th width="12%">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoading && productList.length > 0 ? (
                                productList.map((item) => (
                                    <tr key={item.productId} className={checkedItems.includes(item.productId) ? styles.selectedRow : ''}>
                                        <td>
                                            <input type="checkbox" checked={checkedItems.includes(item.productId)} onChange={() => handleCheck(item.productId)} />
                                        </td>
                                        <td className={`${styles.leftAlign} ${styles.productName}`}>{item.productName}</td>
                                        <td className={styles.subText}>{item.targetAudience}</td>
                                        <td className={styles.subText}>{item.minDurationMonths} ~ {item.maxDurationMonths}개월</td>
                                        <td className={styles.subText}>
                                            {(item.minAmount / 10000).toLocaleString()}만 ~ {(item.maxAmount / 10000).toLocaleString()}만
                                        </td>
                                        <td className={styles.baseRate}>{item.baseInterestRate?.toFixed(2)}%</td>
                                        <td className={styles.maxRate}>{item.maxInterestRate?.toFixed(2)}%</td>
                                        <td><span className={styles.typeBadge}>{item.interestType}</span></td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${item.isActive ? styles.active : styles.inactive}`}>
                                                {item.isActive ? '판매중' : '판매종료'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.manageBtns}>
                                                <button className={styles.textBtn} onClick={() => handleEditClick(item)}>수정</button>
                                                <span className={styles.divider}>|</span>
                                                <button className={`${styles.textBtn} ${styles.deleteText}`} onClick={() => handleDelete(item.productId)}>삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading ? (
                                <tr><td colSpan="10" className={styles.empty}>등록된 상품이 없습니다.</td></tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {isFormModalOpen && (
                    <div className={styles.adminModalOverlay}>
                        <div className={styles.adminModalBox}>
                            <div className={styles.adminModalHeader}>
                                {selectedItem ? "상품 정보 수정" : "상품 등록"}
                            </div>
                            
                            <div className={styles.adminModalBody}>
                                <div className={styles.adminFormGrid}>
                                    <div className={`${styles.adminFormRow} ${styles.fullWidthRow}`}>
                                        <label>상품명</label>
                                        <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="예) KB Star 정기예금" />
                                    </div>

                                    <div className={styles.adminFormRow}>
                                        <label>상품 카테고리</label>
                                        <select name="productCategory" value={formData.productCategory} onChange={handleInputChange}>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.adminFormRow}>
                                        <label>상태</label>
                                        <select name="isActive" value={formData.isActive} onChange={handleInputChange}>
                                            <option value={true}>활성화 (판매중)</option>
                                            <option value={false}>비활성화 (판매종료)</option>
                                        </select>
                                    </div>

                                    <div className={styles.adminFormRow}>
                                        <label>가입 대상</label>
                                        <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                                            <option value="개인">개인</option>
                                            <option value="법인">법인</option>
                                            <option value="개인/법인">개인/법인</option>
                                        </select>
                                    </div>
                                    <div className={styles.adminFormRow}>
                                        <label>이자 방식</label>
                                        <select name="interestType" value={formData.interestType} onChange={handleInputChange}>
                                            <option value="단리">단리</option>
                                            <option value="복리">복리</option>
                                        </select>
                                    </div>

                                    <div className={styles.adminFormRow}>
                                        <label>기본 금리(%)</label>
                                        <input type="number" step="0.01" name="baseInterestRate" value={formData.baseInterestRate} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.adminFormRow}>
                                        <label>최고 금리(%)</label>
                                        <input type="number" step="0.01" name="maxInterestRate" value={formData.maxInterestRate} onChange={handleInputChange} />
                                    </div>

                                    <div className={styles.adminFormRow}>
                                        <label>최소 가입기간(월)</label>
                                        <input type="number" name="minDurationMonths" value={formData.minDurationMonths} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.adminFormRow}>
                                        <label>최대 가입기간(월)</label>
                                        <input type="number" name="maxDurationMonths" value={formData.maxDurationMonths} onChange={handleInputChange} />
                                    </div>

                                    <div className={styles.adminFormRow}>
                                        <label>최소 가입금액(원)</label>
                                        <input type="number" name="minAmount" value={formData.minAmount} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.adminFormRow}>
                                        <label>최대 가입금액(원)</label>
                                        <input type="number" name="maxAmount" value={formData.maxAmount} onChange={handleInputChange} />
                                    </div>
                                    
                                </div>
                            </div>

                            <div className={styles.adminModalFooter}>
                                <button className={styles.saveBtn} onClick={handleSubmit}>저장</button>
                                <button className={styles.cancelBtn} onClick={() => setIsFormModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductManagement;