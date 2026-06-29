import { useState } from 'react'
import { Table, Tag, Button, Select, Space, Modal, Input, Typography, Row, Col, Card, Statistic, message, Upload } from 'antd'
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const { Title, Text } = Typography
const { TextArea } = Input

const docStatusColor: Record<string, string> = {
  'Missing': 'red', 'Invalid': 'orange', 'Expired': 'gold', 'Unreadable': 'purple',
  'Mismatch': 'volcano', 'Pending Review': 'blue', 'Accepted': 'green',
}

interface FlatDoc { requestNo: string; tenantName: string; docName: string; status: string; uploadedAt?: string; note?: string; docId: string; reqId: string }

export default function DocumentsPage() {
  const { requests } = useApp()
  const [filterStatus, setFilterStatus] = useState('')
  const [returnModal, setReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<FlatDoc | null>(null)

  const allDocs: FlatDoc[] = []
  requests.forEach(r => {
    r.documents.forEach(d => {
      allDocs.push({ requestNo: r.requestNo, tenantName: r.tenantName, docName: d.name, status: d.status, uploadedAt: d.uploadedAt, note: d.note, docId: d.id, reqId: r.id })
    })
  })

  const filtered = filterStatus ? allDocs.filter(d => d.status === filterStatus) : allDocs
  const total = allDocs.length
  const accepted = allDocs.filter(d => d.status === 'Accepted').length
  const missing = allDocs.filter(d => d.status === 'Missing').length
  const rejected = allDocs.filter(d => ['Invalid', 'Expired', 'Unreadable', 'Mismatch'].includes(d.status)).length

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('การรถไฟแห่งประเทศไทย', 105, 15, { align: 'center' })
    doc.setFontSize(12)
    doc.text('รายงานเอกสารที่ขาด / ไม่ผ่านการตรวจ', 105, 25, { align: 'center' })
    doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`, 14, 35)
    const missingDocs = allDocs.filter(d => d.status !== 'Accepted')
    autoTable(doc, {
      startY: 40,
      head: [['เลขที่คำร้อง', 'ผู้เช่า', 'เอกสาร', 'สถานะ', 'หมายเหตุ']],
      body: missingDocs.map(d => [d.requestNo, d.tenantName, d.docName, d.status, d.note || '']),
      styles: { font: 'helvetica', fontSize: 9 },
    })
    doc.save('missing-documents.pdf')
    message.success('ดาวน์โหลด PDF สำเร็จ')
  }

  const handleReturn = () => {
    message.success(`ส่งกลับเอกสาร: ${selectedDoc?.docName} - เหตุผล: ${returnReason}`)
    setReturnModal(false)
    setReturnReason('')
    setSelectedDoc(null)
  }

  const cols = [
    { title: 'เลขที่คำร้อง', dataIndex: 'requestNo', key: 'requestNo', width: 150 },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'เอกสาร', dataIndex: 'docName', key: 'docName' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 130, render: (s: string) => <Tag color={docStatusColor[s] || 'default'}>{s}</Tag> },
    { title: 'วันที่อัปโหลด', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 130, render: (v: string) => v || '-' },
    { title: 'หมายเหตุ', dataIndex: 'note', key: 'note', render: (v: string) => v || '-' },
    {
      title: 'การดำเนินการ', key: 'action', width: 200, render: (_: unknown, r: FlatDoc) => (
        <Space>
          <Upload showUploadList={false} beforeUpload={() => { message.success(`อัปโหลด ${r.docName} สำเร็จ`); return false }}>
            <Button size="small" icon={<UploadOutlined />}>อัปโหลด</Button>
          </Upload>
          {r.status !== 'Accepted' && <Button size="small" danger onClick={() => { setSelectedDoc(r); setReturnModal(true) }}>ส่งกลับ</Button>}
        </Space>
      )
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ color: '#2C3E50', margin: 0 }}>ตรวจสอบเอกสาร</Title>
        <Button type="primary" icon={<FilePdfOutlined />} style={{ background: '#C0392B' }} onClick={exportPDF}>ส่งออก PDF รายการขาด</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="เอกสารทั้งหมด" value={total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="ครบถ้วน" value={accepted} valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="ขาดเอกสาร" value={missing} valueStyle={{ color: '#C0392B' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="ไม่ผ่านการตรวจ" value={rejected} valueStyle={{ color: '#E67E22' }} /></Card></Col>
      </Row>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="กรองตามสถานะ" allowClear style={{ width: 180 }} onChange={v => setFilterStatus(v || '')} options={Object.keys(docStatusColor).map(s => ({ value: s, label: s }))} />
      </Space>
      <Table dataSource={filtered} columns={cols} rowKey={(r, i) => `${r.reqId}-${r.docId}-${i}`} scroll={{ x: 900 }} pagination={{ pageSize: 15 }} />

      <Modal title="ส่งกลับเอกสาร" open={returnModal} onOk={handleReturn} onCancel={() => setReturnModal(false)} okText="ยืนยัน" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
        <Text>เอกสาร: <strong>{selectedDoc?.docName}</strong></Text>
        <TextArea rows={4} value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="เหตุผลในการส่งกลับ..." style={{ marginTop: 8 }} />
      </Modal>
    </div>
  )
}
