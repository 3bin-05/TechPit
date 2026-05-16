import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  MessageSquare, 
  BarChart, 
  Bell, 
  Search, 
  User,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export const MainLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user) return '??';
    const name = user.username || user.displayName || 'Anon';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-ghost">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] fixed h-screen border-r-4 border-void bg-chalk z-50">
        <div className="p-6 border-b-4 border-void">
          <h1 className="font-bebas text-4xl tracking-tighter cursor-pointer" onClick={() => navigate('/feed')}>TECHPIT</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/feed" icon={<Home size={20} />} label="Feed" />
          <NavItem to="/create" icon={<Plus size={20} />} label="Create" />
          <NavItem to="/forum" icon={<MessageSquare size={20} />} label="Forum" />
          <NavItem to="/leaderboard" icon={<BarChart size={20} />} label="Board" />
          <NavItem to="/notifications" icon={<Bell size={20} />} label="Alerts" />
          <NavItem to="/search" icon={<Search size={20} />} label="Search" />
        </nav>

        <div className="p-4 border-t-4 border-void">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => clsx(
              "flex items-center gap-3 p-2 mb-4 border-2 border-transparent transition-all",
              isActive ? "bg-glitch/20 border-void" : "hover:bg-static/10"
            )}
          >
            <div className="w-10 h-10 rounded-full border-2 border-void bg-glitch flex items-center justify-center font-bebas overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                getUserInitials()
              )}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="font-bebas text-lg truncate">{user?.username || user?.displayName || 'Anon_Operator'}</p>
              <p className="font-mono text-[10px] text-static uppercase">
                {user?.level ? `Level ${user.level}` : 'Kernel Sage'}
              </p>
            </div>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-2 font-mono text-sm uppercase hover:bg-signal hover:text-chalk transition-colors border-2 border-transparent hover:border-void"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-chalk border-t-4 border-void z-50 flex justify-around p-2">
        <MobileNavItem to="/feed" icon={<Home size={24} />} />
        <MobileNavItem to="/create" icon={<Plus size={24} />} />
        <MobileNavItem to="/forum" icon={<MessageSquare size={24} />} />
        <MobileNavItem to="/leaderboard" icon={<BarChart size={24} />} />
        <MobileNavItem to="/profile" icon={<User size={24} />} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => clsx(
      "flex items-center gap-4 px-4 py-3 font-mono text-sm uppercase tracking-wide transition-all border-2 border-transparent",
      isActive ? "bg-void text-chalk border-void" : "hover:bg-static/20"
    )}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => clsx(
      "p-3 transition-all rounded",
      isActive ? "bg-void text-chalk" : "text-void"
    )}
  >
    {icon}
  </NavLink>
);
