import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Alert, Descriptions, Tag } from 'antd';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const TestAPI: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      // Test the auth test endpoint
      const response = await axios.get('http://172.16.2.12:3004/api/auth/test');
      setData(response.data);
      console.log('Test API Response:', response.data);
    } catch (err: any) {
      console.error('Test API Error:', err);
      setError(err.response?.data?.message || err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    try {
      const response = await axios.get('http://172.16.2.12:3004/');
      setHealthData(response.data);
      console.log('Health Check Response:', response.data);
    } catch (err: any) {
      console.error('Health Check Error:', err);
    }
  };

  const testLoginAPI = async () => {
    try {
      const response = await axios.post('http://172.16.2.12:3004/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      console.log('Login Test Response:', response.data);
      alert('Login API Test: ' + (response.data.success ? 'SUCCESS' : 'FAILED'));
    } catch (err: any) {
      console.error('Login Test Error:', err);
      alert('Login API Test: FAILED - ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    testConnection();
    testHealthCheck();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Card 
        title={
          <Space>
            <ApiOutlined />
            PKT Document System - Connection Test
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          
          {/* Action Buttons */}
          <Space wrap>
            <Button 
              type="primary" 
              loading={loading} 
              onClick={testConnection}
              icon={<ApiOutlined />}
            >
              Test Backend Connection
            </Button>
            
            <Button 
              type="default" 
              onClick={testHealthCheck}
            >
              Health Check
            </Button>
            
            <Button 
              type="default" 
              onClick={testLoginAPI}
            >
              Test Login API
            </Button>
          </Space>

          {/* Connection Status */}
          {data && (
            <Alert
              message="✅ Backend API Connected Successfully!"
              description={`Message: ${data.message}`}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}
          
          {error && (
            <Alert
              message="❌ Connection Failed"
              description={`Error: ${error}`}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
            />
          )}

          {/* Server Information */}
          {healthData && (
            <Card size="small" title="🖥️ Server Information">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Status">
                  <Tag color="green">Running</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Port">
                  {healthData.port}
                </Descriptions.Item>
                <Descriptions.Item label="Last Response">
                  {new Date(healthData.timestamp).toLocaleString('th-TH')}
                </Descriptions.Item>
                <Descriptions.Item label="Server URL">
                  http://172.16.2.12:3004
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* API Response Data */}
          {data && (
            <Card size="small" title="📋 API Response">
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 6,
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          )}

          {/* Current User Info */}
          <Card size="small" title="👤 Current Session">
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Username">
                {JSON.parse(localStorage.getItem('user') || '{}').username || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {JSON.parse(localStorage.getItem('user') || '{}').role || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Token">
                {localStorage.getItem('token') ? 
                  <Tag color="blue">Active</Tag> : 
                  <Tag color="red">None</Tag>
                }
              </Descriptions.Item>
            </Descriptions>
          </Card>
          
        </Space>
      </Card>
    </div>
  );
};

export default TestAPI;