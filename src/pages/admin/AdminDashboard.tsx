import React, { useState, useEffect } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Users, UserCheck, DollarSign, Activity, Crown, Server, Database, Shield, Zap } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profiles } = useProfileStore();
  const { users } = useAuthStore();
  
  // System Status State
  const [serverLoad, setServerLoad] = useState(12);
  const [latency, setLatency] = useState(0);
  const [dbStatus, setDbStatus] = useState<'Stable' | 'Connecting'>('Stable');

  useEffect(() => {
    // Simulate Server Load Fluctuation
    const loadInterval = setInterval(() => {
      setServerLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const newValue = Math.max(5, Math.min(40, prev + change));
        return newValue;
      });
    }, 2000);

    // Measure Latency (Ping)
    const pingInterval = setInterval(async () => {
      const start = Date.now();
      try {
        await fetch('/', { method: 'HEAD', cache: 'no-store' });
        const end = Date.now();
        setLatency(end - start);
      } catch (e) {
        // ignore error
      }
    }, 5000);

    return () => {
      clearInterval(loadInterval);
      clearInterval(pingInterval);
    };
  }, []);

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

        <div className="bg-abyss-light border border-white/10 p-6 rounded-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-24 h-24 text-system-blue" />
           </div>
           
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-green-500" /> 
              Vercel 节点监控
           </h3>
           
           <div className="space-y-6">
              {/* Server Load */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-400">Edge 节点负载</span>
                   <span className={serverLoad > 30 ? "text-yellow-400" : "text-green-500"}>
                      {serverLoad > 30 ? '繁忙' : '正常'} ({serverLoad}%)
                   </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div 
                      className="bg-green-500 h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${serverLoad}%` }}
                   ></div>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                 <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">PostgreSQL</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm text-green-500">{dbStatus}</span>
                 </div>
              </div>

              {/* Network / Latency */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                 <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">实时延迟 (Latency)</span>
                 </div>
                 <span className="text-sm font-mono text-white">{latency > 0 ? `${latency}ms` : 'Checking...'}</span>
              </div>
              
              {/* Encryption */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                 <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">加密通道</span>
                 </div>
                 <span className="text-sm text-purple-400">TLS 1.3 / AES-256</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
