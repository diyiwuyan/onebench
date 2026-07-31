export const themeCatalog = [
  {
    id: 'campus-sky',
    name: '校园晴空',
    accent: '#507ca4',
    description: '清爽、安静，适合课程与学习规划',
    tokens: { '--page': '#edf2f5', '--surface': '#fbfdfd', '--surface-2': '#eef4f7', '--ink': '#29343b', '--muted': '#6d7b83', '--line': '#d9e3e8', '--accent': '#507ca4', '--accent-soft': '#dce9f2', '--sage': '#dce9df', '--blue': '#d9e7f2' },
  },
  {
    id: 'chalk-sage',
    name: '黑板鼠尾草',
    accent: '#58735d',
    description: '沉稳、温和，适合教学与班级事务',
    tokens: { '--page': '#e9eee8', '--surface': '#fbfcf8', '--surface-2': '#eff4ec', '--ink': '#2d382f', '--muted': '#6d786e', '--line': '#d9e2d7', '--accent': '#58735d', '--accent-soft': '#d9e7d8', '--sage': '#d4e4d8', '--blue': '#dce5e7' },
  },
  {
    id: 'warm-paper',
    name: '冲刺暖杏',
    accent: '#d66f51',
    description: '有行动感的暖色纸张，适合备考冲刺',
    tokens: { '--page': '#f2eee5', '--surface': '#fffdf8', '--surface-2': '#f8f2e8', '--ink': '#30322e', '--muted': '#74786f', '--line': '#e6ded1', '--accent': '#d66f51', '--accent-soft': '#f8ddd2', '--sage': '#dce7d5', '--blue': '#dce5ef' },
  },
  {
    id: 'civic-blue',
    name: '上岸政务蓝',
    accent: '#416f8f',
    description: '清晰、克制，适合公告、刷题与节点管理',
    tokens: { '--page': '#ebf0f3', '--surface': '#fbfcfd', '--surface-2': '#eef3f6', '--ink': '#28343c', '--muted': '#697983', '--line': '#d6e0e6', '--accent': '#416f8f', '--accent-soft': '#d8e7f0', '--sage': '#dce8df', '--blue': '#d4e4ef' },
  },
  {
    id: 'creator-coral',
    name: '创作珊瑚',
    accent: '#b95f72',
    description: '活泼但不刺眼，适合灵感与内容生产',
    tokens: { '--page': '#f4ecee', '--surface': '#fffafb', '--surface-2': '#f8eff1', '--ink': '#392f33', '--muted': '#806f75', '--line': '#eadade', '--accent': '#b95f72', '--accent-soft': '#f2dbe1', '--sage': '#dee8dc', '--blue': '#dfe6ef' },
  },
  {
    id: 'product-graphite',
    name: '产品石墨',
    accent: '#586b7c',
    description: '理性、耐看，适合项目与数据推进',
    tokens: { '--page': '#ecefef', '--surface': '#fbfcfb', '--surface-2': '#f0f3f3', '--ink': '#2c3336', '--muted': '#707b80', '--line': '#dce2e3', '--accent': '#586b7c', '--accent-soft': '#dce5e9', '--sage': '#dce7de', '--blue': '#dce5eb' },
  },
  {
    id: 'independent-olive',
    name: '独立橄榄',
    accent: '#7a744c',
    description: '自由、松弛，适合客户与个人节奏',
    tokens: { '--page': '#f0efe7', '--surface': '#fffdf8', '--surface-2': '#f5f2e8', '--ink': '#34352d', '--muted': '#777769', '--line': '#e2dfd2', '--accent': '#7a744c', '--accent-soft': '#e9e4c9', '--sage': '#dfe7d7', '--blue': '#dfe6e9' },
  },
  {
    id: 'leadership-plum',
    name: '管理雾紫',
    accent: '#756783',
    description: '稳重、有层次，适合团队沟通与决策',
    tokens: { '--page': '#efecf1', '--surface': '#fdfbfe', '--surface-2': '#f3eef5', '--ink': '#342f37', '--muted': '#77707c', '--line': '#e2dbe5', '--accent': '#756783', '--accent-soft': '#e7ddec', '--sage': '#dce5dc', '--blue': '#dce3ee' },
  },
  {
    id: 'ledger-amber',
    name: '账本琥珀',
    accent: '#7a6a4e',
    description: '清晰、克制，适合财务、记账与发票管理',
    tokens: { '--page': '#f2efe8', '--surface': '#fffdfb', '--surface-2': '#f8f4eb', '--ink': '#35322c', '--muted': '#7a756b', '--line': '#e5dfd4', '--accent': '#7a6a4e', '--accent-soft': '#ebe3d4', '--sage': '#dde6d8', '--blue': '#dde4eb' },
  },
  {
    id: 'nursery-warm',
    name: '育儿暖绒',
    accent: '#c17b7b',
    description: '温柔、柔软，适合记录宝宝与家庭日常',
    tokens: { '--page': '#f5eded', '--surface': '#fffbfb', '--surface-2': '#faf2f2', '--ink': '#3a2f2f', '--muted': '#827272', '--line': '#ebdfe0', '--accent': '#c17b7b', '--accent-soft': '#f2dad8', '--sage': '#dee8dd', '--blue': '#dfe5ef' },
  },
]

export function findTheme(id) {
  return themeCatalog.find((theme) => theme.id === id) || themeCatalog[0]
}
