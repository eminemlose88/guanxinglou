import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Target, Users } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Manifesto Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-abyss-light">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
              我们是 <br/> <span className="text-system-blue">暗夜中的星光</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
              “观星楼”不仅仅是一个平台，它是精英阶层的避风港。在这个喧嚣的世界里，我们为您筛选出最纯粹的美好，守护最极致的私密。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-system-blue to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">极致尊贵</h3>
            <p className="text-gray-400 leading-relaxed">
              每一位入驻观星楼的“星辰”都经过严苛筛选。颜值、才艺、素养，缺一不可。只为匹配您的王者身份。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-rank-gold to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-900/50">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">精准匹配</h3>
            <p className="text-gray-400 leading-relaxed">
              不仅仅是外表。我们通过多维数据分析，为您匹配灵魂契合的专属伴侣。懂您所需，应您所求。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-gray-900/50">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">绝对隐私</h3>
            <p className="text-gray-400 leading-relaxed">
              在这里，您的身份是最高机密。我们采用军用级加密通讯，确保每一次接触都如深海般静谧无痕。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Text */}
      <section className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-system-blue">我们的愿景</h2>
            <p className="text-lg text-gray-500 leading-8">
                在这个快节奏的时代，真正的陪伴成为了奢侈品。观星楼建立的初衷，就是打破平庸，为处于金字塔顶端的您，提供一个可以卸下防备、享受纯粹愉悦的私属领地。我们不制造美，我们只是美的搬运工与守护者。
            </p>
            <div className="mt-12">
                <p className="font-mono text-sm text-gray-600">—— 观星楼创始人 / The Architect</p>
            </div>
        </div>
      </section>
    </div>
  );
};
