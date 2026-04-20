import React, { use } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import Home from './pages/Home.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Login from './pages/Login.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useThemeStore }  from './store/useThemeStore.js';
import { useEffect } from 'react';
import {Loader} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
const App = () => {
  const {authUser,checkAuth, isCheckingAuth,onlineUsers} = useAuthStore();
  const { theme } = useThemeStore();
  console.log({onlineUsers});
  useEffect(()=>{
    checkAuth();
  }, [checkAuth]);
  console.log({authUser});
if (isCheckingAuth) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );
}


  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path = "/" element={authUser ? <Home /> : <Navigate to="/login" />}/>
        <Route path = "/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />}/>
        <Route path = "/settings" element={<SettingsPage />}/>
        <Route path = "/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />}/>
        <Route path = "/login" element={!authUser ? <Login /> : <Navigate to="/" />}/>
      </Routes>
      <Toaster />
  </div>
  )
}

export default App
