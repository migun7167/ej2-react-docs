import { useState } from 'react'
import { Table, Tag, Button, Input, Select, Space, Typography, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import type { Request } from '../types'

const { Title } = Typography

const statusColor: Record<string, string> = {
  'Draft': 'default', 'Submitted': 'blue', 'Missing Documents': 'orange', 'Under Review': 'purple',
  'Field Inspection': 'cyan', 'Price Evaluation': 'geekblue', 'Waiting Approval': 'volcano',
  'Waiting Payment': 'gold', 'Paid': 'lime', 'Contracting': 'blue', 'Active': 'green',
  'Overdue': 'red', 'Completed': 'green', 'Cancelled': 'default',
}
const urgencyColor = { 'เร่งด่วน': 'red', 'ใกล้ครบกำหนด': 'gold', 'ปกติ': 'green' } as const

export default function RequestListPage() {
  const { requests } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.tenantName.includes(search) || r.requestNo.includes(search)
    const matchStatus = !filterStatus || r.status === filterStatus
    const matchType = !filterType || r.type === filterType
    return matchSearch && matchStatus && matchType
  })

  const cols = [
    { title: 'เลขที่คำร้อง', dataIndex: 'requestNo', key: 'requestNo', width: 150 },
    { title: 'ประเภท', dataIndex: 'type', key: 'type', width: 120 },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'สถานที่', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 160, render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
    { title: 'ความเร่งด่วน', dataIndex: 'urgency', key: 'urgency', width: 130, render: (u: keyof typeof urgencyColor) => <Tag color={urgencyColor[u]}>{u}</Tag> },
    { title: 'วันที่ยื่น', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    { title: '', key: 'action', width: 80, render: (_: unknown, r: Request) => <Button size="small" onClick={e => { e.stopPropagation(); navigate(`/requests/${r.id}`) }}>ดู</Button> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ color: '#2C3E50', margin: 0 }}>รายการคำร้อง</Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#C0392B' }} onClick={() => navigate('/requests/new')}>
          สร้างคำร้องใหม่
        </Button>
      </div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Input prefix={<SearchOutlined />} placeholder="ค้นหาชื่อผู้เช่า หรือเลขที่คำร้อง" value={search} onChange={e => setSearch(e.target.value)} allowClear />
        </Col>
        <Col>
          <Select placeholder="สถานะ" allowClear style={{ width: 170 }} onChange={v => setFilterStatus(v || '')} options={Object.keys(statusColor).map(s => ({ value: s, label: s }))} />
        </Col>
        <Col>
          <Select placeholder="ประเภท" allowClear style={{ width: 140 }} onChange={v => setFilterType(v || '')} options={['ขอเช่าใหม่','ต่อสัญญา','โอนสิทธิ์','ยกเลิก','เปลี่ยนข้อมูล'].map(v => ({ value: v, label: v }))} />
        </Col>
      </Row>
      <Table
        dataSource={filtered}
        columns={cols}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={r => ({ onClick: () => navigate(`/requests/${r.id}`), style: { cursor: 'pointer' } })}
        scroll={{ x: 900 }}
      />
    </div>
  )
}
