import { useState } from 'react'
import { Table, Tag, Button, Tabs, Space, Modal, Descriptions, Typography, message } from 'antd'
import { FilePdfOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import type { Contract, RequestType } from '../types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const { Title } = Typography

const statusColor: Record<string, string> = {
  'Active': 'green', 'Expiring Soon': 'orange', 'Expired': 'red', 'Cancelled': 'default',
}

export default function ContractsPage() {
  const { contracts, addRequest, currentUser } = useApp()
  const [detail, setDetail] = useState<Contract | null>(null)

  const makeRequest = (contract: Contract, type: RequestType) => {
    addRequest({
      id: `r${Date.now()}`,
      requestNo: `SRT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      type,
      status: 'Draft',
      tenantName: contract.tenantName,
      tenantId: '',
      location: contract.location,
      area: contract.area,
      monthlyRent: contract.monthlyRent,
      submittedAt: new Date().toISOString().slice(0,10),
      updatedAt: new Date().toISOString().slice(0,10),
      urgency: 'ปกติ',
      notes: `จากสัญญา ${contract.contractNo}`,
      documents: [],
      timeline: [{ id: 't1', date: new Date().toLocaleString('th-TH'), status: 'Draft', actor: currentUser?.name || 'ระบบ', note: `สร้างคำร้อง${type}จากสัญญา ${contract.contractNo}` }],
      auditLogs: [{ id: 'a1', date: new Date().toLocaleString('th-TH'), action: 'CREATE', actor: currentUser?.name || 'ระบบ', detail: `สร้างคำร้อง${type}` }],
    })
    message.success(`สร้างคำร้อง${type}สำเร็จ กรุณาตรวจสอบในรายการคำร้อง`)
  }

  const downloadPDF = (contract: Contract) => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(192, 57, 43)
    doc.text('การรถไฟแห่งประเทศไทย', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(0,0,0)
    doc.text('สัญญาเช่า', 105, 30, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`เลขที่สัญญา: ${contract.contractNo}`, 14, 45)
    doc.text(`ผู้เช่า: ${contract.tenantName}`, 14, 52)
    doc.text(`สถานที่: ${contract.location}`, 14, 59)
    autoTable(doc, {
      startY: 70,
      head: [['รายการ', 'ข้อมูล']],
      body: [
        ['เลขที่สัญญา', contract.contractNo],
        ['ผู้เช่า', contract.tenantName],
        ['สถานที่', contract.location],
        ['พื้นที่', `${contract.area} ตร.ม.`],
        ['ค่าเช่า/เดือน', `฿${contract.monthlyRent.toLocaleString()}`],
        ['วันเริ่มสัญญา', contract.startDate],
        ['วันสิ้นสุด', contract.endDate],
        ['สถานะ', contract.status],
      ],
    })
    doc.save(`${contract.contractNo}.pdf`)
    message.success('ดาวน์โหลดสัญญาสำเร็จ')
  }

  const cols = [
    { title: 'เลขที่สัญญา', dataIndex: 'contractNo', key: 'contractNo', width: 150 },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'สถานที่', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: 'พื้นที่ (ตร.ม.)', dataIndex: 'area', key: 'area', width: 110 },
    { title: 'ค่าเช่า/เดือน', dataIndex: 'monthlyRent', key: 'monthlyRent', width: 130, render: (v: number) => `฿${v.toLocaleString()}` },
    { title: 'วันหมดอายุ', dataIndex: 'endDate', key: 'endDate', width: 120 },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
    {
      title: 'การดำเนินการ', key: 'action', width: 300, render: (_: unknown, r: Contract) => (
        <Space wrap>
          <Button size="small" icon={<FilePdfOutlined />} onClick={() => downloadPDF(r)}>ดาวน์โหลด</Button>
          <Button size="small" onClick={() => makeRequest(r, 'ต่อสัญญา')}>ขอต่อสัญญา</Button>
          <Button size="small" onClick={() => makeRequest(r, 'โอนสิทธิ์')}>โอนสิทธิ์</Button>
          <Button size="small" danger onClick={() => makeRequest(r, 'ยกเลิก')}>ขอยกเลิก</Button>
          <Button size="small" type="link" onClick={() => setDetail(r)}>รายละเอียด</Button>
        </Space>
      )
    },
  ]

  const tableFor = (list: Contract[]) => (
    <Table dataSource={list} columns={cols} rowKey="id" scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} />
  )

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50' }}>ศูนย์สัญญา</Title>
      <Tabs items={[
        { key: 'all', label: `สัญญาทั้งหมด (${contracts.length})`, children: tableFor(contracts) },
        { key: 'expiring', label: `ใกล้หมดอายุ (${contracts.filter(c => c.status === 'Expiring Soon').length})`, children: tableFor(contracts.filter(c => c.status === 'Expiring Soon')) },
        { key: 'expired', label: `หมดอายุแล้ว (${contracts.filter(c => c.status === 'Expired').length})`, children: tableFor(contracts.filter(c => c.status === 'Expired')) },
      ]} />

      <Modal title="รายละเอียดสัญญา" open={!!detail} onCancel={() => setDetail(null)} footer={[<Button key="c" onClick={() => setDetail(null)}>ปิด</Button>, <Button key="d" type="primary" style={{ background: '#C0392B' }} icon={<FilePdfOutlined />} onClick={() => detail && downloadPDF(detail)}>ดาวน์โหลด PDF</Button>]} width={600}>
        {detail && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="เลขที่สัญญา">{detail.contractNo}</Descriptions.Item>
            <Descriptions.Item label="ประเภท">{detail.type}</Descriptions.Item>
            <Descriptions.Item label="ผู้เช่า" span={2}>{detail.tenantName}</Descriptions.Item>
            <Descriptions.Item label="สถานที่" span={2}>{detail.location}</Descriptions.Item>
            <Descriptions.Item label="พื้นที่">{detail.area} ตร.ม.</Descriptions.Item>
            <Descriptions.Item label="ค่าเช่า/เดือน">฿{detail.monthlyRent.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="วันเริ่มต้น">{detail.startDate}</Descriptions.Item>
            <Descriptions.Item label="วันสิ้นสุด">{detail.endDate}</Descriptions.Item>
            <Descriptions.Item label="สถานะ"><Tag color={statusColor[detail.status]}>{detail.status}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
