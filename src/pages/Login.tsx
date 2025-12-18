import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, Rank } from '../store/authStore';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronRight, Crown, Star, Shield, User } from 'lucide-react';
import clsx from 'clsx';
import Turnstile, { useTurnstile } from 'react-turnstile';

import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const turnstile = useTurnstile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
        alert("请完成人机验证");
        return;
    }

    // Rank parameter is ignored by the store now, passing 'Common' as placeholder
    if (await login('Common', password)) {
      navigate('/gallery');
    } else {
      setError(true);
      turnstile.reset();
      setCaptchaToken(null);
      setTimeout(() => setError(false), 2000); // Reset shake
    }
  };

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
            请输入您的私钥以进行身份验证。
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <label className="block text-xs font-mono text-system-blue mb-2">私钥 (SECRET KEY)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white focus:border-system-blue focus:outline-none focus:ring-1 focus:ring-system-blue transition-all"
                placeholder="请输入您的私钥"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-system-blue mb-2">人机验证</label>
              <div className="flex justify-center bg-black/50 border border-white/20 rounded p-2">
                  <Turnstile
                      sitekey="1x00000000000000000000AA" // Cloudflare Test Site Key
                      onVerify={(token) => setCaptchaToken(token)}
                      theme="dark"
                  />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-xs font-mono text-center"
              >
                [错误] 验证失败。私钥无效或已被封禁。
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
                没有密钥？申请注册会员
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600 font-mono">
              加密协议: RSA-4096 // 安全等级: TOP-SECRET
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
