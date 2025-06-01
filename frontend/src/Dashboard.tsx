import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Button, 
  Typography, 
  Space, 
  Badge,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Tag
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  FileAddOutlined,
  SearchOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import DocumentList from './components/DocumentList';
import DocumentUpload from './components/DocumentUpload';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user from storage
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    onLogout();
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        โปรไฟล์
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        ตั้งค่า
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  const sidebarMenu = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'แดชบอร์ด',
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: 'จัดการเอกสาร',
    },
    {
      key: '3',
      icon: <UploadOutlined />,
      label: 'อัปโหลดเอกสาร',
    },
    {
      key: '4',
      icon: <SearchOutlined />,
      label: 'ค้นหาเอกสาร',
    },
  ];

  // Mock data for dashboard statistics
  const dashboardStats = {
    totalDocuments: 156,
    newToday: 12,
    pendingApproval: 8,
    storageUsed: 68
  };

  const recentDocuments = [
    { id: 1, name: 'SO_20250601_001.xml', type: 'SO', uploadTime: '10:30 AM', status: 'approved' },
    { id: 2, name: 'EN_20250601_002.xml', type: 'EN', uploadTime: '11:15 AM', status: 'pending' },
    { id: 3, name: 'SH_20250601_003.xml', type: 'SH', uploadTime: '2:45 PM', status: 'approved' },
    { id: 4, name: 'SO_20250601_004.xml', type: 'SO', uploadTime: '3:20 PM', status: 'pending' }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <div>
            <Title level={2} style={{ marginBottom: '24px', color: '#1f1f1f' }}>
              📊 แดชบอร์ด
            </Title>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="เอกสารทั้งหมด"
                    value={dashboardStats.totalDocuments}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="เอกสารใหม่วันนี้"
                    value={dashboardStats.newToday}
                    prefix={<FileAddOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="รออนุมัติ"
                    value={dashboardStats.pendingApproval}
                    prefix={<SafetyCertificateOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <div>
                    <Text type="secondary">พื้นที่ใช้งาน</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Progress 
                        percent={dashboardStats.storageUsed} 
                        size="small" 
                        status={dashboardStats.storageUsed > 80 ? 'exception' : 'active'}
                      />
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {dashboardStats.storageUsed}% ของ 10GB
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Recent Documents */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="📄 เอกสารล่าสุด" extra={<Button type="link">ดูทั้งหมด</Button>}>
                  <List
                    dataSource={recentDocuments}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button type="link" icon={<DownloadOutlined />}>ดาวน์โหลด</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.type}</Avatar>}
                          title={item.name}
                          description={`อัปโหลดเมื่อ ${item.uploadTime}`}
                        />
                        <Tag color={item.status === 'approved' ? 'green' : 'orange'}>
                          {item.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="📈 สถิติรายเดือน">
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Progress type="circle" percent={75} />
                    <div style={{ marginTop: '16px' }}>
                      <Text>เป้าหมายประจำเดือน</Text><br/>
                      <Text type="secondary">750/1000 เอกสาร</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case '2':
        return <DocumentList />;
      case '3':
        return <DocumentUpload />;
      case '4':
        return (
          <div>
            <Title level={2}>🔍 ค้นหาเอกสาร</Title>
            <Text>ฟีเจอร์ค้นหาเอกสารขั้นสูง (พัฒนาต่อ)</Text>
          </div>
        );
      default:
        return <div>เลือกเมนูจากแถบด้านซ้าย</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {!collapsed ? (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              PKT Docs
            </Title>
          ) : (
            <SafetyCertificateOutlined style={{ fontSize: '24px', color: 'white' }} />
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={sidebarMenu}
          style={{ 
            background: 'transparent',
            border: 'none'
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{
          background: 'white',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <Title level={4} style={{ margin: '0 0 0 16px', color: '#1f1f1f' }}>
              ระบบจัดการเอกสาร PKT
            </Title>
          </div>

          <Space size="middle">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            
            <Dropdown overlay={userMenu} trigger={['click']}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.3s'
              }}>
                <Avatar 
                  style={{ backgroundColor: '#1890ff', marginRight: '8px' }}
                  icon={<UserOutlined />}
                />
                <div>
                  <Text strong>{user?.username || 'Admin'}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.role || 'Administrator'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#f5f5f5',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
