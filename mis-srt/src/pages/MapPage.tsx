import React, { useState } from 'react';
import { Table, Tag, Button, Select, Card, Modal, Descriptions, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { mockMapAssets } from '../data/mockData';
import type { MapAsset } from '../types';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  'Available': 'green', 'Active': 'blue', 'Expiring Soon': 'orange', 'Overdue': 'red'
};

export default function MapPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MapAsset | null>(null);

  const assets: MapAsset[] = mockMapAssets;
  const filtered = statusFilter ? assets.filter(a => a.status === statusFilter) : assets;

  const columns = [
    { title: 'ชื่อพื้นที่', dataIndex: 'name', key: 'name' },
    { title: 'สถานี', dataIndex: 'station', key: 'station' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColor[v] || 'default'}>{v}</Tag> },
    { title: 'พื้นที่ (ตร.ม.)', dataIndex: 'area', key: 'area' },
    { title: 'ผู้เช่า', dataIndex: 'tenant', key: 'tenant', render: (v?: string) => v || '-' },
    { title: 'การดำเนินการ', key: 'actions', render: (_: any, r: MapAsset) => (
      <Button size="small" icon={<EnvironmentOutlined />} onClick={() => setSelectedAsset(r)}>ดูรายละเอียด</Button>
    )},
  ];

  return (
    <div>
      <Title level={3}>แผนที่ทรัพย์สิน</Title>

      <Card style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          color: '#fff',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>กรุณาใส่ Google Maps API Key ใน .env</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 14 }}>
            REACT_APP_GOOGLE_MAPS_KEY=your_key_here
          </Text>
          <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assets.map(a => (
              <div key={a.id} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.4)'
              }} onClick={() => setSelectedAsset(a)}>
                <div style={{ fontSize: 20 }}>📍</div>
                <div style={{ fontSize: 11 }}>{a.station}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ marginBottom: 12 }}>
        <Select placeholder="กรองตามสถานะ" allowClear style={{ width: 200 }} onChange={setStatusFilter}
          options={Object.keys(statusColor).map(v => ({ label: v, value: v }))} />
      </div>
      <Table dataSource={filtered} columns={columns} rowKey="id" />

      <Modal
        title="รายละเอียดทรัพย์สิน"
        open={!!selectedAsset}
        onCancel={() => setSelectedAsset(null)}
        footer={<Button onClick={() => setSelectedAsset(null)}>ปิด</Button>}
      >
        {selectedAsset && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ชื่อ">{selectedAsset.name}</Descriptions.Item>
            <Descriptions.Item label="สถานี">{selectedAsset.station}</Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag color={statusColor[selectedAsset.status]}>{selectedAsset.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="พื้นที่">{selectedAsset.area} ตร.ม.</Descriptions.Item>
            <Descriptions.Item label="ผู้เช่า">{selectedAsset.tenant || '-'}</Descriptions.Item>
            <Descriptions.Item label="พิกัด">
              {selectedAsset.lat}, {selectedAsset.lng}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
