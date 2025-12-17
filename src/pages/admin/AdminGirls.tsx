import React, { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { Profile } from '../../data/profiles';
import { Plus, Trash2, Edit, Save, X, Search, Upload, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';

export const AdminGirls: React.FC = () => {
  const { profiles, addProfile, updateProfile, deleteProfile } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUpload] = useState(false);
  const [uploadingVideo, setUploadVideo] = useState(false);
  
  // Form State
  const initialFormState: Partial<Profile> = {
    name: '',
    rank: 'B',
    classType: 'Mage',
    description: '',
    location: '',
    age: 20,
    height: 165,
    weight: 50,
    cup: 'C',
    occupation: '',
    isVirgin: false,
    periodDate: '',
    tattooSmoke: '无',
    limits: '',
    acceptSM: false,
    noCondom: false,
    creampie: false,
    oral: false,
    liveTogether: false,
    overnight: false,
    travel: '',
    monthlyBudget: '',
    monthlyDays: '',
    shortTermBudget: '',
    paymentSplit: '',
    reason: '',
    startTime: '',
    bonus: '',
    stats: { charm: 80, intelligence: 80, agility: 80 },
    price: '',
    images: [],
    videos: [],
    availability: 'Available'
  };

  const [formData, setFormData] = useState<Partial<Profile>>(initialFormState);

  const handleOpenModal = (profile?: Profile) => {
    if (profile) {
      setEditingId(profile.id);
      setFormData(profile);
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProfile(editingId, formData);
    } else {
      await addProfile(formData as Profile);
    }
    setIsModalOpen(false);
  };

  const handleChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageChange = (index: number, value: string) => {
     const newImages = [...(formData.images || [])];
     newImages[index] = value;
     setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }));
  };

  const removeImageField = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    setUpload(true);
    const file = event.target.files[0];
    
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), newBlob.url] 
      }));
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请确保您已配置 Vercel Blob 环境变量');
    } finally {
      setUpload(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    setUploadVideo(true);
    const file = event.target.files[0];
    
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setFormData(prev => ({ 
          ...prev, 
          videos: [...(prev.videos || []), newBlob.url] 
      }));
      
    } catch (error) {
      console.error('Video Upload failed:', error);
      alert('视频上传失败，请确保您已配置 Vercel Blob 环境变量');
    } finally {
      setUploadVideo(false);
    }
  };

  const removeVideoField = (index: number) => {
    const newVideos = [...(formData.videos || [])];
    newVideos.splice(index, 1);
    setFormData(prev => ({ ...prev, videos: newVideos }));
  };

  const handleStatChange = (stat: 'charm' | 'intelligence' | 'agility', value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats!, [stat]: parseInt(value) || 0 }
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">人员档案管理</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-system-blue hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新增档案
        </button>
      </div>

      <div className="bg-abyss-light border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-black/50 text-gray-200 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">基本信息</th>
              <th className="px-6 py-4">等级</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4">预算要求</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  {profile.name}
                  <div className="text-xs text-gray-500 mt-1">{profile.occupation}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{profile.location}</div>
                  <div className="text-xs text-gray-500">{profile.age}岁 / {profile.height}cm / {profile.cup}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${profile.rank === 'S' ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-300'}`}>
                    {profile.rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${profile.availability === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {profile.availability}
                </td>
                <td className="px-6 py-4 font-mono text-system-blue">{profile.monthlyBudget || profile.shortTermBudget}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => handleOpenModal(profile)} className="text-blue-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProfile(profile.id)} className="text-red-400 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-abyss border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? '编辑档案' : '新增档案'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Section 1: Basic Info */}
              <div>
                <h3 className="text-system-blue font-bold mb-4 uppercase text-sm border-b border-white/10 pb-2">基础信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">姓名</label>
                    <input type="text" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">等级</label>
                    <select value={formData.rank} onChange={(e) => handleChange('rank', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white">
                      <option value="S">S</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">位置 (省/市)</label>
                    <input type="text" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">职业</label>
                    <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">年龄</label>
                    <input type="number" value={formData.age} onChange={(e) => handleChange('age', parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">身高 (cm)</label>
                    <input type="number" value={formData.height} onChange={(e) => handleChange('height', parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">体重 (kg)</label>
                    <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">罩杯</label>
                    <input type="text" value={formData.cup} onChange={(e) => handleChange('cup', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                </div>
              </div>

              {/* Section 2: Private & Limits */}
              <div>
                <h3 className="text-system-blue font-bold mb-4 uppercase text-sm border-b border-white/10 pb-2">隐私与尺度</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isVirgin} onChange={(e) => handleChange('isVirgin', e.target.checked)} id="isVirgin" />
                    <label htmlFor="isVirgin" className="text-sm text-gray-300">是否Chu女</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.acceptSM} onChange={(e) => handleChange('acceptSM', e.target.checked)} id="acceptSM" />
                    <label htmlFor="acceptSM" className="text-sm text-gray-300">接受SM</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.noCondom} onChange={(e) => handleChange('noCondom', e.target.checked)} id="noCondom" />
                    <label htmlFor="noCondom" className="text-sm text-gray-300">检测无T</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.creampie} onChange={(e) => handleChange('creampie', e.target.checked)} id="creampie" />
                    <label htmlFor="creampie" className="text-sm text-gray-300">可内She</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.oral} onChange={(e) => handleChange('oral', e.target.checked)} id="oral" />
                    <label htmlFor="oral" className="text-sm text-gray-300">可口</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.liveTogether} onChange={(e) => handleChange('liveTogether', e.target.checked)} id="liveTogether" />
                    <label htmlFor="liveTogether" className="text-sm text-gray-300">同居</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.overnight} onChange={(e) => handleChange('overnight', e.target.checked)} id="overnight" />
                    <label htmlFor="overnight" className="text-sm text-gray-300">过夜</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">例假日期</label>
                    <input type="text" value={formData.periodDate} onChange={(e) => handleChange('periodDate', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">抽烟/纹身</label>
                    <input type="text" value={formData.tattooSmoke} onChange={(e) => handleChange('tattooSmoke', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div className="col-span-2">
                    <label className="block text-xs text-red-400 mb-1">雷点 (禁忌)</label>
                    <input type="text" value={formData.limits} onChange={(e) => handleChange('limits', e.target.value)} className="w-full bg-black/50 border border-red-500/30 rounded p-2 text-white" />
                   </div>
                </div>
              </div>

              {/* Section 3: Requirements */}
              <div>
                <h3 className="text-system-blue font-bold mb-4 uppercase text-sm border-b border-white/10 pb-2">需求与预算</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">月生活费</label>
                    <input type="text" value={formData.monthlyBudget} onChange={(e) => handleChange('monthlyBudget', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">短期预算 (3天)</label>
                    <input type="text" value={formData.shortTermBudget} onChange={(e) => handleChange('shortTermBudget', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">支付方式</label>
                    <input type="text" value={formData.paymentSplit} onChange={(e) => handleChange('paymentSplit', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">陪伴天数/月</label>
                    <input type="text" value={formData.monthlyDays} onChange={(e) => handleChange('monthlyDays', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">最早出发时间</label>
                    <input type="text" value={formData.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div>
                    <label className="block text-xs text-gray-500 mb-1">接受外地</label>
                    <input type="text" value={formData.travel} onChange={(e) => handleChange('travel', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                   <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">找金主原因</label>
                    <input type="text" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                   </div>
                </div>
              </div>

              {/* Section 4: Bonus & Stats */}
              <div>
                <h3 className="text-system-blue font-bold mb-4 uppercase text-sm border-b border-white/10 pb-2">详细描述</h3>
                 <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">自我加分项</label>
                    <textarea value={formData.bonus} onChange={(e) => handleChange('bonus', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-20" />
                 </div>
                 <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">综合描述</label>
                    <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-24" />
                 </div>

                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-2">照片管理 (第一张为封面)</label>
                  <div className="space-y-2">
                    {formData.images?.map((img, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={img} 
                          onChange={(e) => handleImageChange(index, e.target.value)} 
                          className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-white" 
                          placeholder="图片 URL"
                        />
                        <button type="button" onClick={() => removeImageField(index)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                        <button type="button" onClick={addImageField} className="text-sm text-system-blue hover:text-white flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 添加图片链接
                        </button>
                        <label className="text-sm text-green-500 hover:text-white flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3" /> 
                            {uploading ? '上传中...' : '上传图片 (Blob)'}
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                        </label>
                    </div>
                  </div>
                </div>

                {/* Video Upload Section */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-2">视频管理</label>
                  <div className="space-y-2">
                    {formData.videos?.map((video, index) => (
                      <div key={index} className="flex gap-2">
                         <input 
                          type="text" 
                          value={video} 
                          readOnly
                          className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-white text-xs truncate" 
                        />
                        <button type="button" onClick={() => removeVideoField(index)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                     <div className="flex gap-2">
                        <label className="text-sm text-purple-500 hover:text-white flex items-center gap-1 cursor-pointer">
                            <Video className="w-3 h-3" /> 
                            {uploadingVideo ? '上传中...' : '上传视频 (Blob)'}
                            <input type="file" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} accept="video/mp4,video/webm,video/quicktime" />
                        </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-xs text-gray-500 mb-1">系统属性-魅力</label>
                        <input type="number" value={formData.stats?.charm} onChange={(e) => handleStatChange('charm', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                     </div>
                     <div>
                        <label className="block text-xs text-gray-500 mb-1">系统属性-智力</label>
                        <input type="number" value={formData.stats?.intelligence} onChange={(e) => handleStatChange('intelligence', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                     </div>
                     <div>
                        <label className="block text-xs text-gray-500 mb-1">系统属性-才艺</label>
                        <input type="number" value={formData.stats?.agility} onChange={(e) => handleStatChange('agility', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                     </div>
                 </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10 sticky bottom-0 bg-abyss p-4 -mx-6 -mb-6 border-t-2 border-system-blue/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-400 hover:text-white">取消</button>
                <button type="submit" className="bg-system-blue px-8 py-2 rounded text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-900/50">保存档案</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
