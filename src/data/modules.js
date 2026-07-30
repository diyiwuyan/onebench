import {
  BookOpenText,
  CalendarBlank,
  ChartLineUp,
  CheckSquare,
  ClockCountdown,
  FolderSimple,
  GearSix,
  GraduationCap,
  NotePencil,
  Target,
} from '@phosphor-icons/react'

export const moduleCatalog = [
  { id: 'calendar', name: '日历', description: '课程、会议与截止日', icon: CalendarBlank, category: '通用' },
  { id: 'tasks', name: '待办', description: '今天要做什么', icon: CheckSquare, category: '通用' },
  { id: 'quick-note', name: '快速记录', description: '灵感与随手记', icon: NotePencil, category: '通用' },
  { id: 'focus', name: '专注', description: '番茄钟与深度工作', icon: ClockCountdown, category: '通用' },
  { id: 'goals', name: '目标', description: '阶段目标与复盘', icon: Target, category: '通用' },
  { id: 'files', name: '资料库', description: '链接、素材与文件入口', icon: FolderSimple, category: '通用' },
  { id: 'review', name: '复盘', description: '周报与学习复盘', icon: ChartLineUp, category: '成长' },
  { id: 'learning', name: '学习计划', description: '课程、考证与阅读', icon: BookOpenText, category: '成长' },
  { id: 'classroom', name: '课堂与班级', description: '备课、课表与班务', icon: GraduationCap, category: '职业' },
  { id: 'settings', name: '同步与设置', description: '主题、备份和 GitHub', icon: GearSix, category: '系统' },
]

export const sharedModuleIds = ['calendar', 'tasks', 'quick-note', 'settings']

export function findModule(id) {
  return moduleCatalog.find((module) => module.id === id)
}
