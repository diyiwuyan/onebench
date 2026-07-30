import {
  Briefcase,
  ChalkboardTeacher,
  GraduationCap,
  Megaphone,
  PenNib,
  Target,
  UsersThree,
  Wrench,
} from '@phosphor-icons/react'
import { sharedModuleIds } from './modules.js'

const base = {
  theme: { id: 'paper-plum', name: '纸感梅子', accent: '#633d61' },
  layout: 'focus-first',
}

export const packs = [
  { id: 'university', name: '大学生', icon: GraduationCap, prompt: '我是大学生，想要课程、DDL 和考证规划台', title: '我的学期节奏', description: '课程、作业、考证与生活节奏放在一起。', modules: ['learning', 'goals', 'review'], ...base },
  { id: 'teacher', name: 'K12 教师', icon: ChalkboardTeacher, prompt: '我是 K12 教师，想要课表、备课和班级事项管理台', title: '我的教学节奏', description: '用一个台面安排备课、班务与教研。', modules: ['classroom', 'goals', 'review'], ...base },
  { id: 'postgraduate-exam', name: '考研', icon: Target, prompt: '我是考研生，想要倒计时、真题和错题复盘台', title: '180 天冲刺台', description: '倒计时、真题进度和错题复盘。', modules: ['learning', 'focus', 'review', 'goals'], ...base },
  { id: 'civil-service-exam', name: '考公', icon: Target, prompt: '我要准备考公，想管理行测申论、刷题和公告节点', title: '上岸计划台', description: '刷题节奏、申论练习和报名节点。', modules: ['learning', 'focus', 'review', 'goals'], ...base },
  { id: 'creator', name: '内容创作者', icon: PenNib, prompt: '我是内容创作者，想要选题、创作排期和复盘台', title: '内容生产台', description: '选题、创作、发布和数据复盘。', modules: ['learning', 'goals', 'review', 'files'], ...base },
  { id: 'operations', name: '产品／运营', icon: Megaphone, prompt: '我是产品运营，想管理项目节点、会议和周报', title: '项目推进台', description: '项目、会议、需求与周报。', modules: ['goals', 'review', 'files'], ...base },
  { id: 'freelancer', name: '自由职业者', icon: Wrench, prompt: '我是自由职业者，想管理客户、项目和个人节奏', title: '独立工作台', description: '客户项目与个人生活一体安排。', modules: ['goals', 'focus', 'files', 'review'], ...base },
  { id: 'team-lead', name: '团队负责人', icon: UsersThree, prompt: '我是团队负责人，想管理目标、1:1 和团队节奏', title: '团队节奏台', description: '目标、沟通和管理复盘。', modules: ['goals', 'review', 'files'], ...base },
]

export function findPack(id) {
  return packs.find((pack) => pack.id === id) ?? packs[0]
}

export function packModuleIds(pack) {
  return [...new Set([...sharedModuleIds, ...pack.modules])]
}
