import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaFileAlt, FaUser } from 'react-icons/fa';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/',            icon: FaHome,    label: '홈' },
  { path: '/mycontracts', icon: FaFileAlt, label: '계약서' },
  { path: '/mypage',      icon: FaUser,    label: '마이페이지' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const isActive = pathname === path;
        return (
          <div
            key={path}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(path)}
          >
            <div className="bottom-nav-icon-wrap">
              <Icon size={22} />
            </div>
            <span className="bottom-nav-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNav;
