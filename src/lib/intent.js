import { findModule } from '../data/modules.js'
import { findPack, packModuleIds } from '../data/packs.js'

// 关键词 → 额外加入的模块（在当前身份包基础上补充）
const MODULE_KEYWORDS = [
  { keys: ['日历', '日程', '安排', '时间管理'], mods: ['calendar'] },
  { keys: ['天气', '气温', '温度'], mods: ['weather'] },
  { keys: ['待办', '任务', 'todo', 'to-do'], mods: ['tasks'] },
  { keys: ['灵感', '随手记', '笔记', '记录', '便签'], mods: ['quick-note'] },
  { keys: ['习惯', '打卡', '坚持'], mods: ['habits'] },
  { keys: ['番茄', '专注', '深度工作', '计时'], mods: ['focus'] },
  { keys: ['倒计时', '节点', '目标日'], mods: ['countdown'] },
  { keys: ['目标', '计划'], mods: ['goals'] },
  { keys: ['资料', '文件', '素材', '收藏'], mods: ['files'] },
  { keys: ['复盘', '周报', '总结', '反思'], mods: ['review'] },
  { keys: ['学习', '考证', '阅读计划'], mods: ['learning'] },
  { keys: ['课表', '课程', '排课', '时间表'], mods: ['schedule'] },
  { keys: ['班级', '课堂', '批改'], mods: ['classroom'] },
  { keys: ['内容', '创作流水线', '选题', '流水线'], mods: ['content-pipeline'] },
  { keys: ['项目', '里程碑', '进度管理'], mods: ['projects'] },
  { keys: ['客户', '交付'], mods: ['clients'] },
  { keys: ['团队', '成员', '带人', '1:1'], mods: ['team'] },
  { keys: ['统计', '趋势', '数据', '投入'], mods: ['analytics'] },
  { keys: ['阅读', '读书', '书架', '书单'], mods: ['reading'] },
  { keys: ['刷题', '错题', '真题', '题量'], mods: ['exam-practice'] },
  { keys: ['作业', '论文', '小组任务', 'ddl'], mods: ['assignments'] },
  { keys: ['备课', '课件', '教案', '教研'], mods: ['lesson-plans'] },
  { keys: ['公告', '报名', '资格', '审核'], mods: ['notices'] },
  { keys: ['发布', '排期', '社交媒体', '更新日历'], mods: ['content-calendar'] },
  { keys: ['需求', '收件箱', '想法'], mods: ['inbox'] },
  { keys: ['会议', '沟通', '跟进'], mods: ['meetings'] },
  { keys: ['收入', '回款', '报价'], mods: ['finance'] },
  { keys: ['发票', '专票', '普票', '抵扣'], mods: ['invoices'] },
  { keys: ['客户跟进', '跟进', '沟通记录'], mods: ['client-followup'] },
  { keys: ['记账', '收支', '账本', '开销'], mods: ['bookkeeping'] },
  { keys: ['理财知识', '理财', '基金', '保险', '投资'], mods: ['finance-knowledge'] },
  { keys: ['运动', '健身', '跑步', '步数'], mods: ['workout'] },
  { keys: ['吃饭', '三餐', '饮食', '营养', 'meal'], mods: ['meals'] },
  { keys: ['健康', '体重', '血压', '睡眠'], mods: ['health'] },
  { keys: ['生日', '亲友生日'], mods: ['birthdays'] },
  { keys: ['生理期', '月经', '大姨妈', '周期'], mods: ['period'] },
  { keys: ['日记', '每日记录', '心情'], mods: ['diary'] },
  { keys: ['新闻', '资讯', '热点'], mods: ['news'] },
  { keys: ['语录', '名言', '金句'], mods: ['quotes'] },
  { keys: ['决策', '判断', '决定'], mods: ['decisions'] },
  { keys: ['睡眠', '运动', '精力', '身心'], mods: ['wellbeing'] },
]

// 身份包切换关键词（命中则整体换成对应搭配）
const PACK_KEYWORDS = [
  { pack: 'postgraduate-exam', keys: ['考研'] },
  { pack: 'civil-service-exam', keys: ['考公', '公务员', '公考'] },
  { pack: 'teacher', keys: ['教师', '老师', '教学', '备课', '班主任', 'k12'] },
  { pack: 'creator', keys: ['创作者', '博主', 'up主', '自媒体', '短视频', '公众号'] },
  { pack: 'operations', keys: ['产品', '运营', '产品经理', '增长'] },
  { pack: 'freelancer', keys: ['自由职业', '独立', '接单', 'soho', 'freelance'] },
  { pack: 'team-lead', keys: ['团队负责', 'leader', '带团队', '管理', '主管', '老板'] },
  { pack: 'university', keys: ['大学生', '在校', '本科', '大学', '学生'] },
  { pack: 'financial', keys: ['财务', '会计', '出纳', '记账', '发票', '理财'] },
  { pack: 'family-baby', keys: ['宝宝', '宝妈', '宝爸', '育儿', '带娃', '家有宝宝'] },
]

// 否定：仅当句子里出现强否定词时才移除对应模块
const NEGATION_TRIGGER = /(不要|不用|别|去掉|移除|关掉|取消|删掉)/
const NEGATION_MODULES = [
  { keys: ['番茄', '专注'], mods: ['focus'] },
  { keys: ['日历'], mods: ['calendar'] },
  { keys: ['待办', '任务'], mods: ['tasks'] },
  { keys: ['天气'], mods: ['weather'] },
  { keys: ['阅读', '读书'], mods: ['reading'] },
  { keys: ['习惯'], mods: ['habits'] },
]

function lower(value) {
  return String(value || '').toLowerCase()
}

export function interpretPrompt(prompt, currentPack) {
  const text = lower(prompt)
  if (!text.trim()) {
    return { packId: currentPack.id, packName: null, moduleIds: packModuleIds(currentPack), addedNames: [], summary: '' }
  }

  // 1. 先判断是否需要切换身份包
  const matchedPack = PACK_KEYWORDS.filter((rule) => rule.keys.some((key) => text.includes(lower(key))))
  const targetPack = matchedPack.length ? findPack(matchedPack[matchedPack.length - 1].pack) : currentPack

  // 2. 以目标身份包为基础模块
  const moduleSet = new Set(packModuleIds(targetPack))

  // 3. 按关键词补充模块
  MODULE_KEYWORDS.forEach((rule) => {
    if (rule.keys.some((key) => text.includes(lower(key)))) {
      rule.mods.forEach((id) => moduleSet.add(id))
    }
  })

  // 4. 处理否定
  if (NEGATION_TRIGGER.test(text)) {
    NEGATION_MODULES.forEach((rule) => {
      if (rule.keys.some((key) => text.includes(lower(key)))) {
        rule.mods.forEach((id) => moduleSet.delete(id))
      }
    })
  }

  const moduleIds = [...moduleSet]
  const baseIds = packModuleIds(targetPack)
  const addedNames = moduleIds.filter((id) => !baseIds.includes(id)).map((id) => findModule(id)?.name).filter(Boolean)
  const packChanged = targetPack.id !== currentPack.id

  let summary = '已按你的描述重新搭好一版。'
  if (addedNames.length) summary = `已按你的描述加入：${addedNames.join('、')}。`
  else if (packChanged) summary = `已切换到「${targetPack.name}」搭配。`

  return {
    packId: targetPack.id,
    packName: packChanged ? targetPack.name : null,
    moduleIds,
    addedNames,
    summary,
  }
}
