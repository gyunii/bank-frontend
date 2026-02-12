import { Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyPage from './pages/MyPage.jsx';
import Option from './pages/Option.jsx';
import FastTask from './pages/FastTask.jsx';
import ConsultTask from './pages/ConsultTask.jsx';
import SpecialTask from './pages/SpecialTask.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminMain from './pages/AdminMain.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Option" element={<Option />} />
        <Route path="/My" element={<MyPage />} />
        <Route path="/fast-task" element={<PrivateRoute><FastTask /></PrivateRoute>} />
        <Route path="/consult-task" element={<PrivateRoute><ConsultTask /></PrivateRoute>} />
        <Route path="/special-task" element={<PrivateRoute><SpecialTask /></PrivateRoute>} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminMain" element={<AdminMain />} />
      </Routes>
    </Layout>
  );
}

export default App;
