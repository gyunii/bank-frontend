import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인이 필요한 서비스입니다.");
        }
    }, [loading, user]);

    if (loading) {
        return <div>Loading...</div>; // 로딩 중일 때 표시할 컴포넌트
    }

    if (!user) {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉션하며 현재 위치를 state로 전달
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
