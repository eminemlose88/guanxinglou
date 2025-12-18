import React from 'react';
import { useAuthStore, Rank } from '../../store/authStore';
import { Ban, CheckCircle, Shield, Crown, Star, User, ChevronUp } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, toggleUserStatus, updateUserRank } = useAuthStore();

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'VIP': return <Crown className="w-4 h-4 text-rank-s" />;
      case 'S': return <Crown className="w-4 h-4 text-rank-s" />; // Legacy support
      case 'Common': return <User className="w-4 h-4 text-gray-400" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">用户权限管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-abyss-light border border-white/10 rounded-lg p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {user.username}
                  {getRankIcon(user.rank)}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {user.id}</p>
                {user.secretKey && <p className="text-[10px] text-gray-600 font-mono mt-1 break-all">Key: {user.secretKey}</p>}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {user.status}
              </span>
            </div>

            <div className="text-sm text-gray-400 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span>权限等级:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    user.rank === 'VIP' || user.rank === 'S' ? 'text-rank-s' : 'text-gray-400'
                  }`}>{user.rank === 'VIP' ? 'VIP会员' : user.rank === 'Common' ? '普通会员' : user.rank}</span>
                  
                  {user.rank !== 'VIP' && (
                    <button 
                      onClick={() => updateUserRank(user.id, 'VIP')}
                      className="bg-rank-gold/20 text-rank-gold border border-rank-gold/50 rounded text-xs px-2 py-1 hover:bg-rank-gold hover:text-black transition-colors flex items-center gap-1"
                    >
                      <ChevronUp className="w-3 h-3" /> 升级VIP
                    </button>
                  )}
                  {user.rank === 'VIP' && (
                    <button 
                      onClick={() => updateUserRank(user.id, 'Common')}
                      className="bg-white/10 text-gray-400 border border-white/20 rounded text-xs px-2 py-1 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      降级
                    </button>
                  )}
                </div>
              </div>
              <p>最后登录: {user.lastLogin}</p>
            </div>

            <button 
              onClick={() => toggleUserStatus(user.id)}
              className={`w-full py-2 rounded font-bold flex items-center justify-center gap-2 transition-colors ${
                user.status === 'active' 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                  : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
              }`}
            >
              {user.status === 'active' ? (
                <><Ban className="w-4 h-4" /> 封禁账户</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> 解除封禁</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
