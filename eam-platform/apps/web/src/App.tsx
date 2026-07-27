import { NavLink, Route, Routes } from 'react-router-dom';
import { getDevUser, setDevUser } from './api';
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import MetersPage from './pages/MetersPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="brand">🔧 EAM</div>
        <NavLink to="/" end>📊 <span>Dashboard</span></NavLink>
        <NavLink to="/assets">🏭 <span>สินทรัพย์</span></NavLink>
        <NavLink to="/meters">⏱ <span>มิเตอร์</span></NavLink>
        <NavLink to="/work-orders">🛠 <span>ใบสั่งงาน</span></NavLink>
        <NavLink to="/map">🗺 <span>แผนที่</span></NavLink>
        <NavLink to="/admin">⚙️ <span>ตั้งค่า</span></NavLink>
        <div className="user">
          dev user:{' '}
          <select
            defaultValue={getDevUser()}
            onChange={(e) => {
              setDevUser(e.target.value);
              location.reload();
            }}
          >
            <option value="admin">admin</option>
            <option value="somsri">somsri (หัวหน้า)</option>
            <option value="somchai">somchai (ช่าง)</option>
          </select>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/meters" element={<MetersPage />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
