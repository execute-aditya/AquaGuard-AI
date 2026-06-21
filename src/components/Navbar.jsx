import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-secondary border-b-2 border-secondary pb-1 font-label-md text-label-md hover:text-secondary transition-colors duration-200 opacity-80 scale-95 transition-all'
      : 'font-label-md text-label-md text-on-primary-container opacity-80 hover:text-secondary transition-colors duration-200';

  return (
    <header className="bg-primary-container dark:bg-primary-container w-full top-0 shadow-md z-50">
      <div className="flex justify-between items-center w-full px-margin-x py-stack-md max-w-container-max mx-auto">
        {/* Brand Logo */}
        <div className="font-headline-md text-headline-md font-bold text-on-primary">
          AquaGuard AI
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-stack-lg items-center">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/report" className={navLinkClass}>Report Issue</NavLink>
          <NavLink to="/chat" className={navLinkClass}>AI Assistant</NavLink>
          <NavLink to="/checker" className={navLinkClass}>Safety Check</NavLink>
        </nav>

        {/* Trailing Icons */}
        <div className="flex items-center gap-stack-md text-secondary dark:text-secondary-fixed">
          <button aria-label="Account" className="hover:text-secondary transition-colors duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          </button>
          <button aria-label="Logout" className="hover:text-secondary transition-colors duration-200" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
