import { Badge, Popover, Button, List, Typography, Space, Tag } from 'antd'
import { BellOutlined, InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

const typeIcon: Record<string, React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  warning: <WarningOutlined style={{ color: '#faad14' }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
}

export default function NotificationDropdown() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp()
  const navigate = useNavigate()

  const content = (
    <div style={{ width: 340 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography.Text strong>การแจ้งเตือน ({unreadCount} ยังไม่อ่าน)</Typography.Text>
        <Button type="link" size="small" onClick={markAllNotificationsRead}>อ่านทั้งหมด</Button>
      </div>
      <List
        dataSource={notifications.slice(0, 8)}
        renderItem={item => (
          <List.Item
            style={{ cursor: 'pointer', background: item.read ? 'transparent' : '#fff7f7', borderRadius: 4, padding: '8px 4px' }}
            onClick={() => {
              markNotificationRead(item.id)
              if (item.link) navigate(item.link)
            }}
          >
            <Space align="start">
              {typeIcon[item.type]}
              <div>
                <Typography.Text strong style={{ fontSize: 13 }}>{item.title}</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>{item.createdAt}</Typography.Text>
              </div>
              {!item.read && <Tag color="red" style={{ fontSize: 10 }}>ใหม่</Tag>}
            </Space>
          </List.Item>
        )}
      />
      <Button type="link" block onClick={() => navigate('/dashboard')}>ดูทั้งหมด</Button>
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <Button icon={<BellOutlined />} shape="circle" type="text" style={{ fontSize: 18 }} />
      </Badge>
    </Popover>
  )
}
