import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';

export const Home: React.FC = () => {
  const { profiles } = useProfileStore(); // Use store
  const featuredProfiles = profiles.slice(0, 3);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Placeholder for Video/Image Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/50 to-abyss z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        
        <div className="relative z-20 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              突破 · 界限 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-system-blue to-purple-600">掌控世界</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              欢迎来到观星楼。精英陪伴与S级人才的首选之地。
            </p>
            
            <Link 
              to="/gallery"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-system-blue hover:text-white transition-all transform hover:scale-105"
            >
              进入高塔 <ChevronRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Section (Pick Up) */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-widest border-l-4 border-system-blue pl-4">
            精选推荐
          </h2>
          <Link to="/gallery" className="text-system-blue hover:text-white transition-colors">查看全部</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative h-[500px] overflow-hidden rounded-xl bg-abyss-light border border-white/5 hover:border-system-blue/50 transition-colors"
            >
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-gray-800">
                 {/* Replace this div with an actual img tag later */}
                 <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                    IMG_PLACEHOLDER_{profile.name.toUpperCase()}
                 </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

              <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-2xl font-bold italic">{profile.name}</h3>
                   <span className={`text-xl font-black ${profile.rank === 'S' ? 'text-rank-s' : 'text-rank-gold'}`}>
                     {profile.rank}级
                   </span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{profile.description}</p>
                <div className="flex items-center gap-2 text-system-blue text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>查看档案</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
