import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Lock, MapPin, Ruler, Weight, Calendar, Heart, AlertTriangle, Plane, Clock, DollarSign, Star, X } from 'lucide-react';

export const ProfileDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdminAuthenticated, userRank, userRole } = useAuthStore();
  const { getProfile, fetchProfiles, profiles, loading } = useProfileStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Try to get profile from store
  const profile = getProfile(id || '');

  // Effect: If profile is not found but we have an ID, try fetching from server
  // This handles the "refresh page" scenario where Zustand store might be empty or stale
  React.useEffect(() => {
    if (id && !profile && !loading) {
        fetchProfiles(true); // Force fetch
    }
  }, [id, profile, loading, fetchProfiles]);

  if (loading && !profile) {
      return (
        <div className="flex items-center justify-center h-screen bg-abyss text-system-blue">
            <div className="animate-pulse">正在从加密数据库检索档案...</div>
        </div>
      );
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-500">未找到档案 (ID: {id})</div>;
  }

  const isVip = userRank === 'VIP' || isAdminAuthenticated || userRole === 'admin' || userRole === 'boss'; // Boss role is legacy, effectively VIP
  const showLockedContent = isAuthenticated && !isVip;
  const canViewContent = (isAuthenticated || isAdminAuthenticated) && isVip;

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | boolean }) => {
    // Robustness check: if value is null/undefined/empty string, display "无"
    let displayValue: React.ReactNode = '-';
    
    if (typeof value === 'boolean') {
        displayValue = value ? '是' : '否';
    } else if (value === 0 || (value && String(value).trim() !== '')) {
        displayValue = value;
    }

    return (
      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
        <div className="text-gray-400">{icon}</div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase">{label}</div>
          <div className="text-sm font-bold text-white">
            {displayValue}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row">
      {/* Left: Image & Quick Stats */}
      <div className="w-full md:w-5/12 h-1/3 md:h-full relative bg-gray-800 overflow-hidden group">
         {/* Background Image (Cover) */}
         {profile.images && profile.images.length > 0 ? (
           <img src={profile.images[0]} alt={profile.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
         ) : (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <span className="text-6xl text-white/10 font-black">{profile.cup} CUP</span>
            </div>
         )}
         
         <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-transparent"></div>
         
         <div className="absolute bottom-0 left-0 w-full p-8 z-10">
            <h1 className="text-5xl font-black text-white mb-2">{profile.name}</h1>
            <div className="flex items-center gap-4 text-lg">
               <span className="bg-system-blue px-2 py-1 rounded text-xs font-bold text-white">{profile.occupation}</span>
               <span className="text-gray-300">{profile.age}岁</span>
               <span className="text-gray-500">|</span>
               <span className="text-gray-300">{profile.location}</span>
            </div>
         </div>
         
         <button 
           onClick={() => navigate(-1)}
           className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur px-4 py-2 rounded-full"
         >
            <ArrowLeft className="w-4 h-4" /> 返回
         </button>
      </div>

      {/* Right: Detailed Info */}
      <div className="w-full md:w-7/12 h-2/3 md:h-full overflow-y-auto bg-abyss p-6 md:p-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto space-y-8"
        >
            {/* 0. Photo & Video Gallery */}
            {( (profile.images && profile.images.length > 1) || (profile.videos && profile.videos.length > 0) ) && (
              <section>
                 <h3 className="text-system-blue font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Star className="w-4 h-4" /> 影像资料
                 </h3>
                 <div className="grid grid-cols-3 gap-2">
                   {/* Videos - Only for VIP */}
                   {profile.videos?.map((vid, idx) => (
                     <div key={`vid-${idx}`} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black/50 group relative">
                        {canViewContent ? (
                            <video src={vid} controls className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-2">
                                <Lock className="w-6 h-6" />
                                <span className="text-[10px]">VIP 专享</span>
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
                             Video
                        </div>
                     </div>
                   ))}
                   {/* Images - Visible to all logged in */}
                   {profile.images?.slice(1).map((img, idx) => (
                     <div key={`img-${idx}`} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black/50 cursor-pointer" onClick={() => setSelectedImage(img)}>
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                     </div>
                   ))}
                 </div>
              </section>
            )}

            {/* Image Lightbox */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
                >
                  <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    src={selectedImage}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
                  />
                  <button
                    className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-black/50 rounded-full backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Basic Stats Grid */}
            <section>
              <h3 className="text-system-blue font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> 基础数据
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={<Ruler className="w-4 h-4" />} label="身高" value={`${profile.height} cm`} />
                <InfoItem icon={<Weight className="w-4 h-4" />} label="体重" value={`${profile.weight} kg`} />
                <InfoItem icon={<Heart className="w-4 h-4" />} label="罩杯" value={profile.cup} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="例假" value={profile.periodDate} />
              </div>
            </section>

            {/* 2. Scale & Limits */}
            <section>
              <h3 className="text-system-blue font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> 尺度与禁忌
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 mb-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">Chu女</span>
                       <span className={profile.isVirgin ? "text-green-400 font-bold" : "text-gray-500"}>{profile.isVirgin ? "是" : "否"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">接受SM</span>
                       <span className={profile.acceptSM ? "text-green-400 font-bold" : "text-gray-500"}>{profile.acceptSM ? "是" : "否"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">无T</span>
                       <span className={profile.noCondom ? "text-green-400 font-bold" : "text-gray-500"}>{profile.noCondom ? "可" : "否"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">内She</span>
                       <span className={profile.creampie ? "text-green-400 font-bold" : "text-gray-500"}>{profile.creampie ? "可" : "否"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">口</span>
                       <span className={profile.oral ? "text-green-400 font-bold" : "text-gray-500"}>{profile.oral ? "可" : "否"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-gray-400 text-sm">同居/过夜</span>
                       <span className="text-white text-sm">{profile.liveTogether ? '同居' : ''} {profile.overnight ? '过夜' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 col-span-2">
                       <span className="text-gray-400 text-sm">外地差旅</span>
                       <span className="text-white text-sm">{profile.travel}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex gap-2">
                       <span className="text-gray-500 text-sm whitespace-nowrap">纹身/抽烟:</span>
                       <span className="text-white text-sm">{profile.tattooSmoke || '无'}</span>
                    </div>
                    <div className="flex gap-2">
                       <span className="text-red-400 text-sm whitespace-nowrap">雷点禁忌:</span>
                       <span className="text-red-300 text-sm">{profile.limits || '无'}</span>
                    </div>
                 </div>
              </div>
            </section>

            {/* 3. Description & Bonus */}
            <section>
               <h3 className="text-system-blue font-bold uppercase tracking-widest mb-4">自我介绍</h3>
               <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                  <div>
                    <span className="text-xs text-system-blue font-bold uppercase mb-1 block">加分项</span>
                    <p className="text-white">{profile.bonus || '暂无描述'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase mb-1 block">个人描述</span>
                    <p className="text-gray-300 leading-relaxed text-sm">{profile.description || '暂无描述'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase mb-1 block">寻主原因</span>
                    <p className="text-gray-400 italic text-sm">"{profile.reason || '暂无描述'}"</p>
                  </div>
               </div>
            </section>

            {/* 4. Budget & Action */}
            {canViewContent ? (
                <section className="bg-rank-gold/10 border border-rank-gold/30 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="w-5 h-5 text-rank-gold" />
                        <h3 className="text-rank-gold font-bold uppercase tracking-widest">预算方案</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="text-xs text-rank-gold/70 uppercase">月生活费</div>
                            <div className="text-2xl font-bold text-white">{profile.monthlyBudget}</div>
                            <div className="text-xs text-gray-400 mt-1">陪伴: {profile.monthlyDays}</div>
                        </div>
                        <div>
                            <div className="text-xs text-rank-gold/70 uppercase">短期(3天)</div>
                            <div className="text-2xl font-bold text-white">{profile.shortTermBudget}</div>
                            <div className="text-xs text-gray-400 mt-1">支付: {profile.paymentSplit}</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-rank-gold/20">
                         <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Clock className="w-4 h-4" />
                            最早出发: <span className="text-white">{profile.startTime}</span>
                         </div>
                         <button className="bg-rank-gold hover:bg-yellow-400 text-black px-8 py-3 rounded font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                            <CheckCircle className="w-5 h-5" />
                            发起签约
                         </button>
                    </div>
                </section>
            ) : showLockedContent ? (
                <div className="bg-purple-900/20 border border-purple-500/30 p-8 rounded-xl text-center">
                    <Lock className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-purple-300 font-bold text-lg mb-2">高级权限锁定</h4>
                    <p className="text-sm text-gray-400 mb-6">查看详细预算与私密视频需要 VIP 会员权限。</p>
                    <button 
                        onClick={() => alert('请联系管理员升级您的账户权限')}
                        className="text-white bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded transition-colors font-bold shadow-lg shadow-purple-900/50"
                    >
                        联系管理员升级
                    </button>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center">
                    <Lock className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h4 className="text-red-400 font-bold text-lg mb-2">机密信息加密中</h4>
                    <p className="text-sm text-gray-400 mb-6">具体的预算要求、联系方式及深度服务细节仅对认证会员开放。</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded transition-colors"
                    >
                        登录查看完整档案
                    </button>
                </div>
            )}
        </motion.div>
      </div>
    </div>
  );
};
