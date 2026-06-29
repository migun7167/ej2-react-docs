import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import thTH from 'antd/locale/th_TH'
import App from './App'
import { AppProvider } from './contexts/AppContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={thTH}
        theme={{
          token: {
            colorPrimary: '#C0392B',
            colorLink: '#C0392B',
          },
        }}
      >
        <AppProvider>
          <App />
        </AppProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
