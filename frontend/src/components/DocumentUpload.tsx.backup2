import React, { useState } from 'react';
import {
  Upload,
  Card,
  Button,
  Select,
  Progress,

  Typography,
  Space,
  Row,
  Col,
  message,
  List,
  Tag,
  Divider,
  Statistic
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;
const { Option } = Select;
const { Title, Text } = Typography;

interface UploadResponse {
  success: boolean;
  message: string;
  document?: {
    id: number;
    docNumber: string;
    docType: string;
    fileName: string;
  };
}

const DocumentUpload: React.FC = () => {
  const [docType, setDocType] = useState<string>('SO');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });

  const uploadProps: UploadProps = {
    name: 'xmlFile',
    multiple: true,
    accept: '.xml',
    fileList,
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Validate file type
      const isXML = file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml');
      if (!isXML) {
        message.error(`${file.name} ไม่ใช่ไฟล์ XML`);
        return false;
      }

      // Validate file size (5MB max)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(`${file.name} ขนาดไฟล์ต้องไม่เกิน 5MB`);
        return false;
      }

      return false; // Prevent auto upload
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('กรุณาเลือกไฟล์ XML');
      return;
    }

    setUploading(true);
    setUploadStats({ total: fileList.length, success: 0, failed: 0 });

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    // Upload files sequentially
    for (const fileItem of fileList) {
      try {
        const formData = new FormData();
        formData.append('xmlFile', fileItem.originFileObj as File);
        formData.append('docType', docType);

        const response = await axios.post<UploadResponse>(
          'http://localhost:3004/api/documents/upload',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              
              // Update file status
              setFileList(prev => prev.map(file => 
                file.uid === fileItem.uid 
                  ? { ...file, percent: percentCompleted }
                  : file
              ));
            },
          }
        );

        if (response.data.success) {
          successCount++;
          setFileList(prev => prev.map(file => 
            file.uid === fileItem.uid 
              ? { ...file, status: 'done', response: response.data }
              : file
          ));
          
          message.success(`${fileItem.name} อัปโหลดสำเร็จ`);
        } else {
          failCount++;
          setFileList(prev => prev.map(file => 
            file.uid === fileItem.uid 
              ? { ...file, status: 'error', response: response.data }
              : file
          ));
          
          message.error(`${fileItem.name}: ${response.data.message}`);
        }
      } catch (error: any) {
        failCount++;
        console.error('Upload error:', error);
        
        setFileList(prev => prev.map(file => 
          file.uid === fileItem.uid 
            ? { ...file, status: 'error', response: { message: 'อัปโหลดไม่สำเร็จ' } }
            : file
        ));
        
        const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด';
        message.error(`${fileItem.name}: ${errorMessage}`);
      }

      // Update stats
      setUploadStats({
        total: fileList.length,
        success: successCount,
        failed: failCount
      });
    }

    setUploading(false);

    // Show summary
    if (successCount > 0) {
      message.success(`อัปโหลดสำเร็จ ${successCount} ไฟล์`);
    }
    if (failCount > 0) {
      message.error(`อัปโหลดไม่สำเร็จ ${failCount} ไฟล์`);
    }
  };

  const clearAll = () => {
    setFileList([]);
    setUploadStats({ total: 0, success: 0, failed: 0 });
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

  return (
    <div>
      {/* Header */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={2} style={{ marginBottom: 8 }}>
            📤 อัปโหลดเอกสาร XML
          </Title>
          <Text type="secondary">
            อัปโหลดไฟล์ XML สำหรับระบบจัดการเอกสาร PKT
          </Text>
        </Col>
      </Row>

      {/* Statistics */}
      {uploadStats.total > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="ทั้งหมด"
                value={uploadStats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="สำเร็จ"
                value={uploadStats.success}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="ไม่สำเร็จ"
                value={uploadStats.failed}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Upload Configuration */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UploadOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            การตั้งค่าการอัปโหลด
          </div>
        }
        style={{ marginBottom: 24 }}
        size="small"
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>ประเภทเอกสาร:</Text>
              <Select
                value={docType}
                onChange={setDocType}
                style={{ width: 200 }}
              >
                <Option value="SO">
                  <Tag color={getDocTypeColor('SO')}>SO - Sales Order</Tag>
                </Option>
                <Option value="EN">
                  <Tag color={getDocTypeColor('EN')}>EN - Enterprise</Tag>
                </Option>
                <Option value="SH">
                  <Tag color={getDocTypeColor('SH')}>SH - Shipment</Tag>
                </Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                loading={uploading}
                disabled={fileList.length === 0}
              >
                {uploading ? 'กำลังอัปโหลด...' : `อัปโหลด ${fileList.length} ไฟล์`}
              </Button>
              {fileList.length > 0 && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={clearAll}
                  disabled={uploading}
                >
                  ล้างทั้งหมด
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Upload Area */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InboxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            เลือกไฟล์ XML
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        <Dragger {...uploadProps} style={{ padding: '40px 20px' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 16 }}>
            ลากไฟล์ XML มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </p>
          <p className="ant-upload-hint" style={{ color: '#999' }}>
            รองรับไฟล์ XML เท่านั้น ขนาดไม่เกิน 5MB ต่อไฟล์
          </p>
        </Dragger>

        {/* File List */}
        {fileList.length > 0 && (
          <>
            <Divider orientation="left">
              <Text strong>ไฟล์ที่เลือก ({fileList.length} ไฟล์)</Text>
            </Divider>
            
            <List
              dataSource={fileList}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    file.status === 'done' && (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        size="small"
                      >
                        ดูเอกสาร
                      </Button>
                    ),
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => {
                        const index = fileList.indexOf(file);
                        const newFileList = fileList.slice();
                        newFileList.splice(index, 1);
                        setFileList(newFileList);
                      }}
                      disabled={uploading}
                    >
                      ลบ
                    </Button>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 8, 
                        backgroundColor: getDocTypeColor(docType), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {docType}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong>{file.name}</Text>
                        {file.status === 'done' && (
                          <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                        )}
                        {file.status === 'error' && (
                          <ExclamationCircleOutlined style={{ color: '#f5222d', marginLeft: 8 }} />
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">
                          {formatFileSize(file.size || 0)} • {getDocTypeLabel(docType)}
                        </Text>
                        {file.percent !== undefined && file.percent < 100 && (
                          <Progress 
                            percent={file.percent} 
                            size="small" 
                            style={{ marginTop: 4 }}
                          />
                        )}
                        {file.status === 'error' && file.response && (
                          <Text type="danger" style={{ display: 'block', fontSize: '12px' }}>
                            {file.response.message || 'อัปโหลดไม่สำเร็จ'}
                          </Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>

      {/* Help Information */}
      <Card 
        title="📚 ข้อมูลประเภทเอกสาร" 
        size="small"
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Space align="start">
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: getDocTypeColor('SO'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                SO
              </div>
              <div>
                <Text strong>Sales Order</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  เอกสารใบสั่งซื้อจากลูกค้า
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: getDocTypeColor('EN'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                EN
              </div>
              <div>
                <Text strong>Enterprise</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  เอกสารข้อมูลองค์กรและบริษัท
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: getDocTypeColor('SH'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                SH
              </div>
              <div>
                <Text strong>Shipment</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  เอกสารการจัดส่งและขนส่ง
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DocumentUpload;
