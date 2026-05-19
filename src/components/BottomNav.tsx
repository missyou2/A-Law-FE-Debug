import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/',            label: '홈' },
  { path: '/mycontracts', label: '계약서' },
  { path: '/mypage',      label: '마이페이지' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="top-nav">
      {NAV_ITEMS.map(({ path, label }) => {
        const isActive = pathname === path;
        return (
          <button
            key={path}
            type="button"
            className={`top-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="top-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
