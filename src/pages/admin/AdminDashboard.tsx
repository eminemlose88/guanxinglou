import React from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Users, UserCheck, DollarSign, Activity, Crown } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profiles } = useProfileStore();
  const { users } = useAuthStore();

  const activeGirls = profiles.filter(p => p.availability === 'Available').length;
  const sRankUsers = users.filter(u => u.rank === 'S').length;
  const totalRevenue = "98,500,000"; // Mock data

  const stats = [
    { label: '总档案数', value: profiles.length, icon: <Users className="text-blue-500" />, change: '+2 本周' },
    { label: 'S级会员', value: sRankUsers, icon: <Crown className="text-rank-s" />, change: '新增 1 人' },
    { label: '活跃用户', value: users.filter(u => u.status === 'active').length, icon: <Activity className="text-purple-500" />, change: '稳定' },
    { label: '本月营收 (G)', value: totalRevenue, icon: <DollarSign className="text-rank-gold" />, change: '+12%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">系统概览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-abyss-light border border-white/10 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-lg">{stat.icon}</div>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{stat.change}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Mock */}
        <div className="bg-abyss-light border border-white/10 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">近期活动日志</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 text-sm border-b border-white/5 pb-4 last:border-0">
                <div className="w-2 h-2 rounded-full bg-system-blue"></div>
                <span className="text-gray-400">2024-01-15 14:30</span>
                <span className="text-white">Admin 修改了 [塞拉菲娜] 的价格</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-abyss-light border border-white/10 p-6 rounded-lg">
           <h3 className="text-lg font-bold text-white mb-4">系统状态</h3>
           <div className="space-y-4">
              <div className="flex justify-between text-sm">
                 <span className="text-gray-400">服务器负载</span>
                 <span className="text-green-500">正常 (12%)</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                 <div className="bg-green-500 w-[12%] h-full"></div>
              </div>

              <div className="flex justify-between text-sm mt-4">
                 <span className="text-gray-400">数据库连接</span>
                 <span className="text-green-500">稳定</span>
              </div>
              
              <div className="flex justify-between text-sm mt-4">
                 <span className="text-gray-400">加密通道</span>
                 <span className="text-system-blue">已激活 (AES-256)</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
