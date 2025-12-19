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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredProfiles = useMemo(() => {
    // If user is not logged in, show nothing (Login prompt will appear)
    if (userRank === 'None') return [];

    return profiles.filter(p => {
      // Filter out deleted profiles
      if (p.isDeleted) return false;

      // Filter by Search
      const nameMatch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const occupationMatch = (p.occupation || '').toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = (p.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return nameMatch || occupationMatch || locationMatch;
    });
  }, [searchTerm, profiles, userRank]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProfiles, currentPage]);

  // Reset to page 1 when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            人员数据库
          </h1>
          <p className="text-gray-400">
            当前权限等级: <span className="text-system-blue font-bold">{userRank === 'VIP' ? 'VIP会员' : userRank === 'Common' ? '普通会员' : '未登录'}</span>
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
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px] content-start">
        <AnimatePresence mode="popLayout">
          {paginatedProfiles.map((profile) => (
            <motion.div
              layout
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/profile/${profile.id}`} className="block group relative h-[450px] bg-abyss-light rounded-xl overflow-hidden border border-white/5 hover:border-system-blue transition-colors">
                
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pb-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-abyss-light border border-white/10 text-gray-400 hover:text-white hover:border-system-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            上一页
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  "w-8 h-8 rounded flex items-center justify-center font-mono text-sm transition-all",
                  currentPage === page 
                    ? "bg-system-blue text-white shadow-lg shadow-blue-900/50" 
                    : "bg-abyss-light border border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-abyss-light border border-white/10 text-gray-400 hover:text-white hover:border-system-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};
