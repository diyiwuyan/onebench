const dataKey = (workspaceId) => `onebench.data.${workspaceId}.v2`

const inDays = (days) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const task = (title, done = false) => ({ id: crypto.randomUUID(), title, done })
const habit = (name, done = false) => ({ id: crypto.randomUUID(), name, done })

const shared = {
  quote: '把今天过清楚，长期自然会有答案。',
  profileImage: '',
  quickNote: '',
  focus: { minutes: 25, subject: '今日最重要的一件事' },
  review: { win: '', blocker: '', next: '' },
  habits: [habit('整理工作台', true), habit('专注 25 分钟'), habit('睡前复盘')],
  week: [42, 58, 46, 72, 66, 84, 54],
}

const roleSeeds = {
  university: {
    quote: '不追赶别人的进度，把自己的这一页学明白。',
    tasks: [task('完成高数第三章作业'), task('整理英语四级错题'), task('18:00 前提交小组展示材料')],
    schedule: [
      { time: '08:00', title: '高等数学', meta: '博学楼 302' },
      { time: '14:00', title: '专业课小组讨论', meta: '图书馆三层' },
      { time: '19:30', title: '四级听力训练', meta: '45 分钟' },
    ],
    milestones: [
      { label: '四级考试', date: inDays(46), tone: 'blue' },
      { label: '课程论文', date: inDays(18), tone: 'sage' },
      { label: '期末周', date: inDays(82), tone: 'apricot' },
    ],
    learning: [
      { title: '高等数学', progress: 68, note: '第三章 · 多元函数' },
      { title: '大学英语', progress: 54, note: '听力 12 / 20 套' },
      { title: '专业核心课', progress: 42, note: '项目资料待补充' },
    ],
    goals: [
      { title: '本周完成 4 次图书馆自习', progress: 75 },
      { title: '四级词汇完成一轮', progress: 61 },
    ],
    links: [{ title: '课程资料', meta: '本地文件夹' }, { title: '论文素材', meta: '12 条收藏' }, { title: '学习网站', meta: '常用入口' }],
    reading: [{ title: '置身事内', meta: '读到 42%' }, { title: '学会提问', meta: '本月待读' }],
    assignments: [
      { title: '高数第三章作业', meta: '今天 22:00 · 还剩 4 题', progress: 72 },
      { title: '专业课小组展示', meta: '周五 · 等待合并材料', progress: 58 },
      { title: '课程论文选题', meta: '8 月 6 日 · 待确认导师', progress: 35 },
    ],
    wellbeing: [
      { title: '昨晚睡眠', value: '7.2h', meta: '比前天多 35 分钟' },
      { title: '今日精力', value: '良好', meta: '适合安排深度学习' },
      { title: '本周运动', value: '2/3', meta: '还差一次慢跑' },
    ],
  },
  teacher: {
    quote: '把一节课备扎实，就是给孩子多一条理解世界的路。',
    tasks: [task('完成八年级二班备课'), task('批改一班数学周测'), task('发出家长会提醒')],
    schedule: [
      { time: '08:10', title: '八年级 2 班 · 数学', meta: '一次函数' },
      { time: '10:20', title: '集体备课', meta: '数学组办公室' },
      { time: '15:40', title: '课后答疑', meta: '八年级 1 班' },
    ],
    classroom: [
      { title: '明天备课', meta: '三角形全等 · 课件 70%', progress: 70 },
      { title: '待批作业', meta: '2 个班 · 86 份', progress: 36 },
      { title: '班级事项', meta: '家长会与值日表', progress: 55 },
    ],
    projects: [{ title: '区级公开课', progress: 64, meta: '课件二稿' }, { title: '学期教研总结', progress: 38, meta: '案例待补' }],
    goals: [{ title: '本周听课 2 节', progress: 50 }, { title: '完成单元错题分析', progress: 72 }],
    links: [{ title: '备课资料', meta: '32 份' }, { title: '班级通讯录', meta: '仅本机' }, { title: '教研素材', meta: '本学期' }],
    lessonPlans: [
      { title: '一次函数图像', meta: '八年级 2 班 · 明天第 2 节', progress: 82 },
      { title: '全等三角形复习', meta: '八年级 1 班 · 课件二稿', progress: 64 },
      { title: '周测讲评', meta: '共性错因已整理 5 条', progress: 48 },
    ],
    meetings: [
      { title: '数学组集体备课', meta: '今天 10:20 · 带单元分析' },
      { title: '家长会准备', meta: '周四 16:30 · 还有 2 项待确认' },
      { title: '学生个别沟通', meta: '本周 3 人 · 已完成 1 人' },
    ],
  },
  'postgraduate-exam': {
    quote: '不是每天都要超常发挥，但要每天都在场。',
    tasks: [task('数学：完成极限真题 25 题'), task('英语：精读 2019 Text 2'), task('专业课：背诵第三章框架')],
    schedule: [
      { time: '08:00', title: '数学真题', meta: '极限与连续 · 120 分钟' },
      { time: '14:00', title: '英语阅读', meta: '精读 + 生词复盘' },
      { time: '19:00', title: '专业课背诵', meta: '第三章 · 90 分钟' },
    ],
    milestones: [
      { label: '考研初试', date: inDays(146), tone: 'blue' },
      { label: '报名确认', date: inDays(96), tone: 'sage' },
      { label: '冲刺阶段', date: inDays(62), tone: 'apricot' },
    ],
    learning: [
      { title: '数学', progress: 62, note: '真题 8 / 15 年' },
      { title: '英语', progress: 71, note: '阅读正确率 76%' },
      { title: '专业课', progress: 48, note: '一轮背诵 5 / 11 章' },
      { title: '政治', progress: 34, note: '强化课第 6 讲' },
    ],
    practice: [
      { title: '数学真题', value: '428', meta: '累计题量', progress: 64 },
      { title: '英语阅读', value: '76%', meta: '近 7 天正确率', progress: 76 },
      { title: '待复盘错题', value: '23', meta: '今天处理 6 题', progress: 44 },
    ],
    goals: [{ title: '数学真题一刷完成', progress: 64 }, { title: '专业课一轮背诵', progress: 48 }],
    links: [{ title: '真题资料', meta: '按年份整理' }, { title: '错题本', meta: '23 题待复盘' }, { title: '院校信息', meta: '关键节点' }],
    notices: [
      { title: '目标院校招生简章', meta: '已收藏 · 等待九月更新', tone: 'blue' },
      { title: '网上报名', meta: '预计 10 月 · 提前准备照片', tone: 'sage' },
      { title: '现场／网上确认', meta: '证件材料清单已建立', tone: 'apricot' },
    ],
  },
  'civil-service-exam': {
    quote: '上岸不是一句口号，是今天这一套题和这一次复盘。',
    tasks: [task('行测：资料分析 30 题'), task('申论：精改一道归纳概括'), task('整理本周省考公告')],
    schedule: [
      { time: '08:30', title: '行测套题', meta: '90 分钟计时' },
      { time: '14:30', title: '申论小题', meta: '归纳概括 + 精改' },
      { time: '20:00', title: '错题复盘', meta: '数量与资料分析' },
    ],
    milestones: [
      { label: '国考笔试', date: inDays(125), tone: 'blue' },
      { label: '省考笔试', date: inDays(229), tone: 'sage' },
      { label: '事业编联考', date: inDays(285), tone: 'apricot' },
    ],
    learning: [
      { title: '资料分析', progress: 73, note: '正确率 81%' },
      { title: '言语理解', progress: 66, note: '正确率 76%' },
      { title: '判断推理', progress: 58, note: '图推需要加强' },
      { title: '申论', progress: 44, note: '大作文 4 / 10 篇' },
    ],
    practice: [
      { title: '本周题量', value: '386', meta: '目标 500 题', progress: 77 },
      { title: '行测正确率', value: '74%', meta: '较上周 +3%', progress: 74 },
      { title: '待复盘错题', value: '31', meta: '高频错因 4 类', progress: 52 },
    ],
    goals: [{ title: '资料分析正确率 85%', progress: 81 }, { title: '完成 10 篇申论大作文', progress: 40 }],
    links: [{ title: '公告收藏', meta: '6 条更新' }, { title: '申论素材', meta: '主题分类' }, { title: '错题本', meta: '31 题待复盘' }],
    notices: [
      { title: '国考职位表', meta: '订阅更新 · 待筛选岗位', tone: 'blue' },
      { title: '省考报名', meta: '材料准备 4 / 6', tone: 'sage' },
      { title: '资格审核', meta: '学历与基层经历待核对', tone: 'apricot' },
    ],
  },
  creator: {
    quote: '先把真正想表达的那一句写出来，再谈流量。',
    tasks: [task('完成「AI 工作流」笔记初稿'), task('整理 3 条选题素材'), task('复盘昨天发布的数据')],
    schedule: [{ time: '09:30', title: '深度创作', meta: '90 分钟' }, { time: '15:00', title: '素材整理', meta: '图片与案例' }, { time: '20:30', title: '发布与互动', meta: '30 分钟' }],
    pipeline: [
      { title: '灵感池', value: 18, meta: '本周新增 5 条' },
      { title: '创作中', value: 3, meta: '1 条待配图' },
      { title: '待发布', value: 2, meta: '今晚 20:30' },
      { title: '已发布', value: 24, meta: '本月' },
    ],
    goals: [{ title: '本周完成 3 条深度内容', progress: 67 }, { title: '建立 30 条常青选题库', progress: 60 }],
    links: [{ title: '素材库', meta: '128 条' }, { title: '选题库', meta: '18 条' }, { title: '品牌资料', meta: '统一视觉' }],
    inbox: [
      { title: '评论区高频问题：怎么开始搭工作台', meta: '来自小红书 · 待归入教程选题' },
      { title: '一张不错的暖纸感配色参考', meta: '图片素材 · 待补来源' },
      { title: '用户希望增加教师模板', meta: '需求反馈 · 优先级高' },
    ],
    contentCalendar: [
      { title: '周二 · OneBench 改造前后', meta: '小红书 · 20:30 发布', status: '待发布' },
      { title: '周四 · 一句话安装实测', meta: '视频号 · 脚本完成', status: '制作中' },
      { title: '周日 · 本周开源更新', meta: '公众号 · 待整理变更', status: '选题' },
    ],
  },
  operations: {
    quote: '真正的推进，是让每个人都知道下一步是什么。',
    tasks: [task('确认新版本验收清单'), task('输出增长实验周报'), task('同步设计评审结论')],
    schedule: [{ time: '10:00', title: '版本站会', meta: '15 分钟' }, { time: '14:30', title: '需求评审', meta: '会议室 B' }, { time: '17:30', title: '数据复盘', meta: '本周转化' }],
    projects: [{ title: '新手引导改版', progress: 78, meta: '周五上线' }, { title: '暑期增长活动', progress: 56, meta: '素材待确认' }, { title: '数据看板升级', progress: 32, meta: '口径对齐中' }],
    goals: [{ title: '新手转化率提升 8%', progress: 70 }, { title: '完成 4 个增长实验', progress: 50 }],
    links: [{ title: '需求池', meta: '12 条待评估' }, { title: '数据看板', meta: '今日已更新' }, { title: '会议纪要', meta: '本周 7 份' }],
    inbox: [
      { title: '用户反馈：首次配置步骤偏多', meta: '客服群 · 待归入体验优化' },
      { title: '增长实验：默认模板推荐', meta: '想法 · 等待补充假设' },
      { title: '竞品新增移动端导入', meta: '市场信息 · 待评估' },
    ],
    meetings: [
      { title: '版本站会', meta: '今天 10:00 · 2 个阻塞' },
      { title: '需求评审', meta: '今天 14:30 · 需要产品结论' },
      { title: '增长复盘', meta: '周五 16:00 · 数据已准备' },
    ],
    decisions: [
      { title: '新手默认本地优先', meta: '依据：降低部署门槛 · 8 月 15 日复查' },
      { title: '社区模块先审阅再安装', meta: '依据：安全边界 · 长期原则' },
    ],
  },
  freelancer: {
    quote: '自由不是同时做所有事，而是清楚现在该做哪一件。',
    tasks: [task('交付品牌手册第二版'), task('确认下月排期与报价'), task('发送本周项目进度')],
    schedule: [{ time: '09:00', title: '客户 A 深度工作', meta: '品牌手册' }, { time: '14:00', title: '客户沟通', meta: '线上会议' }, { time: '16:30', title: '财务整理', meta: '发票与回款' }],
    projects: [{ title: '茶饮品牌视觉', progress: 82, meta: '周四交付' }, { title: '个人网站改版', progress: 45, meta: '首页确认中' }],
    clients: [{ title: '茶饮品牌 A', meta: '周四交付 · 已收首款', progress: 82 }, { title: '咨询客户 B', meta: '下周一提案', progress: 54 }, { title: '长期顾问 C', meta: '本月第 3 次', progress: 68 }],
    goals: [{ title: '本月按时交付率 100%', progress: 84 }, { title: '预留 2 天无会议时间', progress: 50 }],
    links: [{ title: '客户资料', meta: '按项目整理' }, { title: '合同与报价', meta: '仅本机' }, { title: '作品集', meta: '8 个案例' }],
    finance: [
      { title: '本月已确认收入', value: '¥28,600', meta: '3 个项目' },
      { title: '待回款', value: '¥8,000', meta: '客户 A · 周五' },
      { title: '待开票', value: '2 笔', meta: '合计 ¥12,500' },
    ],
  },
  'team-lead': {
    quote: '管理不是替大家做决定，而是让好决定更容易发生。',
    tasks: [task('准备与小林的 1:1'), task('确认 Q3 目标拆解'), task('清理两个跨团队阻塞')],
    schedule: [{ time: '09:30', title: '团队站会', meta: '20 分钟' }, { time: '14:00', title: '1:1 · 小林', meta: '成长与反馈' }, { time: '16:00', title: '跨团队对齐', meta: '版本依赖' }],
    projects: [{ title: 'Q3 核心项目', progress: 69, meta: '2 个风险项' }, { title: '招聘与入职', progress: 44, meta: '本周 3 场面试' }],
    team: [{ title: '小林', meta: '今天 14:00 · 1:1', progress: 76 }, { title: '阿杰', meta: '项目节奏稳定', progress: 82 }, { title: '小周', meta: '需要排除阻塞', progress: 48 }],
    goals: [{ title: 'Q3 关键结果整体进度', progress: 63 }, { title: '团队 1:1 覆盖率', progress: 80 }],
    links: [{ title: '团队目标', meta: 'Q3' }, { title: '会议纪要', meta: '本周 5 份' }, { title: '人才地图', meta: '仅本机' }],
    meetings: [
      { title: '团队站会', meta: '今天 09:30 · 聚焦两个阻塞' },
      { title: '1:1 · 小林', meta: '今天 14:00 · 成长与反馈' },
      { title: '跨团队对齐', meta: '今天 16:00 · 版本依赖' },
    ],
    decisions: [
      { title: 'Q3 只保留两个关键项目', meta: '依据：团队容量 · 8 月底复查' },
      { title: '新人导师制延长至 6 周', meta: '依据：前两期反馈 · 下季度复查' },
    ],
  },
}

export function defaultWorkspaceData(workspace) {
  const role = roleSeeds[workspace.sourcePack] || roleSeeds.university
  return {
    ...shared,
    ...role,
    tasks: role.tasks || [task('完成今天最重要的一件事')],
    schedule: role.schedule || [],
    milestones: role.milestones || [{ label: '本阶段目标', date: inDays(30), tone: 'sage' }],
    learning: role.learning || [],
    practice: role.practice || [],
    goals: role.goals || [],
    links: role.links || [],
    classroom: role.classroom || [],
    pipeline: role.pipeline || [],
    projects: role.projects || [],
    clients: role.clients || [],
    team: role.team || [],
    reading: role.reading || [],
    assignments: role.assignments || [],
    wellbeing: role.wellbeing || [],
    lessonPlans: role.lessonPlans || [],
    notices: role.notices || [],
    inbox: role.inbox || [],
    contentCalendar: role.contentCalendar || [],
    meetings: role.meetings || [],
    finance: role.finance || [],
    decisions: role.decisions || [],
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeWorkspaceData(workspace, candidate) {
  const defaults = defaultWorkspaceData(workspace)
  if (!candidate || typeof candidate !== 'object') return defaults
  return {
    ...defaults,
    ...candidate,
    tasks: Array.isArray(candidate.tasks) ? candidate.tasks : defaults.tasks,
    habits: Array.isArray(candidate.habits) ? candidate.habits : defaults.habits,
    focus: { ...defaults.focus, ...(candidate.focus || {}) },
    review: { ...defaults.review, ...(candidate.review || {}) },
  }
}

export function loadWorkspaceData(workspace, embeddedData) {
  try {
    const raw = localStorage.getItem(dataKey(workspace.id))
    return normalizeWorkspaceData(workspace, raw ? JSON.parse(raw) : embeddedData)
  } catch {
    return normalizeWorkspaceData(workspace, embeddedData)
  }
}

export function saveWorkspaceData(workspace, data) {
  const next = normalizeWorkspaceData(workspace, { ...data, updatedAt: new Date().toISOString() })
  localStorage.setItem(dataKey(workspace.id), JSON.stringify(next))
  return next
}
