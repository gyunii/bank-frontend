// Navbar.jsx (구조 수정)

import { Link } from 'react-router-dom'
import styles from './NavBar.module.css'
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftGroup}>
                <div className={styles.brand}><Link to="/Main">BankScope</Link></div>
            </div>

            <ul className={styles.navLinks}>

                <li><Link to="/My">마이페이지</Link></li>
                {user ? (
                    <li><button onClick={logout} className={styles.logoutButton}>로그아웃</button></li>
                ) : (
                    <li><Link to="/Login">로그인</Link></li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar
