import {
  Baby,
  Briefcase,
  Calculator,
  ChalkboardTeacher,
  GraduationCap,
  Megaphone,
  PenNib,
  Target,
  UsersThree,
  Wrench,
} from '@phosphor-icons/react'
import { sharedModuleIds } from './modules.js'

const base = { layout: 'focus-first' }

export const packs = [
  { id: 'university', name: '大学生', icon: GraduationCap, prompt: '我是大学生，想要课程、DDL 和考证规划台', title: '我的学期节奏', description: '课程、作业、考证与生活节奏放在一起。', headline: '把这一学期过得清楚一点。', theme: { id: 'campus-sky', name: '校园晴空', accent: '#507ca4' }, modules: ['schedule', 'assignments', 'learning', 'focus', 'countdown', 'goals', 'review', 'reading', 'wellbeing', 'workout', 'meals', 'news', 'quotes', 'diary'], ...base },
  { id: 'teacher', name: 'K12 教师', icon: ChalkboardTeacher, prompt: '我是 K12 教师，想要课表、备课和班级事项管理台', title: '我的教学节奏', description: '用一个台面安排备课、班务与教研。', headline: '先把今天这一节课备扎实。', theme: { id: 'chalk-sage', name: '黑板鼠尾草', accent: '#58735d' }, modules: ['schedule', 'lesson-plans', 'classroom', 'meetings', 'projects', 'goals', 'review', 'files', 'wellbeing', 'news', 'diary'], ...base },
  { id: 'postgraduate-exam', name: '考研', icon: Target, prompt: '我是考研生，想要倒计时、真题和错题复盘台', title: '180 天冲刺台', description: '倒计时、真题进度和错题复盘。', headline: '今天也在稳稳向前。', theme: { id: 'warm-paper', name: '冲刺暖杏', accent: '#d66f51' }, modules: ['countdown', 'focus', 'learning', 'exam-practice', 'notices', 'analytics', 'review', 'goals', 'files', 'wellbeing', 'news', 'quotes'], ...base },
  { id: 'civil-service-exam', name: '考公', icon: Target, prompt: '我要准备考公，想管理行测申论、刷题和公告节点', title: '上岸计划台', description: '刷题节奏、申论练习和报名节点。', headline: '把上岸拆成今天能完成的事。', theme: { id: 'civic-blue', name: '上岸政务蓝', accent: '#416f8f' }, modules: ['countdown', 'focus', 'learning', 'exam-practice', 'notices', 'analytics', 'review', 'goals', 'files', 'news', 'quotes'], ...base },
  { id: 'creator', name: '内容创作者', icon: PenNib, prompt: '我是内容创作者，想要选题、创作排期和复盘台', title: '内容生产台', description: '选题、创作、发布和数据复盘。', headline: '先把真正想表达的那句写出来。', theme: { id: 'creator-coral', name: '创作珊瑚', accent: '#b95f72' }, modules: ['inbox', 'content-pipeline', 'content-calendar', 'analytics', 'goals', 'review', 'files', 'reading', 'news', 'diary'], ...base },
  { id: 'operations', name: '产品／运营', icon: Megaphone, prompt: '我是产品运营，想管理项目节点、会议和周报', title: '项目推进台', description: '项目、会议、需求与周报。', headline: '让每个人都知道下一步是什么。', theme: { id: 'product-graphite', name: '产品石墨', accent: '#586b7c' }, modules: ['inbox', 'projects', 'meetings', 'decisions', 'analytics', 'goals', 'review', 'files', 'news'], ...base },
  { id: 'freelancer', name: '自由职业者', icon: Wrench, prompt: '我是自由职业者，想管理客户、项目和个人节奏', title: '独立工作台', description: '客户项目与个人生活一体安排。', headline: '自由来自清楚自己的承诺。', theme: { id: 'independent-olive', name: '独立橄榄', accent: '#7a744c' }, modules: ['clients', 'client-followup', 'projects', 'focus', 'finance', 'bookkeeping', 'invoices', 'analytics', 'goals', 'files', 'review', 'wellbeing'], ...base },
  { id: 'team-lead', name: '团队负责人', icon: UsersThree, prompt: '我是团队负责人，想管理目标、1:1 和团队节奏', title: '团队节奏台', description: '目标、沟通和管理复盘。', headline: '让好决定和坦诚沟通更容易发生。', theme: { id: 'leadership-plum', name: '管理雾紫', accent: '#756783' }, modules: ['team', 'meetings', 'decisions', 'projects', 'analytics', 'goals', 'review', 'files', 'news'], ...base },
  { id: 'financial', name: '财务', icon: Calculator, prompt: '我是财务工作者，想管理发票、客户回款、记账和理财知识', title: '财务工作台', description: '发票、记账、回款与理财知识一体管理。', headline: '把每一笔账都算清楚。', theme: { id: 'ledger-amber', name: '账本琥珀', accent: '#7a6a4e' }, modules: ['bookkeeping', 'invoices', 'finance', 'finance-knowledge', 'clients', 'client-followup', 'projects', 'analytics', 'goals', 'review', 'files'], ...base },
  { id: 'family-baby', name: '家有宝宝', icon: Baby, prompt: '我是宝爸宝妈，想管理宝宝喂养、健康、成长和家庭日常', title: '宝宝成长台', description: '喂养、健康、成长记录与家庭日常。', headline: '把宝宝的每一天都温柔记录。', theme: { id: 'nursery-warm', name: '育儿暖绒', accent: '#c17b7b' }, modules: ['meals', 'health', 'birthdays', 'period', 'diary', 'workout', 'habits', 'goals', 'review', 'files', 'reading', 'news'], ...base },
]

export function findPack(id) {
  return packs.find((pack) => pack.id === id) ?? packs[0]
}

export function packModuleIds(pack) {
  return [...new Set([...sharedModuleIds, ...pack.modules])]
}
