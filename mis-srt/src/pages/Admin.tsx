import { useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Select, Tag, Switch, Typography, Row, Col, Statistic, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { User, UserRole } from '../types';

const { Title } = Typography;

const roles: UserRole[] = ['ผู้เช่า','เจ้าหน้าที่รับคำร้อง','เจ้าหน้าที่ภาคสนาม','เจ้าหน้าที่การเงิน','เจ้าหน้าที่สัญญา','ผู้อนุมัติ','ผู้บริหาร','Admin'];

const roleColor: Record<UserRole, string> = {
  'ผู้เช่า': 'default', 'เจ้าหน้าที่รับคำร้อง': 'blue', 'เจ้าหน้าที่ภาคสนาม': 'geekblue',
  'เจ้าหน้าที่การเงิน': 'gold', 'เจ้าหน้าที่สัญญา': 'cyan', 'ผู้อนุมัติ': 'orange',
  'ผู้บริหาร': 'purple', 'Admin': 'red',
};

const systemHealth = [
  { label: 'CPU Usage', value: '23%', color: '#27AE60' },
  { label: 'Memory', value: '61%', color: '#E67E22' },
  { label: 'Disk', value: '42%', color: '#27AE60' },
  { label: 'Uptime', value: '99.95%', color: '#27AE60' },
  { label: 'Avg Response', value: '180ms', color: '#27AE60' },
  { label: 'Error Rate', value: '0.02%', color: '#27AE60' },
];

export default function Admin() {
  const { users, setUsers } = useApp();
  const [modal, setModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [form] = Form.useForm();

  const openAdd = () => { form.resetFields(); setModal({ open: true, user: null }); };
  const openEdit = (u: User) => { form.setFieldsValue(u); setModal({ open: true, user: u }); };

  const handleSave = (values: any) => {
    if (modal.user) {
      setUsers(prev => prev.map(u => u.id === modal.user!.id ? { ...u, ...values } : u));
      message.success('อัปเดตข้อมูลผู้ใช้สำเร็จ');
    } else {
      setUsers(prev => [...prev, { ...values, id: `u${Date.now()}`, status: 'Active', lastLogin: '-' }]);
      message.success('เพิ่มผู้ใช้งานสำเร็จ');
    }
    setModal({ open: false, user: null });
  };

  const toggleLock = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Locked' : 'Active';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    message.success(`${newStatus === 'Locked' ? 'ล็อค' : 'ปลดล็อค'}บัญชีสำเร็จ`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    message.success('ลบผู้ใช้งานสำเร็จ');
  };

  const columns = [
    { title: 'ชื่อ', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'โทรศัพท์', dataIndex: 'phone', key: 'phone' },
    { title: 'บทบาท', dataIndex: 'role', key: 'role', render: (v: UserRole) => <Tag color={roleColor[v]}>{v}</Tag> },
    { title: 'หน่วยงาน', dataIndex: 'department', key: 'department' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'Active' ? 'green' : 'red'}>{v}</Tag> },
    { title: 'เข้าสู่ระบบล่าสุด', dataIndex: 'lastLogin', key: 'lastLogin' },
    {
      title: 'Action', key: 'action',
      render: (_: unknown, u: User) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(u)}>แก้ไข</Button>
          <Button size="small" icon={u.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
            danger={u.status === 'Active'}
            style={u.status !== 'Active' ? { color: '#27AE60', borderColor: '#27AE60' } : {}}
            onClick={() => toggleLock(u.id, u.status)}>
            {u.status === 'Active' ? 'ล็อค' : 'ปลดล็อค'}
          </Button>
          <Popconfirm title="ยืนยันการลบผู้ใช้งาน?" onConfirm={() => deleteUser(u.id)} okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: '#2C3E50' }}>ผู้ใช้งาน / สิทธิ์ (Admin)</Title>

      {/* System Health */}
      <Card title={<><ThunderboltOutlined /> System Health</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {systemHealth.map(s => (
            <Col span={4} key={s.label}>
              <Statistic title={s.label} value={s.value} valueStyle={{ color: s.color, fontSize: 20 }} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={`ผู้ใช้งานทั้งหมด (${users.length} คน)`}
        extra={<Button type="primary" icon={<PlusOutlined />} style={{ background: '#C0392B', borderColor: '#C0392B' }} onClick={openAdd}>เพิ่มผู้ใช้งาน</Button>}
      >
        <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
      </Card>

      <Modal
        title={modal.user ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}
        open={modal.open}
        onCancel={() => setModal({ open: false, user: null })}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="ชื่อ-นามสกุล" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="โทรศัพท์">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="บทบาท" rules={[{ required: true }]}>
            <Select options={roles.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="department" label="หน่วยงาน" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" style={{ background: '#C0392B', borderColor: '#C0392B' }}>บันทึก</Button>
            <Button onClick={() => setModal({ open: false, user: null })}>ยกเลิก</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
