import { useState } from 'react'
import { Select, Button, Space, Table, Typography, DatePicker, Card, Row, Col, message } from 'antd'
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons'
import { useApp } from '../contexts/AppContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { Dayjs } from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

type ReportType = 'kpi' | 'requests' | 'finance' | 'debt' | 'contracts'

const reportOptions = [
  { value: 'kpi', label: 'รายงาน KPI' },
  { value: 'requests', label: 'รายงานคำร้อง' },
  { value: 'finance', label: 'รายงานการเงิน' },
  { value: 'debt', label: 'รายงานหนี้' },
  { value: 'contracts', label: 'รายงานสัญญา' },
]

export default function ReportsPage() {
  const { requests, invoices, contracts } = useApp()
  const [reportType, setReportType] = useState<ReportType>('requests')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [preview, setPreview] = useState(false)

  const getReportData = () => {
    switch (reportType) {
      case 'requests':
        return { columns: ['เลขที่คำร้อง', 'ประเภท', 'ผู้เช่า', 'สถานะ', 'วันที่ยื่น'], data: requests.map(r => [r.requestNo, r.type, r.tenantName, r.status, r.submittedAt]) }
      case 'finance':
        return { columns: ['เลขที่ใบแจ้งหนี้', 'ผู้เช่า', 'จำนวนเงิน', 'สถานะ', 'วันครบกำหนด'], data: invoices.map(i => [i.invoiceNo, i.tenantName, `฿${i.amount.toLocaleString()}`, i.status, i.dueDate]) }
      case 'debt':
        return { columns: ['เลขที่ใบแจ้งหนี้', 'ผู้เช่า', 'จำนวนเงิน', 'วันครบกำหนด', 'จำนวนวันเกิน'], data: invoices.filter(i => i.status === 'Overdue').map(i => [i.invoiceNo, i.tenantName, `฿${i.amount.toLocaleString()}`, i.dueDate, 'เกินกำหนด']) }
      case 'contracts':
        return { columns: ['เลขที่สัญญา', 'ผู้เช่า', 'สถานที่', 'ค่าเช่า/เดือน', 'วันหมดอายุ', 'สถานะ'], data: contracts.map(c => [c.contractNo, c.tenantName, c.location, `฿${c.monthlyRent.toLocaleString()}`, c.endDate, c.status]) }
      case 'kpi':
        return { columns: ['ตัวชี้วัด', 'ค่า', 'เป้าหมาย', 'ผล'], data: [['คำร้องใหม่', '24', '20', '✓ บรรลุ'], ['อัตราการอนุมัติ', '83%', '80%', '✓ บรรลุ'], ['ระยะเวลาเฉลี่ย', '14 วัน', '15 วัน', '✓ บรรลุ'], ['หนี้ค้างชำระ', '฿3.2M', '<฿2M', '✗ ไม่บรรลุ'], ['System Uptime', '99.95%', '99.9%', '✓ บรรลุ']] }
      default:
        return { columns: [], data: [] }
    }
  }

  const { columns, data } = getReportData()
  const reportTitle = reportOptions.find(r => r.value === reportType)?.label || ''

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(192, 57, 43)
    doc.text('การรถไฟแห่งประเทศไทย', 105, 15, { align: 'center' })
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text(reportTitle, 105, 25, { align: 'center' })
    doc.setFontSize(9)
    if (dateRange?.[0] && dateRange?.[1]) {
      doc.text(`ช่วงวันที่: ${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`, 14, 35)
    }
    doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`, 14, 42)
    autoTable(doc, { startY: 48, head: [columns], body: data, styles: { fontSize: 8 } })
    doc.save(`${reportType}-report.pdf`)
    message.success('ส่งออก PDF สำเร็จ')
  }

  const exportExcel = () => {
    const wsData = [columns, ...data]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, reportTitle)
    XLSX.writeFile(wb, `${reportType}-report.xlsx`)
    message.success('ส่งออก Excel สำเร็จ')
  }

  const tableCols = columns.map((col, i) => ({ title: col, dataIndex: `col${i}`, key: `col${i}` }))
  const tableData = data.map((row, ri) => {
    const obj: Record<string, string> = { key: String(ri) }
    row.forEach((cell, ci) => { obj[`col${ci}`] = String(cell) })
    return obj
  })

  return (
    <div>
      <Title level={3} style={{ color: '#2C3E50' }}>รายงาน</Title>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={12} align="middle" wrap>
          <Col>
            <Select value={reportType} style={{ width: 200 }} options={reportOptions} onChange={v => { setReportType(v as ReportType); setPreview(false) }} />
          </Col>
          <Col>
            <RangePicker onChange={v => setDateRange(v as [Dayjs | null, Dayjs | null] | null)} />
          </Col>
          <Col>
            <Button type="primary" style={{ background: '#2C3E50' }} onClick={() => setPreview(true)}>ดูรายงาน</Button>
          </Col>
          <Col>
            <Space>
              <Button icon={<FilePdfOutlined />} style={{ background: '#C0392B', color: '#fff', border: 'none' }} onClick={exportPDF}>ส่งออก PDF</Button>
              <Button icon={<FileExcelOutlined />} style={{ background: '#27AE60', color: '#fff', border: 'none' }} onClick={exportExcel}>ส่งออก Excel</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {preview && (
        <Card title={reportTitle}>
          <Table dataSource={tableData} columns={tableCols} rowKey="key" scroll={{ x: 'max-content' }} pagination={{ pageSize: 15 }} size="small" />
        </Card>
      )}
    </div>
  )
}
