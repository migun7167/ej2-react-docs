import { useState } from 'react';
import { Card, Select, DatePicker, Button, Table, Typography, Space, Row, Col, Statistic, message, Tabs } from 'antd';
import { ExportOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { kpiData } from '../data/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const reportTypes = [
  { value: 'kpi', label: 'รายงาน KPI รวม' },
  { value: 'requests', label: 'รายงานคำร้อง' },
  { value: 'finance', label: 'รายงานการเงิน' },
  { value: 'debt', label: 'รายงานหนี้ค้าง' },
  { value: 'contracts', label: 'รายงานสัญญา' },
];

export default function Reports() {
  const { requests, invoices, contracts } = useApp();
  const [reportType, setReportType] = useState('kpi');

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = reportTypes.find(r => r.value === reportType)?.label || 'รายงาน';

    doc.setFontSize(18);
    doc.setTextColor(192, 57, 43);
    doc.text('การรถไฟแห่งประเทศไทย', 105, 18, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(title, 105, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}`, 14, 38);

    if (reportType === 'requests') {
      autoTable(doc, {
        startY: 45,
        head: [['เลขที่คำร้อง', 'ประเภท', 'ผู้เช่า', 'สถานที่', 'สถานะ', 'วันที่']],
        body: requests.map(r => [r.requestNo, r.type, r.tenantName, r.location, r.status, r.updatedAt]),
        headStyles: { fillColor: [192, 57, 43] },
        styles: { fontSize: 8 },
      });
    } else if (reportType === 'finance') {
      autoTable(doc, {
        startY: 45,
        head: [['เลขที่ใบแจ้งหนี้', 'ผู้เช่า', 'ยอดเงิน', 'ครบกำหนด', 'สถานะ']],
        body: invoices.map(i => [i.invoiceNo, i.tenantName, `฿${i.amount.toLocaleString()}`, i.dueDate, i.status]),
        headStyles: { fillColor: [192, 57, 43] },
        styles: { fontSize: 8 },
      });
    } else if (reportType === 'contracts') {
      autoTable(doc, {
        startY: 45,
        head: [['เลขที่สัญญา', 'ผู้เช่า', 'สถานที่', 'ค่าเช่า/เดือน', 'วันสิ้นสุด', 'สถานะ']],
        body: contracts.map(c => [c.contractNo, c.tenantName, c.location, `฿${c.monthlyRent.toLocaleString()}`, c.endDate, c.status]),
        headStyles: { fillColor: [192, 57, 43] },
        styles: { fontSize: 8 },
      });
    } else if (reportType === 'debt') {
      const overdue = invoices.filter(i => i.status === 'Overdue');
      autoTable(doc, {
        startY: 45,
        head: [['เลขที่ใบแจ้งหนี้', 'ผู้เช่า', 'ยอดเงิน', 'ครบกำหนด', 'วันเกิน']],
        body: overdue.map(i => [i.invoiceNo, i.tenantName, `฿${i.amount.toLocaleString()}`, i.dueDate, 'เกินกำหนดแล้ว']),
        headStyles: { fillColor: [192, 57, 43] },
        styles: { fontSize: 8 },
      });
    } else {
      // KPI
      autoTable(doc, {
        startY: 45,
        head: [['KPI', 'ค่า']],
        body: [
          ['จำนวนคำร้องทั้งหมด', requests.length.toString()],
          ['คำร้อง Active', requests.filter(r => r.status === 'Active').length.toString()],
          ['จำนวนสัญญา Active', contracts.filter(c => c.status === 'Active').length.toString()],
          ['รายได้รวม', `฿${invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.paidAmount, 0).toLocaleString()}`],
          ['หนี้ค้าง', `฿${invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0).toLocaleString()}`],
          ['สัญญาใกล้หมดอายุ', contracts.filter(c => c.status === 'Expiring Soon').length.toString()],
        ],
        headStyles: { fillColor: [192, 57, 43] },
      });
    }

    doc.save(`SRT_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    message.success('Export PDF สำเร็จ');
  };

  const exportExcel = () => {
    let data: object[] = [];
    const title = reportTypes.find(r => r.value === reportType)?.label || 'รายงาน';

    if (reportType === 'requests') {
      data = requests.map(r => ({ 'เลขที่คำร้อง': r.requestNo, 'ประเภท': r.type, 'ผู้เช่า': r.tenantName, 'สถานที่': r.location, 'ค่าเช่า': r.monthlyRent, 'สถานะ': r.status, 'วันที่': r.updatedAt }));
    } else if (reportType === 'finance') {
      data = invoices.map(i => ({ 'เลขที่': i.invoiceNo, 'สัญญา': i.contractNo, 'ผู้เช่า': i.tenantName, 'ยอดเงิน': i.amount, 'ครบกำหนด': i.dueDate, 'สถานะ': i.status, 'ชำระแล้ว': i.paidAmount }));
    } else if (reportType === 'contracts') {
      data = contracts.map(c => ({ 'เลขที่สัญญา': c.contractNo, 'ผู้เช่า': c.tenantName, 'สถานที่': c.location, 'ขนาด': c.area, 'ค่าเช่า': c.monthlyRent, 'วันเริ่ม': c.startDate, 'วันสิ้นสุด': c.endDate, 'สถานะ': c.status }));
    } else if (reportType === 'debt') {
      data = invoices.filter(i => i.status === 'Overdue').map(i => ({ 'เลขที่': i.invoiceNo, 'ผู้เช่า': i.tenantName, 'ยอดเงิน': i.amount, 'ครบกำหนด': i.dueDate, 'สถานะ': i.status }));
    } else {
      data = [
        { 'KPI': 'คำร้องทั้งหมด', 'ค่า': requests.length },
        { 'KPI': 'คำร้อง Active', 'ค่า': requests.filter(r => r.status === 'Active').length },
        { 'KPI': 'สัญญา Active', 'ค่า': contracts.filter(c => c.status === 'Active').length },
        { 'KPI': 'รายได้รวม', 'ค่า': invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.paidAmount, 0) },
        { 'KPI': 'หนี้ค้าง', 'ค่า': invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0) },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
    XLSX.writeFile(wb, `SRT_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Export Excel สำเร็จ');
  };

  const getTableData = () => {
    if (reportType === 'requests') return { data: requests.map(r => ({ key: r.id, ...r })), columns: [
      { title: 'เลขที่คำร้อง', dataIndex: 'requestNo', key: 'requestNo' },
      { title: 'ประเภท', dataIndex: 'type', key: 'type' },
      { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
      { title: 'สถานะ', dataIndex: 'status', key: 'status' },
      { title: 'วันที่', dataIndex: 'updatedAt', key: 'updatedAt' },
    ]};
    if (reportType === 'finance') return { data: invoices.map(i => ({ key: i.id, ...i })), columns: [
      { title: 'เลขที่ใบแจ้งหนี้', dataIndex: 'invoiceNo', key: 'invoiceNo' },
      { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
      { title: 'ยอดเงิน', dataIndex: 'amount', key: 'amount', render: (v: number) => `฿${v.toLocaleString()}` },
      { title: 'สถานะ', dataIndex: 'status', key: 'status' },
    ]};
    if (reportType === 'contracts') return { data: contracts.map(c => ({ key: c.id, ...c })), columns: [
      { title: 'เลขที่สัญญา', dataIndex: 'contractNo', key: 'contractNo' },
      { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
      { title: 'ค่าเช่า/เดือน', dataIndex: 'monthlyRent', key: 'monthlyRent', render: (v: number) => `฿${v.toLocaleString()}` },
      { title: 'สถานะ', dataIndex: 'status', key: 'status' },
    ]};
    if (reportType === 'debt') return { data: invoices.filter(i => i.status === 'Overdue').map(i => ({ key: i.id, ...i })), columns: [
      { title: 'เลขที่', dataIndex: 'invoiceNo', key: 'invoiceNo' },
      { title: 'ผู้เช่า', dataIndex: 'tenantName', key: 'tenantName' },
      { title: 'ยอดค้าง', dataIndex: 'amount', key: 'amount', render: (v: number) => `฿${v.toLocaleString()}` },
      { title: 'ครบกำหนด', dataIndex: 'dueDate', key: 'dueDate' },
    ]};
    return { data: [], columns: [] };
  };

  const { data, columns } = getTableData();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#2C3E50' }}>รายงาน</Title>
        <Space>
          <Button icon={<FilePdfOutlined />} type="primary" onClick={exportPDF} style={{ background: '#C0392B', borderColor: '#C0392B' }}>Export PDF</Button>
          <Button icon={<FileExcelOutlined />} style={{ color: '#27AE60', borderColor: '#27AE60' }} onClick={exportExcel}>Export Excel</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select style={{ width: 220 }} value={reportType} onChange={setReportType} options={reportTypes} />
          <RangePicker placeholder={['วันเริ่มต้น', 'วันสิ้นสุด']} />
          <Button type="primary" style={{ background: '#C0392B', borderColor: '#C0392B' }}>ดึงข้อมูล</Button>
        </Space>
      </Card>

      {reportType === 'kpi' && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}><Card><Statistic title="คำร้องทั้งหมด" value={requests.length} /></Card></Col>
            <Col span={6}><Card><Statistic title="สัญญา Active" value={contracts.filter(c => c.status === 'Active').length} valueStyle={{ color: '#27AE60' }} /></Card></Col>
            <Col span={6}><Card><Statistic title="รายได้รวม" prefix="฿" value={invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.paidAmount, 0)} formatter={v => v.toLocaleString()} /></Card></Col>
            <Col span={6}><Card><Statistic title="หนี้ค้าง" prefix="฿" value={invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0)} valueStyle={{ color: '#C0392B' }} formatter={v => v.toLocaleString()} /></Card></Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Card title="รายได้รายเดือน" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={kpiData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`฿${v.toLocaleString()}`, 'รายได้']} />
                    <Bar dataKey="amount" fill="#C0392B" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={10}>
              <Card title="แนวโน้มคำร้อง">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={kpiData.requestTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="new" stroke="#C0392B" name="ใหม่" />
                    <Line type="monotone" dataKey="completed" stroke="#27AE60" name="เสร็จ" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {reportType !== 'kpi' && (
        <Card title={reportTypes.find(r => r.value === reportType)?.label}>
          <Table columns={columns as any} dataSource={data} rowKey="key" pagination={{ pageSize: 10 }} size="small" />
        </Card>
      )}
    </div>
  );
}
