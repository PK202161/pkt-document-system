import React, { useState, useEffect } from 'react';
import { ConfigProvider, Button, Space, Card, message, Tabs } from 'antd';
import { LogoutOutlined, UploadOutlined, FileTextOutlined, ApiOutlined } from '@ant-design/icons';
import Login from './Login';
import TestAPI from './TestAPI';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import './App.css';

const { TabPane } = Tabs;

// Define User interface
interface User {
  id: number;
  username: string;
  role: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Checking login status:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log('User logged in:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    message.success('ออกจากระบบแล้ว');
  };

  const handleLoginSuccess = () => {
    console.log('Login success callback triggered');
    checkLoginStatus();
  };

  if (!isLoggedIn) {
    return (
      <ConfigProvider>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider>
      <div className="App">
        <div style={{ padding: 20, minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
          <Card>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0', 
              paddingBottom: 16,
              marginBottom: 24 
            }}>
              <div>
                <h1 style={{ margin: 0, color: '#1890ff' }}>
                  📋 PKT Document Management System
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  XML Document Upload & Management System
                </p>
              </div>
              
              <Space>
                <span style={{ marginRight: 16, color: '#666' }}>
                  ยินดีต้อนรับ <strong>{user?.username}</strong> ({user?.role})
                </span>
                <Button 
                  type="primary" 
                  danger 
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  ออกจากระบบ
                </Button>
              </Space>
            </div>
            
            {/* Main Content with Tabs */}
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              type="card"
              size="large"
            >
              <TabPane 
                tab={
                  <span>
                    <UploadOutlined />
                    อัพโหลดเอกสาร
                  </span>
                } 
                key="upload"
              >
                <DocumentUpload />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined />
                    รายการเอกสาร
                  </span>
                } 
                key="documents"
              >
                <DocumentList />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <ApiOutlined />
                    ทดสอบระบบ
                  </span>
                } 
                key="test"
              >
                <TestAPI />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;