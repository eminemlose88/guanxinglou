import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Lock, Key, ChevronRight, ShieldCheck } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const adminLogin = useAuthStore((state) => state.adminLogin);
  const navigate = useNavigate();

  // Use Test Key in Development, Real Key in Production
  const siteKey = import.meta.env.DEV 
    ? "1x00000000000000000000AA" 
    : (import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
        alert("请完成安全验证");
        return;
    }

    if (await adminLogin(password, secretKey)) {
      navigate('/admin/dashboard');
    } else {
      setError(true);
      // turnstile.reset();
      setCaptchaToken(null);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-abyss-light border border-red-500/20 p-8 rounded-lg shadow-2xl shadow-red-900/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">后台管理系统</h2>
            <p className="text-red-400/50 text-xs mt-2 font-mono">AUTHORIZED PERSONNEL ONLY</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">管理员密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-10 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">安全密钥</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-10 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Secret Key"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">安全验证</label>
              <div className="flex justify-center bg-black border border-red-900/30 rounded p-2 min-h-[70px]">
                  <Turnstile
                      siteKey={siteKey}
                      onSuccess={(token) => setCaptchaToken(token)}
                      options={{ theme: 'dark' }}
                  />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-mono text-center">
                [ERROR] 验证失败：密码或密钥错误
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              进入系统
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center text-[10px] text-gray-700 font-mono">
             IP: {Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}.XXX LOGGED
          </div>
        </div>
      </motion.div>
    </div>
  );
};
