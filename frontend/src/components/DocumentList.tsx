import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  message, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 

  Row,
  Col,
  Statistic,
  Avatar,
  Dropdown,
  Menu,
  Typography
} from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  MoreOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FilterOutlined,
  DownOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

const { Text } = Typography;

interface Document {
  id: number;
  docNumber: string;
  docType: 'SO' | 'EN' | 'SH';
  fileName: string;
  fileSize: number;
  uploadDate: string;
  xmlContent?: string;
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:3004/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDocuments(response.data.data);
        message.success(`โหลดเอกสาร ${response.data.data.length} รายการสำเร็จ`);
      } else {
        message.error('ไม่สามารถโหลดรายการเอกสารได้');
      }
    } catch (error: any) {
      console.error('Load documents error:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (record: Document) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:3004/api/documents/${record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedDocument({ ...record, xmlContent: response.data.data.xmlContent });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('View document error:', error);
      message.error('ไม่สามารถโหลดข้อมูลเอกสารได้');
    }
  };

  const handleDownloadDocument = async (record: Document) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:3004/api/documents/${record.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('ดาวน์โหลดสำเร็จ');
    } catch (error) {
      console.error('Download error:', error);
      message.error('ไม่สามารถดาวน์โหลดไฟล์ได้');
    }
  };

  const handleDeleteDocument = async (record: Document) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: `คุณต้องการลบเอกสาร "${record.fileName}" หรือไม่?`,
      okText: 'ลบ',
      cancelText: 'ยกเลิก',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          await axios.delete(`http://localhost:3004/api/documents/${record.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          message.success('ลบเอกสารสำเร็จ');
          loadDocuments(); // Reload list
        } catch (error) {
          console.error('Delete error:', error);
          message.error('ไม่สามารถลบเอกสารได้');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('กรุณาเลือกเอกสารที่ต้องการลบ');
      return;
    }

    Modal.confirm({
      title: 'ยืนยันการลบหลายรายการ',
      content: `คุณต้องการลบเอกสาร ${selectedRowKeys.length} รายการหรือไม่?`,
      okText: 'ลบทั้งหมด',
      cancelText: 'ยกเลิก',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          // Delete multiple documents
          await Promise.all(
            selectedRowKeys.map(id =>
              axios.delete(`http://localhost:3004/api/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          );

          message.success(`ลบเอกสาร ${selectedRowKeys.length} รายการสำเร็จ`);
          setSelectedRowKeys([]);
          loadDocuments();
        } catch (error) {
          console.error('Bulk delete error:', error);
          message.error('เกิดข้อผิดพลาดในการลบ');
        }
      }
    });
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'SO': return '#1890ff';
      case 'EN': return '#52c41a';
      case 'SH': return '#fa8c16';
      default: return '#d9d9d9';
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'SO': return 'Sales Order';
      case 'EN': return 'Enterprise';
      case 'SH': return 'Shipment';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchText.toLowerCase()) ||
                         doc.docNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || doc.docType === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    total: documents.length,
    so: documents.filter(d => d.docType === 'SO').length,
    en: documents.filter(d => d.docType === 'EN').length,
    sh: documents.filter(d => d.docType === 'SH').length,
  };

  const bulkMenu = (
    <Menu>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={handleBulkDelete}>
        ลบที่เลือก ({selectedRowKeys.length})
      </Menu.Item>
      <Menu.Item key="export" icon={<FileExcelOutlined />}>
        ส่งออกที่เลือก
      </Menu.Item>
    </Menu>
  );

  const columns: ColumnsType<Document> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'เอกสาร',
      key: 'document',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            style={{ 
              backgroundColor: getDocTypeColor(record.docType), 
              marginRight: 12,
              fontWeight: 'bold'
            }}
          >
            {record.docType}
          </Avatar>
          <div>
            <Text strong>{record.docNumber}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.fileName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'docType',
      key: 'docType',
      width: 120,
      render: (type: string) => (
        <Tag color={getDocTypeColor(type)} style={{ borderRadius: '12px' }}>
          {getDocTypeLabel(type)}
        </Tag>
      ),
      filters: [
        { text: 'Sales Order', value: 'SO' },
        { text: 'Enterprise', value: 'EN' },
        { text: 'Shipment', value: 'SH' },
      ],
      onFilter: (value, record) => record.docType === value,
    },
    {
      title: 'ขนาด',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => (
        <Text style={{ fontSize: '12px' }}>{formatFileSize(size)}</Text>
      ),
      sorter: (a, b) => a.fileSize - b.fileSize,
    },
    {
      title: 'วันที่อัพโหลด',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 160,
      render: (date: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4, color: '#999' }} />
          <Text style={{ fontSize: '12px' }}>{formatDate(date)}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime(),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="view" 
                icon={<EyeOutlined />}
                onClick={() => handleViewDocument(record)}
              >
                ดูเอกสาร
              </Menu.Item>
              <Menu.Item 
                key="download" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadDocument(record)}
              >
                ดาวน์โหลด
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteDocument(record)}
                style={{ color: '#ff4d4f' }}
              >
                ลบ
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="ทั้งหมด"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: '20px', color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Sales Order"
              value={stats.so}
              valueStyle={{ fontSize: '20px', color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Enterprise"
              value={stats.en}
              valueStyle={{ fontSize: '20px', color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Shipment"
              value={stats.sh}
              valueStyle={{ fontSize: '20px', color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>รายการเอกสาร XML</span>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {filteredDocuments.length} รายการ
            </Tag>
          </div>
        }
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Dropdown overlay={bulkMenu} trigger={['click']}>
                <Button>
                  จัดการที่เลือก <DownOutlined />
                </Button>
              </Dropdown>
            )}
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadDocuments}
              loading={loading}
            >
              รีเฟรช
            </Button>
          </Space>
        }
      >
        {/* Search and Filter Controls */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="ค้นหาชื่อไฟล์หรือเลขที่เอกสาร"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="เลือกประเภท"
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="SO">Sales Order</Option>
              <Option value="EN">Enterprise</Option>
              <Option value="SH">Shipment</Option>
            </Select>
          </Col>
        </Row>

        {/* Document Table */}
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            total: filteredDocuments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      {/* Document Preview Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {selectedDocument?.fileName}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            ปิด
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
          >
            ดาวน์โหลด
          </Button>
        ]}
        width={900}
      >
        {selectedDocument && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>เลขที่เอกสาร:</Text>
                <br />
                <Text>{selectedDocument.docNumber}</Text>
              </Col>
              <Col span={12}>
                <Text strong>ประเภท:</Text>
                <br />
                <Tag color={getDocTypeColor(selectedDocument.docType)}>
                  {getDocTypeLabel(selectedDocument.docType)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>ขนาดไฟล์:</Text>
                <br />
                <Text>{formatFileSize(selectedDocument.fileSize)}</Text>
              </Col>
              <Col span={12}>
                <Text strong>วันที่อัพโหลด:</Text>
                <br />
                <Text>{formatDate(selectedDocument.uploadDate)}</Text>
              </Col>
            </Row>

            {selectedDocument.xmlContent && (
              <div>
                <Text strong>เนื้อหา XML:</Text>
                <pre style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8,
                  overflow: 'auto',
                  maxHeight: 400,
                  border: '1px solid #d9d9d9',
                  fontSize: '12px',
                  marginTop: 8
                }}>
                  {selectedDocument.xmlContent}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentList;
