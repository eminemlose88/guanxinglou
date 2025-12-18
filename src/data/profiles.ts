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

export const profiles: Profile[] = [
  {
    id: '1',
    name: '塞拉菲娜',
    rank: 'S',
    classType: 'Mage',
    description: '深渊之星。以优雅和毁灭性的智慧闻名。',
    location: '安徽 合肥',
    age: 22,
    height: 172,
    weight: 50,
    cup: 'D',
    occupation: '平面模特',
    isVirgin: false,
    periodDate: '15号',
    tattooSmoke: '无',
    limits: '不接受多人',
    acceptSM: false,
    noCondom: true,
    creampie: true,
    oral: true,
    liveTogether: true,
    overnight: true,
    travel: '可飞全球',
    monthlyBudget: '10W',
    monthlyDays: '15天',
    shortTermBudget: '1.5W',
    paymentSplit: '见人付半',
    reason: '想买房',
    startTime: '随时',
    bonus: '皮肤超白，会跳芭蕾，声音好听',
    stats: { charm: 98, intelligence: 95, agility: 80 },
    price: '100,000 RMB/月',
    images: ['/placeholders/seraphina.jpg'],
    videos: [],
    availability: 'Available',
    isDeleted: false
  },
  {
    id: '2',
    name: '尤娜',
    rank: 'A',
    classType: 'Healer',
    description: '温柔的灵魂，拥有抚慰疲惫旅人的力量。',
    location: '上海',
    age: 20,
    height: 165,
    weight: 48,
    cup: 'C',
    occupation: '学生',
    isVirgin: true,
    periodDate: '5号',
    tattooSmoke: '无',
    limits: '不接受变态玩法',
    acceptSM: false,
    noCondom: false,
    creampie: false,
    oral: true,
    liveTogether: false,
    overnight: true,
    travel: '仅限江浙沪',
    monthlyBudget: '5W',
    monthlyDays: '8天',
    shortTermBudget: '8k',
    paymentSplit: '全款',
    reason: '学费',
    startTime: '周末',
    bonus: '极品清纯，听话懂事',
    stats: { charm: 92, intelligence: 85, agility: 70 },
    price: '50,000 RMB/月',
    images: ['/placeholders/yuna.jpg'],
    availability: 'On Mission'
  },
  {
    id: '3',
    name: '小雅',
    rank: 'B',
    classType: 'Healer',
    description: '成熟稳重，性格开朗，能够提供极佳的情绪价值。',
    location: '安徽 合肥巢湖',
    age: 32,
    height: 165,
    weight: 75,
    cup: 'C',
    occupation: '无业',
    isVirgin: false,
    periodDate: '7号',
    tattooSmoke: '有小面积',
    limits: '别太凶',
    acceptSM: false,
    noCondom: true,
    creampie: true,
    oral: true,
    liveTogether: true,
    overnight: true,
    travel: '最好周边',
    monthlyBudget: '协商',
    monthlyDays: '3-5天',
    shortTermBudget: '3k-5k',
    paymentSplit: '2次',
    reason: '穷',
    startTime: '都行',
    bonus: '事少 性格开朗乐观，胸大，活好，欲望强，上下粉嫩',
    stats: { charm: 85, intelligence: 80, agility: 60 },
    price: '3,000 - 5,000 RMB/短期',
    images: ['/placeholders/xiaoya.jpg'],
    availability: 'Available'
  }
];
