export interface Profile {
  id: string;
  name: string;
  rank: string; // Simplified from specific unions to string to support "Common", "VIP" or legacy
  classType: 'Mage' | 'Assassin' | 'Healer' | 'Tank' | 'None'; // Keeping for legacy/theme or 'None'
  description: string;
  
  // Basic Info
  location: string; // 省份 城市
  age: number; // 年龄
  height: number; // 身高
  weight: number; // 体重
  cup: string; // 罩杯
  occupation: string; // 职业
  
  // Private Info
  isVirgin: boolean; // 是否chu女
  periodDate: string; // 例假日期
  tattooSmoke: string; // 是否有抽烟/纹身
  
  // Preferences / Scale
  limits: string; // 雷点
  acceptSM: boolean; // 可否接受SM
  noCondom: boolean; // 检测后可否无t
  creampie: boolean; // 可否内
  oral: boolean; // 洗干净后可否口
  
  // Service Info
  liveTogether: boolean; // 可否同居
  overnight: boolean; // 可否过夜
  travel: string; // 可否飞外地
  
  // Financial
  monthlyBudget: string; // 月生活费
  monthlyDays: string; // 月可陪伴天数
  shortTermBudget: string; // 短期三天零花
  paymentSplit: string; // 分几次支付
  
  // Other
  reason: string; // 找金主的原因
  startTime: string; // 最早出发时间
  bonus: string; // 自我加分项

  // Legacy fields compatible
  stats: {
    charm: number;
    intelligence: number;
    agility: number;
  };
  price: string; // Display price (summary)
  images: string[];
  videos?: string[]; // Optional video array
  availability: 'Available' | 'On Mission' | 'Resting';
  isDeleted?: boolean;
}

export const profiles: Profile[] = [];
