import { useState } from 'react'
import { Table, Tag, Button, Select, Space, Modal, Descriptions, message, Typography, Row, Col } from 'antd'
import { useApp } from '../contexts/AppContext'
import type { Request, RequestStatus } from '../types'

const { Title } = Typography

const urgencyColor = { 'เร่งด่วน': 'red', 'ใกล้ครบกำหนด': 'gold', 'ปกติ': 'green' } as const
const statusColor: Record<string, string> = {
  'Submitted': 'blue', 'Under Review': 'purple', 'Active': 'green', 'Overdue': 'red',
  'Missing Documents': 'orange', 'Waiting Approval': 'volcano', 'Draft': 'default',
  'Field Inspection': 'cyan', 'Price Evaluation': 'geekblue', 'Waiting Payment': 'gold',
  'Paid': 'lime', 'Contracting': 'blue', 'Completed': 'green', 'Cancelled': 'default',
}

export default function TasksPage() {
  const { requests, updateRequest, currentUser } = useApp()
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterUrgency, setFilterUrgency] = useState<string>('')
  const [detail, setDetail] = useState<Request | null>(null)

  const filtered = requests.filter(r => {
    if (r.status === 'Draft' || r.status === 'Completed' || r.status === 'Cancelled') return false
    if (filterType && r.type !== filterType) return false
    if (filterStatus && r.status !== filterStatus) return false
    if (filterUrgency && r.urgency !== filterUrgency) return false
    return true
  })

  const doAction = (r: Request, newStatus: RequestStatus) => {
    updateRequest(r.id, {
      status: newStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
      assignedTo: currentUser?.name,
      timeline: [...r.timeline, { id: `t${Date.now()}`, date: new Date().toLocaleString('th-TH'), status: newStatus, actor: currentUser?.name || 'ระบบ', note: `เปลี่ยนสถานะเป็น ${newStatus}` }],
    })
    message.success(`ดำเนินการสำเร็จ: ${newStatus}`)
  }

  const getActions = (r: Request) => {
    const btns = []
    if (r.status === 'Submitted') {
      btns.push(<Button key="accept" size="small" type="primary" style={{ background: '#2980B9' }} onClick={() => doAction(r, 'Under Review')}>รับงาน</Button>)
      btns.push(<Button key="miss" size="small" danger onClick={() => doAction(r, 'Missing Documents')}>ส่งกลับ</Button>)
    }
    if (r.status === 'Under Review') {
      btns.push(<Button key="field" size="small" onClick={() => doAction(r, 'Field Inspection')}>ส่งตรวจพื้นที่</Button>)
      btns.push(<Button key="price" size="small" onClick={() => doAction(r, 'Price Evaluation')}>ประเมินราคา</Button>)
    }
    if (r.status === 'Field Inspection') {
      btns.push(<Button key="report" size="small" type="primary" onClick={() => doAction(r, 'Price Evaluation')}>รายงานผล</Button>)
    }
    if (r.status === 'Price Evaluation') {
      btns.push(<Button key="approve" size="small" type="primary" onClick={() => doAction(r, 'Waiting Approval')}>ส่งอนุมัติ</Button>)
    }
    if (r.status === 'Waiting Approval') {
      btns.push(<Button key="ok" size="small" type="primary" style={{ background: '#27AE60' }} onClick={() => doAction(r, 'Waiting Payment')}>อนุมัติ</Button>)
      btns.push(<Button key="no" size="small" danger onClick={() => doAction(r, 'Cancelled')}>ไม่อนุมัติ</Button>)
    }
    btns.push(<Button key="view" size="small" onClick={() => setDetail(r)}>ดูรายละเอียด</Button>)
    return <Space wrap>{btns}</Space>
  }

  const cols = [
    { title: 'รหัสคำร้อง', dataIndex: 'requestNo', key: 'requestNo', width: 150 },
    { title: 'ประเภท', dataIndex: 'type', key: 'type', width: 110 },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 160, render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
    { title: 'ความเร่งด่วน', dataIndex: 'urgency', key: 'urgency', width: 130, render: (u: keyof typeof urgencyColor) => <Tag color={urgencyColor[u]}>{u}</Tag> },
    { title: 'วันที่', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    { title: 'การดำเนินการ', key: 'actions', render: (_: unknown, r: Request) => getActions(r), width: 280 },
  ]

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50' }}>กล่องงาน</Title>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col><Select placeholder="ประเภทงาน" allowClear style={{ width: 160 }} onChange={v => setFilterType(v || '')} options={['ขอเช่าใหม่','ต่อสัญญา','โอนสิทธิ์','ยกเลิก','เปลี่ยนข้อมูล'].map(v => ({ value: v, label: v }))} /></Col>
        <Col><Select placeholder="สถานะ" allowClear style={{ width: 160 }} onChange={v => setFilterStatus(v || '')} options={['Submitted','Under Review','Field Inspection','Price Evaluation','Waiting Approval','Missing Documents','Waiting Payment'].map(v => ({ value: v, label: v }))} /></Col>
        <Col><Select placeholder="ความเร่งด่วน" allowClear style={{ width: 140 }} onChange={v => setFilterUrgency(v || '')} options={['เร่งด่วน','ใกล้ครบกำหนด','ปกติ'].map(v => ({ value: v, label: v }))} /></Col>
      </Row>
      <Table dataSource={filtered} columns={cols} rowKey="id" scroll={{ x: 900 }} />

      <Modal title="รายละเอียดงาน" open={!!detail} onCancel={() => setDetail(null)} footer={null} width={700}>
        {detail && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="เลขที่คำร้อง">{detail.requestNo}</Descriptions.Item>
            <Descriptions.Item label="ประเภท">{detail.type}</Descriptions.Item>
            <Descriptions.Item label="ผู้เช่า">{detail.tenantName}</Descriptions.Item>
            <Descriptions.Item label="สถานะ"><Tag color={statusColor[detail.status]}>{detail.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="สถานที่" span={2}>{detail.location}</Descriptions.Item>
            <Descriptions.Item label="พื้นที่">{detail.area} ตร.ม.</Descriptions.Item>
            <Descriptions.Item label="ค่าเช่า/เดือน">฿{detail.monthlyRent.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="หมายเหตุ" span={2}>{detail.notes || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
