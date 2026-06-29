import { Row, Col, Card, Statistic, Typography, Table, Tag } from 'antd'
import { FileTextOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DollarOutlined, WarningOutlined, ContainerOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

const { Title } = Typography

const barData = [
  { month: 'ม.ค.', คำร้อง: 12, อนุมัติ: 8 },
  { month: 'ก.พ.', คำร้อง: 18, อนุมัติ: 14 },
  { month: 'มี.ค.', คำร้อง: 15, อนุมัติ: 11 },
  { month: 'เม.ย.', คำร้อง: 22, อนุมัติ: 17 },
  { month: 'พ.ค.', คำร้อง: 19, อนุมัติ: 15 },
  { month: 'มิ.ย.', คำร้อง: 24, อนุมัติ: 20 },
]

const lineData = [
  { month: 'ม.ค.', รายได้: 850000 },
  { month: 'ก.พ.', รายได้: 920000 },
  { month: 'มี.ค.', รายได้: 780000 },
  { month: 'เม.ย.', รายได้: 1100000 },
  { month: 'พ.ค.', รายได้: 980000 },
  { month: 'มิ.ย.', รายได้: 1250000 },
]

const statusColor: Record<string, string> = {
  'Submitted': 'blue', 'Under Review': 'purple', 'Active': 'green',
  'Overdue': 'red', 'Missing Documents': 'orange', 'Waiting Approval': 'volcano',
  'Draft': 'default', 'Completed': 'green', 'Cancelled': 'default',
  'Field Inspection': 'cyan', 'Price Evaluation': 'geekblue',
  'Waiting Payment': 'gold', 'Paid': 'lime', 'Contracting': 'blue',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { requests } = useApp()

  const cards = [
    { title: 'คำร้องใหม่', value: 24, suffix: 'รายการ', color: '#C0392B', icon: <FileTextOutlined />, link: '/requests' },
    { title: 'งานรออนุมัติ', value: 8, suffix: 'รายการ', color: '#E67E22', icon: <ClockCircleOutlined />, link: '/tasks' },
    { title: 'เอกสารขาด', value: 12, suffix: 'รายการ', color: '#F39C12', icon: <ExclamationCircleOutlined />, link: '/documents' },
    { title: 'ใบแจ้งหนี้รอชำระ', value: 45, suffix: 'รายการ', color: '#2980B9', icon: <DollarOutlined />, link: '/invoices' },
    { title: 'หนี้ค้างชำระ', value: '฿3,200,000', color: '#C0392B', icon: <WarningOutlined />, link: '/invoices' },
    { title: 'สัญญาใกล้หมดอายุ', value: 31, suffix: 'สัญญา', color: '#E67E22', icon: <ContainerOutlined />, link: '/contracts' },
    { title: 'System Health', value: '99.95%', color: '#27AE60', icon: <CheckCircleOutlined />, link: '/admin' },
  ]

  const recentCols = [
    { title: 'เลขที่คำร้อง', dataIndex: 'requestNo', key: 'requestNo' },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
    { title: 'วันที่', dataIndex: 'submittedAt', key: 'submittedAt' },
  ]

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50', marginBottom: 24 }}>แดชบอร์ด</Title>
      <Row gutter={[16, 16]}>
        {cards.map((card, i) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={i}>
            <Card
              hoverable
              onClick={() => navigate(card.link)}
              style={{ borderLeft: `4px solid ${card.color}`, cursor: 'pointer' }}
            >
              <Statistic
                title={<span style={{ fontSize: 13 }}>{card.title}</span>}
                value={card.value}
                suffix={card.suffix}
                prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                valueStyle={{ color: card.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="คำร้องรายเดือน" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="คำร้อง" fill="#C0392B" />
                <Bar dataKey="อนุมัติ" fill="#2C3E50" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="รายได้รายเดือน (บาท)" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => (v/1000) + 'K'} />
                <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="รายได้" stroke="#C0392B" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="คำร้องล่าสุด" style={{ marginTop: 24 }}>
        <Table
          dataSource={requests.slice(0, 5)}
          columns={recentCols}
          rowKey="id"
          pagination={false}
          onRow={r => ({ onClick: () => navigate(`/requests/${r.id}`) })}
          rowClassName={() => 'clickable-row'}
          size="small"
        />
      </Card>
    </div>
  )
}
