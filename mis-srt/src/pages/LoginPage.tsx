import { useState } from 'react'
import { Form, Input, Button, Select, Card, Typography, Steps, Alert, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import type { UserRole } from '../types'

const { Title, Text } = Typography
const roles: UserRole[] = ['ผู้เช่า','เจ้าหน้าที่รับคำร้อง','เจ้าหน้าที่ภาคสนาม','เจ้าหน้าที่การเงิน','เจ้าหน้าที่สัญญา','ผู้อนุมัติ','ผู้บริหาร','Admin']

export default function LoginPage() {
  const [step, setStep] = useState(0)
  const [loginData, setLoginData] = useState<{ username: string; role: UserRole }>({ username: '', role: 'Admin' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const { setCurrentUser } = useApp()
  const navigate = useNavigate()

  const handleLogin = (values: { username: string; password: string; role: UserRole }) => {
    setLoginData({ username: values.username, role: values.role })
    setStep(1)
  }

  const handleOtp = () => {
    if (otp !== '123456') {
      message.error('รหัส OTP ไม่ถูกต้อง กรุณาใช้ 123456')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setCurrentUser({ id: 'u1', name: loginData.username || 'ผู้ใช้งาน', role: loginData.role, email: `${loginData.username}@srt.or.th` })
      message.success('เข้าสู่ระบบสำเร็จ')
      navigate('/dashboard')
    }, 500)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #C0392B 0%, #2C3E50 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#C0392B', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>🚂 การรถไฟแห่งประเทศไทย</Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>ระบบบริหารจัดการทรัพย์สิน (MIS)</Text>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <Steps current={step} items={[{ title: 'เข้าสู่ระบบ' }, { title: 'ยืนยัน OTP' }]} style={{ marginBottom: 24 }} />
          {step === 0 ? (
            <>
              <Title level={4} style={{ textAlign: 'center', color: '#C0392B', marginBottom: 24 }}>เข้าสู่ระบบ</Title>
              <Alert message="ระบบสาธิต: ใส่ข้อมูลใดก็ได้" type="info" showIcon style={{ marginBottom: 16 }} />
              <Form layout="vertical" onFinish={handleLogin} initialValues={{ role: 'Admin' }}>
                <Form.Item name="username" label="ชื่อผู้ใช้" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
                  <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" size="large" />
                </Form.Item>
                <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" />
                </Form.Item>
                <Form.Item name="role" label="บทบาท" rules={[{ required: true }]}>
                  <Select size="large" options={roles.map(r => ({ value: r, label: r }))} />
                </Form.Item>
                <Button type="primary" htmlType="submit" block size="large" style={{ background: '#C0392B', borderColor: '#C0392B' }}>
                  เข้าสู่ระบบ
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Title level={4} style={{ textAlign: 'center', color: '#C0392B', marginBottom: 24 }}>ยืนยัน OTP</Title>
              <Alert message="รหัส OTP สาธิต: 123456" type="warning" showIcon style={{ marginBottom: 16 }} />
              <Text type="secondary">ระบบส่ง OTP ไปยังโทรศัพท์ของคุณแล้ว</Text>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="กรอกรหัส OTP 6 หลัก"
                size="large"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                style={{ margin: '16px 0' }}
              />
              <Button type="primary" block size="large" loading={loading} onClick={handleOtp} style={{ background: '#C0392B', borderColor: '#C0392B' }}>
                ยืนยัน OTP
              </Button>
              <Button type="link" block onClick={() => setStep(0)} style={{ marginTop: 8 }}>ย้อนกลับ</Button>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
