import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await fetch('/api/user/session');
            if (response.ok) {
                const data = await response.json();
                console.log("Session API Response:", data); // 디버깅 로그 추가
                if (data.result === "SUCCESS") {
                    setUser({ email: data.email, name: data.name, residentNumber: data.residentNumber });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Session check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        // 로그인 성공 후 세션 정보를 다시 가져와서 상태 업데이트
        await checkSession();
    };

    const logout = async () => {
        try {
            await fetch('/api/user/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
