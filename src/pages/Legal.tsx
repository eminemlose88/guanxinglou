import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle, Scale, Lock, Users } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'privacy' | 'terms' | 'disclaimer';

export const Legal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'privacy';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && ['privacy', 'terms', 'disclaimer'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'privacy', label: '隐私政策', icon: <Lock className="w-4 h-4" /> },
    { id: 'terms', label: '会员条款', icon: <Users className="w-4 h-4" /> },
    { id: 'disclaimer', label: '免责声明', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4">法律与合规</h1>
          <p className="text-gray-400 text-sm">Legal & Compliance Center</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as Tab)}
                className={clsx(
                  "px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                  activeTab === tab.id 
                    ? "bg-system-blue text-white shadow-lg shadow-blue-900/50" 
                    : "text-gray-500 hover:text-white"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-abyss-light border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-system-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                  <Shield className="w-8 h-8 text-system-blue" />
                  <h2 className="text-2xl font-bold text-white">隐私保护协议</h2>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                  <h3 className="text-white">1. 信息收集原则</h3>
                  <p>
                    观星楼（以下简称“本平台”）高度重视用户隐私。我们仅收集为提供服务所必需的最少信息，包括但不限于您的加密公钥、登录日志及您主动提供的偏好设置。所有敏感数据均采用 AES-256 标准进行端到端加密存储。
                  </p>

                  <h3 className="text-white mt-6">2. 数据使用与共享</h3>
                  <p>
                    您的个人信息仅用于身份验证及匹配服务。本平台承诺：
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>绝不向任何第三方机构或个人出售、出租或交易您的个人信息。</li>
                    <li>仅在法律法规强制要求或配合执法部门调查时，才会披露必要的加密数据。</li>
                    <li>所有档案浏览记录将在会话结束后定期清除，确保您的足迹不被追踪。</li>
                  </ul>

                  <h3 className="text-white mt-6">3. 匿名性与安全</h3>
                  <p>
                    我们采用了先进的零知识证明技术（Zero-Knowledge Proofs）来验证您的会员资格，这意味着服务器端无需明文存储您的真实身份信息即可完成验证。
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                  <Scale className="w-8 h-8 text-rank-gold" />
                  <h2 className="text-2xl font-bold text-white">会员服务条款</h2>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                  <h3 className="text-white">1. 会员资格</h3>
                  <p>
                    本平台实行严格的邀请制与审核制。所有会员必须年满 18 周岁，并具备完全民事行为能力。不同的会员等级（S/A/B/C）享有不同的权益与服务范围。
                  </p>

                  <h3 className="text-white mt-6">2. 行为准则</h3>
                  <p>
                    作为观星楼的尊贵会员，您同意遵守以下行为准则：
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong className="text-white">尊重与礼貌：</strong> 在任何互动中保持绅士风度，严禁任何形式的辱骂、骚扰或暴力行为。</li>
                    <li><strong className="text-white">诚信履约：</strong> 严格遵守预约时间与约定内容，如有变动需提前 24 小时通知。</li>
                    <li><strong className="text-white">保密义务：</strong> 不得泄露平台内任何档案信息、图片或视频资料，违者将永久封号并追究法律责任。</li>
                  </ul>

                  <h3 className="text-white mt-6">3. 违规处理</h3>
                  <p>
                    对于违反上述条款的会员，平台有权视情节轻重采取警告、降级、冻结账户或永久除名等措施，且不予退还任何已支付的费用。
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'disclaimer' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-white">免责声明</h2>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                  <h3 className="text-white">1. 内容真实性</h3>
                  <p>
                    本平台所有档案信息均经过初步审核，但我们无法保证所有信息的 100% 实时准确性。由于个人状态的动态变化，实际情况可能与档案描述存在细微差异，请以实际接触为准。
                  </p>

                  <h3 className="text-white mt-6">2. 责任限制</h3>
                  <p>
                    本平台仅作为信息撮合与展示的中介平台。对于会员之间在线下发生的任何纠纷、意外或损失（包括但不限于人身伤害、财产损失），本平台不承担任何法律责任。请双方在互动过程中务必注意人身与财产安全。
                  </p>

                  <h3 className="text-white mt-6">3. 不可抗力</h3>
                  <p>
                    因黑客攻击、电信部门技术调整、病毒侵袭等不可抗力因素导致的服务中断或数据丢失，本平台不承担责任，但将尽力减少对用户的影响。
                  </p>
                  
                  <div className="bg-red-900/20 border border-red-500/20 p-4 rounded mt-8">
                    <p className="text-red-300 text-xs font-bold text-center">
                      * 访问本网站即表示您已阅读并完全接受上述所有条款。如果您不同意任何条款，请立即停止使用本服务。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-xs text-gray-600">
             最终解释权归观星楼所有 · Latest Update: 2024.12
           </p>
        </div>
      </div>
    </div>
  );
};
