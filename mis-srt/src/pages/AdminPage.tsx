import { useState } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Input, Select, Popconfirm, Typography, Row, Col, Card, Statistic, message } from 'antd'
import { PlusOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import type { User, UserRole } from '../types'

const { Title } = Typography

const roles: UserRole[] = ['ผู้เช่า','เจ้าหน้าที่รับคำร้อง','เจ้าหน้าที่ภาคสนาม','เจ้าหน้าที่การเงิน','เจ้าหน้าที่สัญญา','ผู้อนุมัติ','ผู้บริหาร','Admin']

const health = [
  { label: 'CPU Usage', value: '23%', color: '#27AE60' },
  { label: 'Memory', value: '45%', color: '#F39C12' },
  { label: 'Storage', value: '67%', color: '#E67E22' },
  { label: 'System Uptime', value: '99.95%', color: '#27AE60' },
]

export default function AdminPage() {
  const { users, setUsers } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const openAdd = () => { setEditUser(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (u: User) => { setEditUser(u); form.setFieldsValue(u); setModalOpen(true) }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editUser) {
        setUsers(users.map(u => u.id === editUser.id ? { ...u, ...values } : u))
        message.success('แก้ไขผู้ใช้สำเร็จ')
      } else {
        const newUser: User = { id: `u${Date.now()}`, status: 'Active', lastLogin: '-', ...values }
        setUsers([...users, newUser])
        message.success('เพิ่มผู้ใช้สำเร็จ')
      }
      setModalOpen(false)
    } catch {}
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id))
    message.success('ลบผู้ใช้สำเร็จ')
  }

  const toggleLock = (u: User) => {
    setUsers(users.map(x => x.id === u.id ? { ...x, status: x.status === 'Active' ? 'Locked' : 'Active' } : x))
    message.success(u.status === 'Active' ? 'ล็อคบัญชีสำเร็จ' : 'ปลดล็อคบัญชีสำเร็จ')
  }

  const cols = [
    { title: 'ชื่อ', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'อีเมล', dataIndex: 'email', key: 'email' },
    { title: 'บทบาท', dataIndex: 'role', key: 'role', width: 180, render: (r: string) => <Tag color="blue">{r}</Tag> },
    { title: 'แผนก', dataIndex: 'department', key: 'department', width: 120 },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'red'}>{s}</Tag> },
    { title: 'เข้าใช้ล่าสุด', dataIndex: 'lastLogin', key: 'lastLogin', width: 160 },
    {
      title: 'การดำเนินการ', key: 'action', width: 220, render: (_: unknown, r: User) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>แก้ไข</Button>
          <Button size="small" icon={r.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleLock(r)}>
            {r.status === 'Active' ? 'ล็อค' : 'ปลดล็อค'}
          </Button>
          <Popconfirm title="ยืนยันลบผู้ใช้?" onConfirm={() => handleDelete(r.id)} okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
            <Button size="small" danger>ลบ</Button>
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50' }}>การจัดการระบบ</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {health.map(h => (
          <Col xs={12} sm={6} key={h.label}>
            <Card><Statistic title={h.label} value={h.value} valueStyle={{ color: h.color }} /></Card>
          </Col>
        ))}
      </Row>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>การจัดการผู้ใช้งาน</Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#C0392B' }} onClick={openAdd}>เพิ่มผู้ใช้</Button>
      </div>
      <Table dataSource={users} columns={cols} rowKey="id" scroll={{ x: 1000 }} />

      <Modal
        title={editUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#C0392B' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อ-นามสกุล" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}><Input /></Form.Item>
          <Form.Item name="email" label="อีเมล" rules={[{ required: true, type: 'email', message: 'กรุณากรอกอีเมล' }]}><Input /></Form.Item>
          <Form.Item name="role" label="บทบาท" rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}>
            <Select options={roles.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="department" label="แผนก" rules={[{ required: true, message: 'กรุณากรอกแผนก' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="เบอร์โทรศัพท์"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
