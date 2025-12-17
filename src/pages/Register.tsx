import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { User, Copy, CheckCircle, ArrowRight, Shield } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    const key = await register(username);
    setGeneratedKey(key);
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-system-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="bg-abyss-light border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              加入观星楼
            </h1>
            <p className="text-gray-400 text-sm">注册即可获得C级会员权限</p>
          </div>

          {!generatedKey ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">设置用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-10 py-3 text-white focus:border-system-blue focus:outline-none transition-colors"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-system-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
              >
                立即注册
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-green-400 font-bold">注册成功</h3>
                <p className="text-xs text-green-300/70">您的账户已激活 (等级: C)</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-system-blue mb-2 uppercase text-center">您的专属私钥 (请务必保存)</label>
                <div 
                  onClick={copyToClipboard}
                  className="bg-black border border-system-blue/50 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group relative"
                >
                  <code className="text-xl font-mono text-white tracking-widest">{generatedKey}</code>
                  {isCopied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500 group-hover:text-white" />
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    点击复制
                  </div>
                </div>
                <p className="text-[10px] text-red-400 mt-2 text-center">
                  * 此密钥是您登录的唯一凭证，丢失无法找回。
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors"
              >
                前往登录
              </button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
              已有账号？直接登录
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
