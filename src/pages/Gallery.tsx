import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore, Rank } from '../store/authStore';
import { Filter, Search, Lock, MapPin, Heart } from 'lucide-react';
import clsx from 'clsx';

export const Gallery: React.FC = () => {
  const { profiles } = useProfileStore();
  const { userRank } = useAuthStore();
  const [filterRank, setFilterRank] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to check if user can view a specific profile rank
  const canViewProfile = (profileRank: string, userRank: Rank): boolean => {
    const rankValue: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'None': 0 };
    return rankValue[userRank] >= rankValue[profileRank];
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // 1. Filter by User Rank Access
      const hasAccess = canViewProfile(p.rank, userRank);
      if (!hasAccess) return false;

      // 2. Filter by UI Filter
      const matchRank = filterRank === 'All' || p.rank === filterRank;
      
      // 3. Filter by Search
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchRank && matchSearch;
    });
  }, [filterRank, searchTerm, profiles, userRank]);

  const ranks = ['All', 'S', 'A', 'B', 'C'];

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            人员数据库
          </h1>
          <p className="text-gray-400">
            当前权限等级: <span className="text-system-blue font-bold">{userRank}级</span>
            {userRank === 'None' && <span className="text-xs ml-2 text-red-500">(仅显示公开预览内容)</span>}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索姓名、职业、城市..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-abyss-light border border-white/10 rounded-full focus:border-system-blue focus:outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-abyss-light p-1 rounded-full border border-white/10">
            {ranks.map(rank => (
              <button
                key={rank}
                onClick={() => setFilterRank(rank)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                  filterRank === rank 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-500 hover:text-white"
                )}
              >
                {rank === 'All' ? '全部' : `${rank}级`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProfiles.map((profile) => (
            <motion.div
              layout
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/profile/${profile.id}`} className="block group relative h-[450px] bg-abyss-light rounded-xl overflow-hidden border border-white/5 hover:border-system-blue transition-colors">
                {/* Rank Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={clsx(
                    "w-10 h-10 flex items-center justify-center font-black text-lg rounded border bg-black/50 backdrop-blur",
                    profile.rank === 'S' ? "text-rank-s border-rank-s" : 
                    profile.rank === 'A' ? "text-rank-gold border-rank-gold" : 
                    "text-white border-white"
                  )}>
                    {profile.rank}
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-gray-800 transition-transform duration-500 group-hover:scale-110">
                    {profile.images && profile.images.length > 0 ? (
                      <img src={profile.images[0]} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-xs">
                          No Image
                      </div>
                    )}
                </div>

                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                
                <div className="absolute bottom-0 left-0 w-full p-5">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="text-xl font-bold">{profile.name}</h3>
                     <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">{profile.age}岁</span>
                  </div>
                  
                  <p className="text-system-blue text-xs font-mono mb-3 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {profile.location} · {profile.occupation}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono border-t border-white/10 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">身高</span>
                      <span className="text-white font-bold">{profile.height}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">罩杯</span>
                      <span className="text-white font-bold">{profile.cup}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">状态</span>
                      <span className={profile.availability === 'Available' ? "text-green-400" : "text-red-400"}>
                        {profile.availability === 'Available' ? '空闲' : '忙碌'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-20 text-gray-500 font-mono">
          {userRank === 'None' ? (
            <div className="flex flex-col items-center gap-4">
               <Lock className="w-12 h-12 text-gray-600" />
               <p>您当前未登录，无法查看详细档案。</p>
               <Link to="/login" className="text-system-blue hover:underline">前往登录</Link>
            </div>
          ) : (
            <p>没有找到符合您权限等级 ({userRank}) 的档案。</p>
          )}
        </div>
      )}
    </div>
  );
};
