import { Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from "./components/Layout";
import Home from "./pages/Customer/Home.jsx";
import Login from './pages/Customer/Login.jsx';
import Register from './pages/Customer/Register.jsx';
import MyPage from './pages/Customer/MyPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import AdminMain from './pages/Admin/AdminMain.jsx';
import Kiosk from './pages/Kiosk/Kiosk.jsx';
import BankerWorkSpace from './pages/Banker/BankerWorkSpace.jsx';
import ModalTestPage from './components/common/ModalTestPage.jsx';
import LoadingTestPage from './components/common/LoadingTestPage.jsx';
import BoardList from './pages/Customer/BoardList';
import BoardDetail from './pages/Customer/BoardDetail';
import PinSetup from './pages/Customer/PinSetup.jsx';
import PinReset from "./pages/Customer/PinReset.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Kiosk/>} />
        <Route path="/Main" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        
        {/* Customer 전용 페이지 */}
        <Route path="/My" element={<PrivateRoute allowedRoles={['customer']}><MyPage /></PrivateRoute>} />
        <Route path="/PinSetup" element={<PrivateRoute allowedRoles={['customer']}><PinSetup /></PrivateRoute>} />
        <Route path="/PinReset" element={<PrivateRoute allowedRoles={['customer']}><PinReset /></PrivateRoute>} />
        <Route path="/board/:boardType" element={<BoardList />} />
        <Route path="/board/detail/:id" element={<BoardDetail />} />

        <Route path="/AdminLogin" element={<AdminLogin />} />
        
        {/* Admin 전용 페이지 */}
        <Route path="/AdminMain" element={<PrivateRoute allowedRoles={['admin']}><AdminMain /></PrivateRoute>} />

        
        {/* Member 전용 페이지 */}
        <Route path="/BankerWorkSpace" element={<PrivateRoute allowedRoles={['member']}><BankerWorkSpace /></PrivateRoute>} />


        {/* 테스트용 페이지 (개발용) */}
        <Route path="/test-modal" element={<ModalTestPage />} />
        <Route path="/test-loading" element={<LoadingTestPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
