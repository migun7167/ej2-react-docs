import React, { useState } from 'react'
import { Layout, Menu, Avatar, Button, Tag, Breadcrumb, Typography } from 'antd'
import {
  HomeOutlined, InboxOutlined, FileTextOutlined, FolderOutlined,
  EnvironmentOutlined, DollarOutlined, ContainerOutlined, BarChartOutlined,
  SettingOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import NotificationDropdown from '../components/NotificationDropdown'

const { Sider, Header, Content, Footer } = Layout

const menuItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'แดชบอร์ด' },
  { key: '/tasks', icon: <InboxOutlined />, label: 'กล่องงาน' },
  { key: '/requests', icon: <FileTextOutlined />, label: 'คำร้อง' },
  { key: '/documents', icon: <FolderOutlined />, label: 'เอกสาร' },
  { key: '/map', icon: <EnvironmentOutlined />, label: 'แผนที่' },
  { key: '/invoices', icon: <DollarOutlined />, label: 'ใบแจ้งหนี้' },
  { key: '/contracts', icon: <ContainerOutlined />, label: 'สัญญา' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'รายงาน' },
  { key: '/admin', icon: <SettingOutlined />, label: 'ผู้ดูแล' },
]

const pathLabels: Record<string, string> = {
  '/dashboard': 'แดชบอร์ด', '/tasks': 'กล่องงาน', '/requests': 'คำร้อง',
  '/documents': 'เอกสาร', '/map': 'แผนที่', '/invoices': 'ใบแจ้งหนี้',
  '/contracts': 'สัญญา', '/reports': 'รายงาน', '/admin': 'ผู้ดูแล',
}

export default function MainLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, setCurrentUser } = useApp()

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/login')
  }

  const pathKey = '/' + location.pathname.split('/')[1]
  const breadLabel = pathLabels[pathKey] || 'แดชบอร์ด'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{ background: '#C0392B' }}
        width={220}
      >
        <div style={{ padding: '16px', textAlign: 'center', color: '#fff', fontSize: collapsed ? 14 : 18, fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: 8 }}>
          {collapsed ? '🚂' : '🚂 SRT MIS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathKey]}
          style={{ background: '#C0392B', borderRight: 'none' }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Breadcrumb items={[{ title: 'SRT MIS' }, { title: breadLabel }]} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationDropdown />
            <Avatar style={{ background: '#C0392B' }}>{currentUser?.name?.[0]}</Avatar>
            <div>
              <Typography.Text strong style={{ fontSize: 13 }}>{currentUser?.name}</Typography.Text>
              <br />
              <Tag color="red" style={{ fontSize: 11, margin: 0 }}>{currentUser?.role}</Tag>
            </div>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} danger type="text">ออกจากระบบ</Button>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 16, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
          {children || <Outlet />}
        </Content>
        <Footer style={{ textAlign: 'center', background: '#2C3E50', color: '#fff', padding: '12px' }}>
          ระบบบริหารจัดการทรัพย์สิน | การรถไฟแห่งประเทศไทย © 2026
        </Footer>
      </Layout>
    </Layout>
  )
}
