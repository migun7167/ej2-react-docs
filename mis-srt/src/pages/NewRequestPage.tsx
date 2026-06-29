import React, { useState } from 'react';
import {
  Steps, Card, Form, Input, InputNumber, Select, Button, Space,
  Row, Col, Upload, Descriptions, message, Typography
} from 'antd';
import {
  FileAddOutlined, EditOutlined, FolderOutlined, CheckCircleOutlined,
  UploadOutlined, HomeOutlined, SwapOutlined, StopOutlined, UserSwitchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { RequestType } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const requestTypes = [
  { type: 'ขอเช่าใหม่' as RequestType, icon: <HomeOutlined />, desc: 'ขอเช่าพื้นที่ใหม่จากการรถไฟฯ' },
  { type: 'ต่อสัญญา' as RequestType, icon: <FileAddOutlined />, desc: 'ขอต่ออายุสัญญาเช่าที่มีอยู่' },
  { type: 'โอนสิทธิ์' as RequestType, icon: <UserSwitchOutlined />, desc: 'โอนสิทธิ์การเช่าให้ผู้อื่น' },
  { type: 'ยกเลิก' as RequestType, icon: <StopOutlined />, desc: 'ขอยกเลิกสัญญาเช่า' },
  { type: 'เปลี่ยนข้อมูล' as RequestType, icon: <EditOutlined />, desc: 'ขอเปลี่ยนแปลงข้อมูลสัญญา' },
];

const requiredDocs = [
  'สำเนาบัตรประชาชน',
  'สำเนาทะเบียนบ้าน',
  'หนังสือรับรองบริษัท',
  'แผนที่แสดงที่ตั้ง',
  'รูปถ่ายพื้นที่',
];

export default function NewRequestPage() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());
  const [form] = Form.useForm();
  const { addRequest, currentUser } = useApp();
  const navigate = useNavigate();

  const handleSaveDraft = () => {
    const values = form.getFieldsValue();
    addRequest({
      id: `r${Date.now()}`,
      requestNo: `SRT-2026-${String(Date.now()).slice(-4)}`,
      type: selectedType || 'ขอเช่าใหม่',
      status: 'Draft',
      tenantName: values.tenantName || '',
      tenantId: values.tenantId || '',
      location: values.location || '',
      area: values.area || 0,
      monthlyRent: values.monthlyRent || 0,
      submittedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      urgency: 'ปกติ',
      assignedTo: undefined,
      documents: requiredDocs.map((name, i) => ({ id: `d${i}`, name, status: 'Missing' as any })),
      timeline: [{ id: 't1', date: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'Draft' as const, actor: currentUser?.name || '', note: 'บันทึกร่าง' }],
      auditLogs: [],
      notes: values.notes || '',
    });
    message.success('บันทึกร่างแล้ว');
    navigate('/requests');
  };

  const handleSubmit = () => {
    addRequest({
      id: `r${Date.now()}`,
      requestNo: `SRT-2026-${String(Date.now()).slice(-4)}`,
      type: selectedType || 'ขอเช่าใหม่',
      status: 'Submitted',
      tenantName: formData.tenantName || '',
      tenantId: formData.tenantId || '',
      location: formData.location || '',
      area: formData.area || 0,
      monthlyRent: formData.monthlyRent || 0,
      submittedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      urgency: 'ปกติ',
      assignedTo: undefined,
      documents: requiredDocs.map((name, i) => ({
        id: `d${i}`, name, status: (uploadedDocs.has(name) ? 'Pending Review' : 'Missing') as any
      })),
      timeline: [{ id: 't1', date: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'Submitted' as const, actor: currentUser?.name || '', note: 'ส่งคำร้อง' }],
      auditLogs: [],
      notes: formData.notes || '',
    });
    message.success('ส่งคำร้องสำเร็จ');
    navigate('/requests');
  };

  const steps = [
    {
      title: 'ประเภทคำร้อง',
      icon: <FileAddOutlined />,
      content: (
        <Row gutter={[16, 16]} justify="center">
          {requestTypes.map(rt => (
            <Col key={rt.type} xs={24} sm={12} md={8}>
              <Card
                hoverable
                onClick={() => setSelectedType(rt.type)}
                style={{
                  border: selectedType === rt.type ? '2px solid #C0392B' : '1px solid #d9d9d9',
                  textAlign: 'center', cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 32, color: '#C0392B', marginBottom: 8 }}>{rt.icon}</div>
                <Title level={5}>{rt.type}</Title>
                <Text type="secondary">{rt.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      title: 'ข้อมูลผู้เช่า',
      icon: <EditOutlined />,
      content: (
        <Form form={form} layout="vertical" onValuesChange={(_, all) => setFormData(all)}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tenantName" label="ชื่อ-นามสกุล / ชื่อบริษัท" rules={[{ required: true }]}>
                <Input placeholder="ชื่อผู้เช่า" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tenantId" label="เลขบัตรประชาชน / เลขทะเบียน" rules={[{ required: true }]}>
                <Input placeholder="1234567890123" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="เบอร์โทร">
                <Input placeholder="08X-XXX-XXXX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="อีเมล">
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="location" label="สถานที่ / ที่ตั้งพื้นที่" rules={[{ required: true }]}>
                <Input placeholder="สถานี / ชั้น / ร้านค้า" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="area" label="พื้นที่ (ตร.ม.)">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyRent" label="ค่าเช่าที่ต้องการ/เดือน (บาท)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="หมายเหตุ">
                <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      title: 'เอกสาร',
      icon: <FolderOutlined />,
      content: (
        <div>
          {requiredDocs.map(doc => (
            <div key={doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Text>{doc}</Text>
              <Upload
                beforeUpload={() => { setUploadedDocs(prev => new Set([...prev, doc])); message.success(`อัปโหลด ${doc} สำเร็จ`); return false; }}
                showUploadList={false}
              >
                <Button size="small" icon={<UploadOutlined />} type={uploadedDocs.has(doc) ? 'primary' : 'default'}>
                  {uploadedDocs.has(doc) ? 'อัปโหลดแล้ว' : 'อัปโหลด'}
                </Button>
              </Upload>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'สรุป',
      icon: <CheckCircleOutlined />,
      content: (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="ประเภทคำร้อง">{selectedType}</Descriptions.Item>
          <Descriptions.Item label="ผู้เช่า">{formData.tenantName}</Descriptions.Item>
          <Descriptions.Item label="เลขประจำตัว">{formData.tenantId}</Descriptions.Item>
          <Descriptions.Item label="สถานที่">{formData.location}</Descriptions.Item>
          <Descriptions.Item label="พื้นที่">{formData.area} ตร.ม.</Descriptions.Item>
          <Descriptions.Item label="ค่าเช่า/เดือน">{formData.monthlyRent?.toLocaleString()} บาท</Descriptions.Item>
          <Descriptions.Item label="เอกสารที่อัปโหลด" span={2}>{uploadedDocs.size} / {requiredDocs.length} รายการ</Descriptions.Item>
          <Descriptions.Item label="หมายเหตุ" span={2}>{formData.notes || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  const handleNext = async () => {
    if (step === 1) {
      try {
        await form.validateFields();
      } catch {
        return;
      }
    }
    if (step === 0 && !selectedType) {
      message.warning('กรุณาเลือกประเภทคำร้อง');
      return;
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>สร้างคำร้องใหม่</Title>
      <Steps current={step} style={{ marginBottom: 32 }}
        items={steps.map(s => ({ title: s.title, icon: s.icon }))} />
      <Card style={{ marginBottom: 24 }}>
        {steps[step].content}
      </Card>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {step > 0 && <Button onClick={() => setStep(s => s - 1)}>ย้อนกลับ</Button>}
          <Button onClick={handleSaveDraft}>บันทึกร่าง</Button>
        </Space>
        {step < steps.length - 1 ? (
          <Button type="primary" onClick={handleNext} style={{ background: '#C0392B', borderColor: '#C0392B' }}>
            ถัดไป
          </Button>
        ) : (
          <Button type="primary" onClick={handleSubmit} style={{ background: '#C0392B', borderColor: '#C0392B' }}>
            ส่งคำร้อง
          </Button>
        )}
      </div>
    </div>
  );
}
