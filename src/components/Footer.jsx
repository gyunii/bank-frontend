import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>&copy; 2026 Bank Scope. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
