import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, message } from 'antd';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

// Define User interface
interface User {
  id: number;
  username: string;
  role: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogout = useCallback(() => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    setIsLoggedIn(false);
    message.success('ออกจากระบบเรียบร้อยแล้ว');
  }, []);

  const checkLoginStatus = useCallback(() => {
    // Check both localStorage and sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    console.log('Checking login status:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setIsLoggedIn(true);
        console.log('User logged in:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const handleLoginSuccess = () => {
    console.log('Login success callback triggered');
    checkLoginStatus();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ConfigProvider>
  );
}

export default App;
