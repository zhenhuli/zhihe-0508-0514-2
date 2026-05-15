export const itemData = [
  {
    id: 1,
    name: '圣剑·曙光',
    rarity: 'legendary',
    type: 'weapon',
    icon: '⚔️',
    unlocked: true,
    description: '传说中由光明女神亲手锻造的圣剑，剑身散发着温暖的金色光芒。据说只有拥有纯净心灵的勇者才能拔出它。在远古的黑暗战争中，此剑曾斩断魔王的灵魂，成为光明势力的象征。',
    background: '锻造于神界的曙光之巅，吸收了千年的晨曦之力。'
  },
  {
    id: 2,
    name: '暗影匕首',
    rarity: 'epic',
    type: 'weapon',
    icon: '🗡️',
    unlocked: true,
    description: '被暗影力量侵蚀的匕首，能够无声无息地穿透敌人的防御。持有者将获得隐匿于黑暗中的能力，但需时刻警惕被暗影吞噬的危险。',
    background: '来自地下刺客组织的传承之物，已有数百年历史。'
  },
  {
    id: 3,
    name: '龙鳞盾牌',
    rarity: 'epic',
    type: 'armor',
    icon: '🛡️',
    unlocked: true,
    description: '由远古巨龙的鳞片打造而成，拥有无与伦比的防御力。盾牌表面的龙纹在受到攻击时会发出龙吟，震慑敌人的心神。',
    background: '从沉睡千年的古龙墓穴中发掘的珍贵防具。'
  },
  {
    id: 4,
    name: '生命之戒',
    rarity: 'rare',
    type: 'accessory',
    icon: '💍',
    unlocked: true,
    description: '蕴含自然生命力的神奇戒指，佩戴者能够缓慢恢复伤口，即使是致命伤势也能得到一定程度的缓和。',
    background: '精灵族大祭司的祝福之物，象征生命与和平。'
  },
  {
    id: 5,
    name: '法力水晶',
    rarity: 'rare',
    type: 'material',
    icon: '💎',
    unlocked: false,
    description: '蕴含强大魔力的结晶体，是制作高级魔法装备的核心材料。纯净度越高，其价值也越惊人。',
    background: '只在魔法元素浓郁的地方才有可能形成。'
  },
  {
    id: 6,
    name: '凤凰羽衣',
    rarity: 'legendary',
    type: 'armor',
    icon: '🔥',
    unlocked: false,
    description: '以凤凰羽毛编织的神甲，穿戴者获得浴火重生的能力。每一次死亡都会在烈焰中复活，但代价是消耗部分记忆。',
    background: '凤凰涅槃时脱落的羽毛，收集七七四十九片方能制成。'
  },
  {
    id: 7,
    name: '治愈药水',
    rarity: 'common',
    type: 'consumable',
    icon: '🧪',
    unlocked: true,
    description: '冒险者必备的基础药剂，能够恢复少量生命值。虽然效果普通，但在危急时刻往往能救命。',
    background: '炼金术师协会批量生产的标准回复道具。'
  },
  {
    id: 8,
    name: '传送卷轴',
    rarity: 'uncommon',
    type: 'consumable',
    icon: '📜',
    unlocked: true,
    description: '记录着空间魔法的神秘卷轴，使用后可以传送至指定地点。高级卷轴甚至可以穿越位面。',
    background: '由空间魔法师精心绘制，每张都独一无二。'
  },
  {
    id: 9,
    name: '幸运四叶草',
    rarity: 'uncommon',
    type: 'accessory',
    icon: '🍀',
    unlocked: true,
    description: '传说中能带来好运的四叶草，佩戴者遭遇危险时总能化险为夷。虽然没有实际的战斗力，但其价值却无法估量。',
    background: '在精灵森林深处才能找到的珍稀植物。'
  },
  {
    id: 10,
    name: '雷霆之锤',
    rarity: 'epic',
    type: 'weapon',
    icon: '🔨',
    unlocked: false,
    description: '注入了雷电之力的战锤，攻击时能释放强力的雷击。据说雷神曾使用同款武器参与众神之战。',
    background: '矮人王国的传世之宝，由初代锻冶大师亲手打造。'
  },
  {
    id: 11,
    name: '智慧卷轴',
    rarity: 'rare',
    type: 'material',
    icon: '📖',
    unlocked: true,
    description: '记录着古老知识的神秘卷轴，阅读后能够提升使用者的智慧与魔力。据说其中记载着创世神的秘密。',
    background: '从古代魔法文明遗迹中出土的珍贵文献。'
  },
  {
    id: 12,
    name: '神秘钥匙',
    rarity: 'common',
    type: 'material',
    icon: '🗝️',
    unlocked: false,
    description: '一把看似普通的旧钥匙，不知能开启什么。但从其散发的微弱魔力来看，绝非寻常之物。',
    background: '在某个神秘宝箱中发现，用途至今未知。'
  }
];

export const rarityConfig = {
  common: { name: '普通', color: '#9ca3af', bgColor: '#f3f4f6' },
  uncommon: { name: '优秀', color: '#10b981', bgColor: '#d1fae5' },
  rare: { name: '稀有', color: '#3b82f6', bgColor: '#dbeafe' },
  epic: { name: '史诗', color: '#8b5cf6', bgColor: '#ede9fe' },
  legendary: { name: '传说', color: '#f59e0b', bgColor: '#fef3c7' }
};

export const typeConfig = {
  weapon: { name: '武器', icon: '⚔️' },
  armor: { name: '防具', icon: '🛡️' },
  accessory: { name: '饰品', icon: '💍' },
  consumable: { name: '消耗品', icon: '🧪' },
  material: { name: '材料', icon: '💎' }
};
