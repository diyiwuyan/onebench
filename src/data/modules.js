import {
  AddressBook,
  Books,
  BookOpenText,
  CalendarBlank,
  ChartLineUp,
  CheckSquare,
  ClockCountdown,
  CompassTool,
  FolderSimple,
  GearSix,
  GraduationCap,
  Kanban,
  ListStar,
  NotePencil,
  PresentationChart,
  Repeat,
  RowsPlusBottom,
  Student,
  Target,
  UsersThree,
} from '@phosphor-icons/react'

export const moduleCatalog = [
  { id: 'calendar', name: '日历', description: '课程、会议与截止日', icon: CalendarBlank, category: '通用' },
  { id: 'tasks', name: '待办', description: '今天要做什么', icon: CheckSquare, category: '通用' },
  { id: 'quick-note', name: '快速记录', description: '灵感与随手记', icon: NotePencil, category: '通用' },
  { id: 'habits', name: '习惯打卡', description: '每天坚持的小行动', icon: Repeat, category: '通用' },
  { id: 'focus', name: '专注', description: '番茄钟与深度工作', icon: ClockCountdown, category: '通用' },
  { id: 'countdown', name: '重要倒计时', description: '考试、DDL 与关键节点', icon: ListStar, category: '通用' },
  { id: 'goals', name: '目标', description: '阶段目标与复盘', icon: Target, category: '通用' },
  { id: 'files', name: '资料库', description: '链接、素材与文件入口', icon: FolderSimple, category: '通用' },
  { id: 'review', name: '复盘', description: '周报与学习复盘', icon: ChartLineUp, category: '成长' },
  { id: 'learning', name: '学习计划', description: '课程、考证与阅读', icon: BookOpenText, category: '成长' },
  { id: 'schedule', name: '课程／日程表', description: '今天和本周的具体安排', icon: RowsPlusBottom, category: '成长' },
  { id: 'classroom', name: '课堂与班级', description: '备课、课表与班务', icon: GraduationCap, category: '职业' },
  { id: 'content-pipeline', name: '内容流水线', description: '选题、创作、发布与复盘', icon: Kanban, category: '职业' },
  { id: 'projects', name: '项目进度', description: '里程碑、阻塞与下一步', icon: CompassTool, category: '职业' },
  { id: 'clients', name: '客户管理', description: '客户、交付与回款节点', icon: AddressBook, category: '职业' },
  { id: 'team', name: '团队节奏', description: '目标、1:1 与成员动态', icon: UsersThree, category: '职业' },
  { id: 'analytics', name: '趋势统计', description: '一周投入与完成趋势', icon: PresentationChart, category: '成长' },
  { id: 'reading', name: '阅读书架', description: '在读、摘录与下一本', icon: Books, category: '成长' },
  { id: 'exam-practice', name: '刷题进度', description: '题量、正确率与错题', icon: Student, category: '成长' },
  { id: 'settings', name: '同步与设置', description: '主题、备份和 GitHub', icon: GearSix, category: '系统' },
]

export const sharedModuleIds = ['calendar', 'tasks', 'quick-note', 'habits', 'settings']

export function findModule(id) {
  return moduleCatalog.find((module) => module.id === id)
}
