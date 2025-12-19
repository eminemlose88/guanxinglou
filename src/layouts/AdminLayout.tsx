import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, UserCog, LogOut, Shield, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminLayout: React.FC = () => {
  const { isAdminAuthenticated, logoutAdmin, fetchUsers } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      // Fetch users only when authenticated as admin
      fetchUsers();
    }
  }, [isAdminAuthenticated, navigate, fetchUsers]);

  if (!isAdminAuthenticated) return null;

  const menuItems = [
    { path: '/admin/dashboard', label: '概览', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/girls', label: '人员管理', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/users', label: '用户管理', icon: <UserCog className="w-5 h-5" /> },
    { path: '/admin/messages', label: '加密留言', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-abyss flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          <span className="font-bold tracking-widest text-lg">后台管理系统</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded transition-colors",
                location.pathname === item.path 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 w-full hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-black/50 border-b border-white/10 flex items-center justify-between px-8">
           <h2 className="text-gray-400 text-sm">当前位置: <span className="text-white">{location.pathname}</span></h2>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-mono text-green-500">SYSTEM ONLINE</span>
           </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
