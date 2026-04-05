import React, { createContext, useContext, useState } from 'react';
import CustomModal from '../components/common/CustomModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '안내',
        message: '',
        onConfirm: null,
        onCancel: null,
    });

    const openModal = ({ message, title = '안내', onConfirm = null, onCancel = null }) => {
        setModalConfig({ isOpen: true, title, message, onConfirm, onCancel });
    };

    const closeModal = () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirm = () => {
        if (modalConfig.onConfirm) {
            modalConfig.onConfirm();
        }
    };

    const handleCancel = () => {
        if (modalConfig.onCancel) {
            modalConfig.onCancel();
        }
    };

    return (
        <ModalContext.Provider value={{ openModal }}>
            {children}
            <CustomModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                onConfirm={modalConfig.onConfirm ? handleConfirm : null}
                onCancel={modalConfig.onCancel ? handleCancel : null}
                confirmText="확인"
                cancelText="취소"
            >
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2rem', color: '#333', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {modalConfig.message}
                </div>
            </CustomModal>
        </ModalContext.Provider>
    );
};
