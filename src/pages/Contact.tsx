import React from 'react';
import { motion } from 'framer-motion';
import { Send, ShieldCheck, MessageCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-20 min-h-[80vh] flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
        {/* Left: Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">
            建立 <span className="text-system-blue">连接</span>
          </h1>
          <p className="text-gray-400 mb-12 text-lg">
            目前我们全面启用 Telegram 作为唯一官方加密通讯渠道。如果您有特殊需求，或希望安排私人定制服务，请直接联系我们的专属客服。
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-system-blue/10 rounded-lg text-system-blue group-hover:bg-system-blue group-hover:text-white transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram 客服一号</h3>
                <a href="https://t.me/lycamzm281k" target="_blank" rel="noopener noreferrer" className="text-2xl font-mono text-system-blue hover:text-blue-400 transition-colors block mb-1">
                  @lycamzm281k
                </a>
                <p className="text-xs text-gray-500">24小时待命 / 优先接待 S 级会员</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-system-blue/10 rounded-lg text-system-blue group-hover:bg-system-blue group-hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram 客服二号</h3>
                <a href="https://t.me/guanxinglou" target="_blank" rel="noopener noreferrer" className="text-2xl font-mono text-system-blue hover:text-blue-400 transition-colors block mb-1">
                  @guanxinglou
                </a>
                <p className="text-xs text-gray-500">业务咨询 / 预约安排 / 投诉建议</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-4 border border-red-500/30 bg-red-500/5 rounded text-sm text-red-400">
            <p className="font-bold mb-1">⚠️ 安全提示</p>
            <p className="opacity-80">请认准以上官方账号。观星楼工作人员绝不会要求您在非官方渠道进行转账。所有交易请通过官方验证流程进行。</p>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-abyss-light border border-white/10 p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <ShieldCheck className="w-32 h-32 text-system-blue" />
          </div>

          <h3 className="text-2xl font-bold mb-6">发送加密留言</h3>
          <p className="text-gray-500 text-sm mb-6">如果您暂时无法使用 Telegram，可在此留下您的联系方式，我们将通过加密邮件与您取得联系。</p>
          
          <form className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-mono text-gray-500 mb-2">您的代号 / 称呼</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 focus:border-system-blue focus:outline-none text-white transition-colors" placeholder="Mr. Shadow" />
            </div>
            
            <div>
              <label className="block text-sm font-mono text-gray-500 mb-2">备用联系方式 (Email/WeChat)</label>
              <input type="text" className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 focus:border-system-blue focus:outline-none text-white transition-colors" placeholder="secure@email.com" />
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-500 mb-2">需求简述</label>
              <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 focus:border-system-blue focus:outline-none text-white transition-colors" placeholder="请输入您的特殊要求..."></textarea>
            </div>

            <button type="button" className="w-full bg-system-blue text-white font-bold py-4 rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              发送讯息
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
