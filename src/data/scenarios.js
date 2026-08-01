import { Barbell, BookOpenText, Briefcase, Calculator, MapTrifold, MoonStars, PenNib, Target } from '@phosphor-icons/react'

export const scenarioCatalog = [
  { id: 'exam-sprint', name: '备考冲刺', description: '倒计时、专注、刷题和复盘', icon: Target, modules: ['countdown', 'focus', 'learning', 'exam-practice', 'review'] },
  { id: 'content-loop', name: '内容创作闭环', description: '选题、排期、发布和复盘', icon: PenNib, modules: ['inbox', 'content-pipeline', 'content-calendar', 'analytics', 'review'] },
  { id: 'fitness', name: '健身减脂', description: '运动、饮食、习惯与趋势', icon: Barbell, modules: ['workout', 'meals', 'habits', 'health', 'analytics'] },
  { id: 'family', name: '家庭管理', description: '日历、健康、生日与日记', icon: MoonStars, modules: ['calendar', 'health', 'birthdays', 'diary', 'tasks'] },
  { id: 'month-close', name: '财务月结', description: '记账、发票、回款与汇率', icon: Calculator, modules: ['bookkeeping', 'invoices', 'finance', 'exchange-rates', 'analytics'] },
  { id: 'job-hunt', name: '求职行动', description: '岗位、面试、学习和作品集', icon: Briefcase, modules: ['inbox', 'projects', 'schedule', 'learning', 'files', 'github-activity'] },
  { id: 'reading', name: '阅读成长', description: '书架、笔记、目标与每日一句', icon: BookOpenText, modules: ['reading', 'quick-note', 'goals', 'quotes', 'review'] },
  { id: 'travel', name: '旅行计划', description: '日历、天气、清单与资料入口', icon: MapTrifold, modules: ['calendar', 'weather', 'tasks', 'files', 'quick-note'] },
]
