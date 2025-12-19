import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Star, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const MainLayout: React.FC = () => {
  const { isAuthenticated, logoutUser } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { path: '/gallery', label: '图鉴' },
    { path: '/process', label: '流程' },
    { path: '/about', label: '关于我们' },
    { path: '/contact', label: '联系方式' },
  ];

  return (
    <div className="min-h-screen bg-abyss text-white font-sans overflow-x-hidden selection:bg-system-blue selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group z-50">
            <Star className="w-6 h-6 text-system-blue group-hover:text-blue-400 transition-colors" />
            <span className="text-xl font-bold tracking-wider uppercase">观星楼</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-sm font-medium tracking-wide transition-colors",
                  location.pathname === link.path ? 'text-system-blue' : 'text-gray-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
                <span className="text-xs text-rank-gold border border-rank-gold/30 px-2 py-1 rounded">老板通道</span>
                <button onClick={logoutUser} className="text-gray-400 hover:text-white" title="退出">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ml-4 border-l border-white/10 pl-4">
                <User className="w-4 h-4" />
                登录
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-400 hover:text-white z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 w-full bg-abyss-light border-b border-white/10 md:hidden flex flex-col p-6 gap-4 shadow-2xl"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "text-lg font-medium py-2 border-b border-white/5",
                    location.pathname === link.path ? 'text-system-blue' : 'text-gray-400'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4">
                 {isAuthenticated ? (
                    <button onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-400">
                       <LogOut className="w-5 h-5" /> 退出登录
                    </button>
                 ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-system-blue">
                       <User className="w-5 h-5" /> 登录系统
                    </Link>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen relative">
        {/* Background Grid/Particles could go here */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed"></div>
        
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-system-blue" />
                <span className="text-lg font-bold uppercase tracking-wider">观星楼</span>
             </div>
             <p className="text-gray-500 text-sm max-w-sm">
               专为精英阶层打造的高端人才储备与管理平台。在这个混乱的世界，我们为您寻找唯一的秩序与美。
             </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest">导航</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/gallery" className="hover:text-system-blue transition-colors">精选图鉴</Link></li>
              <li><Link to="/process" className="hover:text-system-blue transition-colors">服务流程</Link></li>
              <li><Link to="/about" className="hover:text-system-blue transition-colors">关于我们</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest">法律</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/legal?tab=privacy" className="hover:text-white transition-colors">隐私协议</Link></li>
              <li><Link to="/legal?tab=terms" className="hover:text-white transition-colors">会员条款</Link></li>
              <li><Link to="/legal?tab=disclaimer" className="hover:text-white transition-colors">免责声明</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-gray-700 text-xs">
          <p>&copy; 2024 Guanxinglou. All rights reserved. System V2.0.4</p>
        </div>
      </footer>
    </div>
  );
};
