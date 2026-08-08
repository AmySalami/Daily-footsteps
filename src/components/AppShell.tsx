import { NavLink, Outlet } from 'react-router-dom';
import { Paw, Toaster } from './ui';
import { HAS_AI_PROXY } from '@/lib/config';

const navClass = ({ isActive }: { isActive: boolean }) => `nav-btn${isActive ? ' nav-active' : ''}`;

/** App chrome: header (brand + nav) with the routed page rendered below. */
export function AppShell() {
  return (
    <>
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <Paw />
          </span>
          <span className="brand-name">
            Daily<span>Footsteps</span>
          </span>
        </NavLink>
        <nav className="nav-bar" id="topnav" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Practice
          </NavLink>
          <NavLink to="/workspace" className={navClass}>
            Workspace
          </NavLink>
          <NavLink to="/vocab" className={navClass}>
            Vocabulary
          </NavLink>
        </nav>
        {!HAS_AI_PROXY && <span className="proto-badge badge">mock AI</span>}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <Toaster />
    </>
  );
}
