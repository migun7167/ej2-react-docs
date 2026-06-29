import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Descriptions, Tabs, Timeline, Table, Modal, Input, Space, Typography, message, Upload, Row, Col, Card } from 'antd'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import type { RequestStatus } from '../types'

const { Title, Text } = Typography
const { TextArea } = Input

const statusColor: Record<string, string> = {
  'Draft': 'default', 'Submitted': 'blue', 'Missing Documents': 'orange', 'Under Review': 'purple',
  'Field Inspection': 'cyan', 'Price Evaluation': 'geekblue', 'Waiting Approval': 'volcano',
  'Waiting Payment': 'gold', 'Paid': 'lime', 'Contracting': 'blue', 'Active': 'green',
  'Overdue': 'red', 'Completed': 'green', 'Cancelled': 'default',
}

const docStatusColor: Record<string, string> = {
  'Missing': 'red', 'Invalid': 'orange', 'Expired': 'gold', 'Unreadable': 'purple',
  'Mismatch': 'volcano', 'Pending Review': 'blue', 'Accepted': 'green',
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { requests, updateRequest, currentUser } = useApp()
  const navigate = useNavigate()
  const [returnModal, setReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  const req = requests.find(r => r.id === id)
  if (!req) return <div><Button onClick={() => navigate('/requests')} icon={<ArrowLeftOutlined />}>กลับ</Button><Text>ไม่พบคำร้อง</Text></div>

  const doTransition = (newStatus: RequestStatus, note: string) => {
    updateRequest(req.id, {
      status: newStatus,
      updatedAt: new Date().toISOString().slice(0,10),
      timeline: [...req.timeline, { id: `t${Date.now()}`, date: new Date().toLocaleString('th-TH'), status: newStatus, actor: currentUser?.name || 'ระบบ', note }],
      auditLogs: [...req.auditLogs, { id: `a${Date.now()}`, date: new Date().toLocaleString('th-TH'), action: 'STATUS_CHANGE', actor: currentUser?.name || 'ระบบ', detail: `${req.status} → ${newStatus}: ${note}` }],
    })
    message.success(`สถานะเปลี่ยนเป็น: ${newStatus}`)
  }

  const handleReturn = () => {
    doTransition('Missing Documents', returnReason || 'ส่งกลับให้แก้ไข')
    setReturnModal(false)
    setReturnReason('')
  }

  const actionButtons = () => {
    const s = req.status
    const btns = []
    if (s === 'Submitted') {
      btns.push(<Button key="review" type="primary" style={{ background: '#2980B9' }} onClick={() => doTransition('Under Review', 'รับคำร้องและตรวจสอบ')}>ตรวจสอบเอกสาร</Button>)
      btns.push(<Button key="ret" danger onClick={() => setReturnModal(true)}>ส่งกลับ</Button>)
    }
    if (s === 'Under Review') {
      btns.push(<Button key="field" onClick={() => doTransition('Field Inspection', 'ส่งตรวจพื้นที่')}>ส่งตรวจพื้นที่</Button>)
      btns.push(<Button key="price" onClick={() => doTransition('Price Evaluation', 'ส่งประเมินราคา')}>ประเมินราคา</Button>)
      btns.push(<Button key="ret" danger onClick={() => setReturnModal(true)}>ส่งกลับ</Button>)
    }
    if (s === 'Field Inspection') btns.push(<Button key="r" type="primary" onClick={() => doTransition('Price Evaluation', 'รายงานผลตรวจพื้นที่')}>รายงานผลตรวจ</Button>)
    if (s === 'Price Evaluation') btns.push(<Button key="r" type="primary" style={{ background: '#E67E22' }} onClick={() => doTransition('Waiting Approval', 'ส่งอนุมัติ')}>ส่งอนุมัติ</Button>)
    if (s === 'Waiting Approval') {
      btns.push(<Button key="ok" type="primary" style={{ background: '#27AE60' }} onClick={() => doTransition('Waiting Payment', 'อนุมัติแล้ว')}>อนุมัติ</Button>)
      btns.push(<Button key="no" danger onClick={() => doTransition('Cancelled', 'ไม่อนุมัติ')}>ไม่อนุมัติ</Button>)
    }
    if (s === 'Waiting Payment') btns.push(<Button key="r" type="primary" onClick={() => doTransition('Paid', 'ยืนยันการชำระ')}>ยืนยันการชำระ</Button>)
    if (s === 'Paid') btns.push(<Button key="r" type="primary" onClick={() => doTransition('Contracting', 'เริ่มทำสัญญา')}>ทำสัญญา</Button>)
    if (s === 'Contracting') btns.push(<Button key="r" type="primary" style={{ background: '#27AE60' }} onClick={() => doTransition('Active', 'เริ่มสัญญา')}>เริ่มสัญญา</Button>)
    return btns
  }

  const docCols = [
    { title: 'เอกสาร', dataIndex: 'name', key: 'name' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={docStatusColor[s] || 'default'}>{s}</Tag> },
    { title: 'วันที่อัปโหลด', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (v: string) => v || '-' },
    { title: 'หมายเหตุ', dataIndex: 'note', key: 'note', render: (v: string) => v || '-' },
    { title: 'การดำเนินการ', key: 'action', render: (_: unknown, r: { name: string; status: string }) => (
      <Space>
        <Upload showUploadList={false} beforeUpload={() => { message.success(`อัปโหลด ${r.name} สำเร็จ`); return false }}>
          <Button size="small" icon={<UploadOutlined />}>อัปโหลด</Button>
        </Upload>
        {r.status === 'Accepted' && <Button size="small">ดูเอกสาร</Button>}
      </Space>
    ) },
  ]

  const auditCols = [
    { title: 'วันที่', dataIndex: 'date', key: 'date', width: 160 },
    { title: 'การกระทำ', dataIndex: 'action', key: 'action', width: 120 },
    { title: 'ผู้ดำเนินการ', dataIndex: 'actor', key: 'actor', width: 160 },
    { title: 'รายละเอียด', dataIndex: 'detail', key: 'detail' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/requests')}>กลับ</Button>
          <Title level={4} style={{ margin: 0 }}>{req.requestNo}</Title>
          <Tag color={statusColor[req.status] || 'default'}>{req.status}</Tag>
          <Tag color={req.urgency === 'เร่งด่วน' ? 'red' : req.urgency === 'ใกล้ครบกำหนด' ? 'gold' : 'green'}>{req.urgency}</Tag>
        </Space>
        <Space>{actionButtons()}</Space>
      </div>

      <Tabs items={[
        {
          key: '1', label: 'ข้อมูลคำร้อง', children: (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ประเภทคำร้อง">{req.type}</Descriptions.Item>
              <Descriptions.Item label="ผู้เช่า">{req.tenantName}</Descriptions.Item>
              <Descriptions.Item label="เลขบัตร/ทะเบียน">{req.tenantId}</Descriptions.Item>
              <Descriptions.Item label="สถานที่" span={2}>{req.location}</Descriptions.Item>
              <Descriptions.Item label="พื้นที่">{req.area} ตร.ม.</Descriptions.Item>
              <Descriptions.Item label="ค่าเช่า/เดือน">฿{req.monthlyRent.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="วันที่ยื่น">{req.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="อัปเดตล่าสุด">{req.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="ผู้รับผิดชอบ">{req.assignedTo || '-'}</Descriptions.Item>
              <Descriptions.Item label="หมายเหตุ" span={2}>{req.notes || '-'}</Descriptions.Item>
            </Descriptions>
          )
        },
        {
          key: '2', label: 'เอกสาร', children: (
            <Table dataSource={req.documents} columns={docCols} rowKey="id" pagination={false} />
          )
        },
        {
          key: '3', label: 'ไทม์ไลน์', children: (
            <Timeline mode="left" items={req.timeline.map(t => ({
              label: t.date,
              children: <Card size="small"><Text strong>{t.status}</Text><br /><Text type="secondary">{t.actor}: {t.note}</Text></Card>,
              color: statusColor[t.status]?.includes('red') ? 'red' : 'blue',
            }))} />
          )
        },
        {
          key: '4', label: 'บันทึกการตรวจสอบ', children: (
            <Table dataSource={req.auditLogs} columns={auditCols} rowKey="id" pagination={false} />
          )
        },
      ]} />

      <Modal title="ส่งกลับพร้อมเหตุผล" open={returnModal} onOk={handleReturn} onCancel={() => setReturnModal(false)} okText="ยืนยัน" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
        <Text>กรุณาระบุเหตุผลในการส่งกลับ:</Text>
        <TextArea rows={4} value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="เหตุผล..." style={{ marginTop: 8 }} />
      </Modal>
    </div>
  )
}
