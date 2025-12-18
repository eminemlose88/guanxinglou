import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, FileSignature, Sparkles, ArrowRight } from 'lucide-react';

export const Process: React.FC = () => {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "身份认证",
      desc: "注册并验证您的老板身份。只有通过资产验证的精英才能获得VIP权限。"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "甄选目标",
      desc: "在观星楼的深渊图鉴中，根据属性、等级和才艺挑选您心仪的专属伴侣。"
    },
    {
      icon: <FileSignature className="w-8 h-8" />,
      title: "签订契约",
      desc: "发起签约申请。我们的管家团队将处理所有细节，确保绝对的隐私与安全。"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "星光降临",
      desc: "契约达成。您选中的‘星辰’将降临到您身边，开启一段专属的梦幻旅程。"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
          <span className="text-system-blue">服务</span> 流程
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          从初识到相伴，我们为您打造了如行云流水般的尊贵体验。只需四步，即可掌控星辰。
        </p>
      </motion.div>

      <div className="relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-blue/50 to-transparent -translate-y-1/2 z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-abyss-light border border-white/10 p-8 rounded-xl text-center hover:border-system-blue/50 transition-colors group"
            >
              <div className="w-20 h-20 mx-auto bg-black rounded-full flex items-center justify-center border-2 border-system-blue mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                <div className="text-white group-hover:text-system-blue transition-colors">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4 text-system-blue">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-sm font-mono text-gray-500 mb-6">准备好开始了吗？</p>
        <a href="/gallery" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-system-blue hover:text-white transition-all transform hover:scale-105">
          即刻选人
        </a>
      </div>
    </div>
  );
};
