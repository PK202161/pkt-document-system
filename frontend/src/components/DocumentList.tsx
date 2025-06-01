import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Tag, Input, Select, DatePicker, Modal } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;

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

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://172.16.2.12:3004/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDocuments(response.data.data);
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

  const handleViewDocument = (record: Document) => {
    setSelectedDocument(record);
    setModalVisible(true);
  };

  const handleDownloadDocument = async (record: Document) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://172.16.2.12:3004/api/documents/${record.id}/download`, {
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
          const token = localStorage.getItem('token');
          await axios.delete(`http://172.16.2.12:3004/api/documents/${record.id}`, {
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

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'SO': return 'blue';
      case 'EN': return 'green';
      case 'SH': return 'orange';
      default: return 'default';
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

  const columns: ColumnsType<Document> = [
    {
      title: 'เลขที่เอกสาร',
      dataIndex: 'docNumber',
      key: 'docNumber',
      sorter: (a, b) => a.docNumber.localeCompare(b.docNumber),
    },
    {
      title: 'ประเภท',
      dataIndex: 'docType',
      key: 'docType',
      render: (type: string) => (
        <Tag color={getDocTypeColor(type)}>
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
      title: 'ชื่อไฟล์',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
    },
    {
      title: 'ขนาดไฟล์',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size),
      sorter: (a, b) => a.fileSize - b.fileSize,
    },
    {
      title: 'วันที่อัพโหลด',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime(),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDocument(record)}
          >
            ดู
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownloadDocument(record)}
          >
            ดาวน์โหลด
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteDocument(record)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="📄 รายการเอกสาร XML" 
      extra={
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={loadDocuments}
          loading={loading}
        >
          รีเฟรช
        </Button>
      }
    >
      {/* Search and Filter Controls */}
      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input
          placeholder="ค้นหาชื่อไฟล์หรือเลขที่เอกสาร"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        
        <Select
          placeholder="เลือกประเภทเอกสาร"
          value={filterType}
          onChange={setFilterType}
          style={{ width: 200 }}
        >
          <Option value="all">ทั้งหมด</Option>
          <Option value="SO">Sales Order</Option>
          <Option value="EN">Enterprise</Option>
          <Option value="SH">Shipment</Option>
        </Select>
      </Space>

      {/* Document Table */}
      <Table
        columns={columns}
        dataSource={filteredDocuments}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredDocuments.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
        }}
        scroll={{ x: 800 }}
      />

      {/* Document Preview Modal */}
      <Modal
        title={`ดูเอกสาร: ${selectedDocument?.fileName}`}
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
        width={800}
      >
        {selectedDocument && (
          <div>
            <p><strong>เลขที่เอกสาร:</strong> {selectedDocument.docNumber}</p>
            <p><strong>ประเภท:</strong> 
              <Tag color={getDocTypeColor(selectedDocument.docType)} style={{ marginLeft: 8 }}>
                {getDocTypeLabel(selectedDocument.docType)}
              </Tag>
            </p>
            <p><strong>ขนาดไฟล์:</strong> {formatFileSize(selectedDocument.fileSize)}</p>
            <p><strong>วันที่อัพโหลด:</strong> {formatDate(selectedDocument.uploadDate)}</p>
            
            {selectedDocument.xmlContent && (
              <div style={{ marginTop: 16 }}>
                <strong>เนื้อหา XML:</strong>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 4, 
                  overflow: 'auto',
                  maxHeight: 300
                }}>
                  {selectedDocument.xmlContent}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default DocumentList;
