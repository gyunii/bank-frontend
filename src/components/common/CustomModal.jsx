import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomModal.module.css';

const CustomModal = ({
                         isOpen,
                         onClose,
                         title,
                         children,
                         onConfirm,
                         onCancel,
                         confirmText = '확인',
                         cancelText = '취소',
                         duration = 0
                     }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isAnimate, setIsAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            // 브라우저 렌더링 사이클을 고려한 짧은 지연
            const timer = setTimeout(() => setIsAnimate(true), 10);

            if (duration > 0) {
                const autoCloseTimer = setTimeout(onClose, duration);
                return () => clearTimeout(autoCloseTimer);
            }
            return () => clearTimeout(timer);
        } else {
            setIsAnimate(false);
        }
    }, [isOpen, duration, onClose]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleTransitionEnd = (e) => {
        // opacity 트랜지션이 끝나고, 닫히는 중(isAnimate가 false)일 때만 DOM 제거
        if (e.propertyName === 'opacity' && !isAnimate) {
            setIsRendered(false);
        }
    };

    if (!isRendered) return null;

    return createPortal(
        <div
            className={`${styles.overlay} ${isAnimate ? styles.isOpen : ''}`}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onTransitionEnd={handleTransitionEnd}
        >
            <div className={styles.modalBox}>
                <div className={styles.header}>
                    <span>{title}</span>
                    <span className={styles.closeBtn} onClick={onClose}>&times;</span>
                </div>

                <div className={styles.content}>
                    {children}
                </div>

                {(onConfirm || onCancel) && (
                    <div className={styles.footer}>
                        {onCancel && (
                            <button
                                className={`${styles.modalBtn} ${styles.cancel}`}
                                onClick={() => { onCancel(); onClose(); }}
                            >
                                {cancelText}
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                className={`${styles.modalBtn} ${styles.confirm}`}
                                onClick={() => { onConfirm(); onClose(); }}
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default CustomModal;