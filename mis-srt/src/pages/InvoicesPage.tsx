import { useState } from 'react'
import { Table, Tag, Button, Select, Space, Modal, Typography, Row, Col, Card, Statistic, message, Divider } from 'antd'
import { DollarOutlined, QrcodeOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import type { Invoice } from '../types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const { Title, Text } = Typography

const statusColor: Record<string, string> = {
  'Draft': 'default', 'Issued': 'blue', 'Waiting Payment': 'gold',
  'Partially Paid': 'orange', 'Paid': 'green', 'Overdue': 'red', 'Cancelled': 'default',
}

export default function InvoicesPage() {
  const { invoices, updateInvoice } = useApp()
  const [filterStatus, setFilterStatus] = useState('')
  const [payModal, setPayModal] = useState<Invoice | null>(null)
  const [paying, setPaying] = useState(false)

  const filtered = filterStatus ? invoices.filter(i => i.status === filterStatus) : invoices

  const total = invoices.length
  const waiting = invoices.filter(i => ['Waiting Payment', 'Issued', 'Partially Paid'].includes(i.status)).length
  const paid = invoices.filter(i => i.status === 'Paid').length
  const overdue = invoices.filter(i => i.status === 'Overdue').length

  const generateInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(192, 57, 43)
    doc.text('การรถไฟแห่งประเทศไทย', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('ใบแจ้งหนี้ / Invoice', 105, 30, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`เลขที่ใบแจ้งหนี้: ${inv.invoiceNo}`, 14, 45)
    doc.text(`วันที่ออก: ${inv.issuedDate}`, 14, 52)
    doc.text(`วันครบกำหนด: ${inv.dueDate}`, 14, 59)
    doc.text(`ผู้เช่า: ${inv.tenantName}`, 14, 66)
    doc.text(`สัญญาเลขที่: ${inv.contractNo}`, 14, 73)
    autoTable(doc, {
      startY: 80,
      head: [['รายการ', 'จำนวนเงิน (บาท)']],
      body: [[inv.description, inv.amount.toLocaleString()], ['รวมทั้งสิ้น', inv.amount.toLocaleString()]],
      styles: { fontSize: 10 },
    })
    doc.save(`${inv.invoiceNo}.pdf`)
    message.success('ดาวน์โหลดใบแจ้งหนี้สำเร็จ')
  }

  const generateReceiptPDF = (inv: Invoice) => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(192, 57, 43)
    doc.text('การรถไฟแห่งประเทศไทย', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('ใบเสร็จรับเงิน / Receipt', 105, 30, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`อ้างอิงใบแจ้งหนี้: ${inv.invoiceNo}`, 14, 45)
    doc.text(`วันที่ชำระ: ${inv.paidDate || new Date().toISOString().slice(0,10)}`, 14, 52)
    doc.text(`ผู้เช่า: ${inv.tenantName}`, 14, 59)
    autoTable(doc, {
      startY: 70,
      head: [['รายการ', 'จำนวนเงิน (บาท)']],
      body: [[inv.description, inv.paidAmount.toLocaleString()], ['ยอดที่ได้รับ', inv.paidAmount.toLocaleString()]],
    })
    doc.save(`RECEIPT-${inv.invoiceNo}.pdf`)
    message.success('ดาวน์โหลดใบเสร็จสำเร็จ')
  }

  const handlePay = () => {
    if (!payModal) return
    setPaying(true)
    setTimeout(() => {
      updateInvoice(payModal.id, { status: 'Paid', paidAmount: payModal.amount, paidDate: new Date().toISOString().slice(0,10) })
      message.success(`ชำระเงิน ${payModal.invoiceNo} สำเร็จ`)
      setPayModal(null)
      setPaying(false)
    }, 1000)
  }

  const cols = [
    { title: 'เลขที่ใบแจ้งหนี้', dataIndex: 'invoiceNo', key: 'invoiceNo', width: 150 },
    { title: 'สัญญาเลขที่', dataIndex: 'contractNo', key: 'contractNo', width: 140 },
    { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
    { title: 'จำนวนเงิน', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number) => `฿${v.toLocaleString()}` },
    { title: 'วันครบกำหนด', dataIndex: 'dueDate', key: 'dueDate', width: 120 },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', width: 130, render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
    {
      title: 'การดำเนินการ', key: 'action', width: 260, render: (_: unknown, r: Invoice) => (
        <Space wrap>
          {['Issued','Waiting Payment','Partially Paid','Overdue'].includes(r.status) && (
            <Button size="small" type="primary" icon={<DollarOutlined />} style={{ background: '#27AE60' }} onClick={() => setPayModal(r)}>ชำระเงิน</Button>
          )}
          <Button size="small" icon={<FilePdfOutlined />} onClick={() => generateInvoicePDF(r)}>ดาวน์โหลดใบแจ้งหนี้</Button>
          {r.status === 'Paid' && <Button size="small" onClick={() => generateReceiptPDF(r)}>ออกใบเสร็จ</Button>}
        </Space>
      )
    },
  ]

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50' }}>ใบแจ้งหนี้ & การชำระเงิน</Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="ทั้งหมด" value={total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="รอชำระ" value={waiting} valueStyle={{ color: '#E67E22' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="ชำระแล้ว" value={paid} valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="เกินกำหนด" value={overdue} valueStyle={{ color: '#C0392B' }} /></Card></Col>
      </Row>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="กรองตามสถานะ" allowClear style={{ width: 180 }} onChange={v => setFilterStatus(v || '')} options={Object.keys(statusColor).map(s => ({ value: s, label: s }))} />
      </Space>
      <Table dataSource={filtered} columns={cols} rowKey="id" scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} />

      <Modal
        title={`ชำระเงิน - ${payModal?.invoiceNo}`}
        open={!!payModal}
        onOk={handlePay}
        onCancel={() => setPayModal(null)}
        okText="ยืนยันการชำระเงิน"
        cancelText="ยกเลิก"
        confirmLoading={paying}
        okButtonProps={{ style: { background: '#27AE60' } }}
      >
        {payModal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 180, height: 180, background: '#f0f0f0', border: '2px dashed #ccc', margin: '16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <div>
                <QrcodeOutlined style={{ fontSize: 64, color: '#999' }} />
                <div style={{ color: '#999', marginTop: 8 }}>QR Code</div>
              </div>
            </div>
            <Divider />
            <Text><strong>ผู้เช่า:</strong> {payModal.tenantName}</Text><br />
            <Text><strong>รายการ:</strong> {payModal.description}</Text><br />
            <Title level={3} style={{ color: '#C0392B', margin: '12px 0' }}>฿{payModal.amount.toLocaleString()}</Title>
            <Text type="secondary">สแกน QR Code เพื่อชำระเงิน หรือกด "ยืนยันการชำระเงิน"</Text>
          </div>
        )}
      </Modal>
    </div>
  )
}
