import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, Rank } from '../store/authStore';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronRight, Crown, Star, Shield, User } from 'lucide-react';
import clsx from 'clsx';

import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [selectedRank, setSelectedRank] = useState<Rank>('S');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(selectedRank, password)) {
      navigate('/gallery');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000); // Reset shake
    }
  };

  const ranks: { id: Rank; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'S', label: 'S级公钥', icon: <Crown className="w-5 h-5" />, color: 'text-rank-s' },
    { id: 'A', label: 'A级公钥', icon: <Star className="w-5 h-5" />, color: 'text-rank-gold' },
    { id: 'B', label: 'B级公钥', icon: <Shield className="w-5 h-5" />, color: 'text-system-blue' },
    { id: 'C', label: 'C级公钥', icon: <User className="w-5 h-5" />, color: 'text-gray-400' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-abyss">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-system-blue/10 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* System Window Border Effect */}
        <div className="bg-black/80 border border-system-blue/50 backdrop-blur-xl p-8 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <ShieldAlert className="text-system-blue w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold tracking-widest text-white uppercase">身份验证系统</h2>
          </div>

          <p className="text-blue-200/70 mb-8 text-sm leading-relaxed">
            请选择您的公钥等级并输入对应的私钥以进行身份验证。
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Rank Selection Tabs */}
            <div className="grid grid-cols-4 gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
              {ranks.map((rank) => (
                <button
                  key={rank.id}
                  type="button"
                  onClick={() => { setSelectedRank(rank.id); setError(false); setPassword(''); }}
                  className={clsx(
                    "flex flex-col items-center justify-center py-2 rounded transition-all",
                    selectedRank === rank.id 
                      ? "bg-white/10 shadow-lg border border-white/20" 
                      : "hover:bg-white/5 opacity-50 hover:opacity-100"
                  )}
                >
                  <div className={rank.color}>{rank.icon}</div>
                  <span className={clsx("text-[10px] font-bold mt-1", selectedRank === rank.id ? "text-white" : "text-gray-500")}>
                    {rank.id}级
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-gray-500 font-mono mb-2">
               已选择: <span className="text-white font-bold">{ranks.find(r => r.id === selectedRank)?.label}</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-system-blue mb-2">私钥 (SECRET KEY)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-system-blue focus:outline-none focus:ring-1 focus:ring-system-blue transition-all"
                placeholder={`请输入 ${selectedRank} 级私钥`}
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-xs font-mono text-center"
              >
                [错误] 验证失败。私钥无效。
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-system-blue/20 hover:bg-system-blue/40 border border-system-blue text-system-blue hover:text-white py-3 rounded uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              接入系统
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-2">
              <Link to="/register" className="text-xs text-gray-500 hover:text-white underline underline-offset-4 transition-colors">
                没有密钥？申请注册C级权限
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600 font-mono">
              加密协议: RSA-4096 // 安全等级: {selectedRank}-CLASS
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
