const dataKey = (workspaceId) => `onebench.data.${workspaceId}.v2`

const inDays = (days) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const inDaysStr = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

const todayStr = () => new Date().toISOString().slice(0, 10)

const task = (title, done = false) => ({ id: crypto.randomUUID(), title, done })
const habit = (name, done = false) => ({ id: crypto.randomUUID(), name, done })
const detail = (title, meta, tone = '') => ({ title, meta, tone })

const shared = {
  quote: '把今天过清楚，长期自然会有答案。',
  profileImage: '',
  quickNote: '',
  focus: { minutes: 25, subject: '今日最重要的一件事' },
  review: { win: '', blocker: '', next: '' },
  habits: [habit('整理工作台', true), habit('专注 25 分钟'), habit('睡前复盘')],
  week: [42, 58, 46, 72, 66, 84, 54],
  weather: {
    city: '北京',
    latitude: 39.9042,
    longitude: 116.4074,
    temperature: 27,
    apparentTemperature: 28,
    weatherCode: 1,
    high: 31,
    low: 23,
    updatedAt: '',
    source: '示例天气',
  },
}

// --- 内置语录库（每日轮换，含毛泽东语录） ---
const quoteLibrary = [
  { text: '把今天过清楚，长期自然会有答案。', source: 'OneBench' },
  { text: '星星之火，可以燎原。', source: '毛泽东' },
  { text: '不是每天都要超常发挥，但要每天都在场。', source: 'OneBench' },
  { text: '为人民服务。', source: '毛泽东' },
  { text: '自由不是同时做所有事，而是清楚现在该做哪一件。', source: 'OneBench' },
  { text: '虚心使人进步，骄傲使人落后。', source: '毛泽东' },
  { text: '真正的推进，是让每个人都知道下一步是什么。', source: 'OneBench' },
  { text: '战略上藐视敌人，战术上重视敌人。', source: '毛泽东' },
  { text: '先把真正想表达的那一句写出来，再谈流量。', source: 'OneBench' },
  { text: '一切反动派都是纸老虎。', source: '毛泽东' },
  { text: '管理不是替大家做决定，而是让好决定更容易发生。', source: 'OneBench' },
  { text: '没有调查，就没有发言权。', source: '毛泽东' },
  { text: '上岸不是一句口号，是今天这一套题和这一次复盘。', source: 'OneBench' },
  { text: '一万年太久，只争朝夕。', source: '毛泽东' },
  { text: '把一节课备扎实，就是给孩子多一条理解世界的路。', source: 'OneBench' },
  { text: '世界是你们的，也是我们的，但是归根结底是你们的。', source: '毛泽东' },
  { text: '不追赶别人的进度，把自己的这一页学明白。', source: 'OneBench' },
  { text: '把每一笔账都算清楚，心里才有底。', source: 'OneBench' },
  { text: '在战略上要藐视敌人，在战术上要重视敌人。', source: '毛泽东' },
  { text: '宝宝的成长没有白走的路，记录本身就是一种陪伴。', source: 'OneBench' },
]

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}

function quoteData() {
  const index = dayOfYear() % quoteLibrary.length
  const daily = quoteLibrary[index]
  const rest = quoteLibrary.filter((_, i) => i !== index)
  return {
    quote: daily.text,
    quotes: [daily, ...rest.slice(0, 4)].map((item) => ({ title: item.text, meta: item.source })),
  }
}

// --- 新闻资讯：按身份角色做本地推荐 ---
function newsItems(roleId) {
  const common = [
    { id: crypto.randomUUID(), title: '国产大模型再升级：多模态推理能力开放内测', category: '科技', hot: true, summary: '多家厂商宣布长上下文与代码生成能力显著提升，开发者可本地部署体验。' },
    { id: crypto.randomUUID(), title: '今年暑期档票房已突破 80 亿', category: '文娱', hot: true, summary: '动画与喜剧片领跑，口碑效应成为票房关键变量。' },
    { id: crypto.randomUUID(), title: '城市绿道里程继续延伸，骑行通勤成新趋势', category: '生活', hot: false, summary: '多条环城绿道贯通，相关数据显示骑行人群同比增长 34%。' },
    { id: crypto.randomUUID(), title: '健康饮食：少油少盐也能好吃的 5 个技巧', category: '健康', hot: false, summary: '从调味顺序到烹饪方式，帮你把家常菜变得更轻盈。' },
  ]
  const roleMap = {
    university: [
      { id: crypto.randomUUID(), title: '多地启动秋季校园招聘，提前准备简历更有优势', category: '求职', hot: true, summary: '提前批岗位集中在科技与制造业，实习经历成为筛选重点。' },
      { id: crypto.randomUUID(), title: '四六级成绩公布在即，查分方式与复核流程一览', category: '考试', hot: false, summary: '官方渠道公布查分时间，对成绩有疑问可在规定期限内申请复核。' },
    ],
    teacher: [
      { id: crypto.randomUUID(), title: '新学期教材修订要点发布，备课需关注这些变化', category: '教育', hot: true, summary: '多个学科新增实践探究环节，建议提前调整教学计划。' },
      { id: crypto.randomUUID(), title: 'AI 辅助批改工具进入课堂，教师角色如何转变', category: '教育', hot: false, summary: '工具可处理重复性批改，教师更聚焦学情分析与个性化辅导。' },
    ],
    'postgraduate-exam': [
      { id: crypto.randomUUID(), title: '考研大纲预计 9 月发布，公共课变动提前关注', category: '考研', hot: true, summary: '政治与时事关联度提高，英语阅读题材范围或扩展。' },
      { id: crypto.randomUUID(), title: '暑期复习进度调查：超过六成考生进入真题阶段', category: '考研', hot: false, summary: '专家建议真题与复盘时间比例控制在 6:4 左右。' },
    ],
    'civil-service-exam': [
      { id: crypto.randomUUID(), title: '国考报名倒计时：往年热门岗位竞争比参考', category: '公考', hot: true, summary: '岗位选择需结合自身条件与往年进面分数综合判断。' },
      { id: crypto.randomUUID(), title: '申论热点素材整理：基层治理与数字政务', category: '公考', hot: false, summary: '建议积累规范表述与典型案例，避免模板化答题。' },
    ],
    creator: [
      { id: crypto.randomUUID(), title: '短视频平台调整推荐机制：完播率权重上升', category: '创作', hot: true, summary: '前 3 秒钩子与信息密度成为决定播放量的关键因素。' },
      { id: crypto.randomUUID(), title: '个人工作台类内容走红，创作者如何差异化表达', category: '创作', hot: false, summary: '真实使用场景大于功能罗列，观众更想看你怎么用。' },
    ],
    operations: [
      { id: crypto.randomUUID(), title: '产品经理能力模型更新：AI 协作成为基础项', category: '职场', hot: true, summary: '从需求文档到数据分析，工具链正在重塑工作流。' },
      { id: crypto.randomUUID(), title: '增长实验周报写法：如何让结论可落地', category: '职场', hot: false, summary: '关注假设、样本量与下一步动作，而不是只堆数字。' },
    ],
    freelancer: [
      { id: crypto.randomUUID(), title: '自由职业者社保缴纳指南更新', category: '经营', hot: true, summary: '多地开通线上办理，灵活就业人员参保门槛继续降低。' },
      { id: crypto.randomUUID(), title: '个人品牌如何建立信任感：案例与误区', category: '经营', hot: false, summary: '持续交付与公开复盘，是比包装更有效的背书。' },
    ],
    'team-lead': [
      { id: crypto.randomUUID(), title: '团队目标拆解：从季度 OKR 到周计划', category: '管理', hot: true, summary: '关键结果需可验证，避免把任务清单当作目标。' },
      { id: crypto.randomUUID(), title: '1:1 沟通清单：如何聊出真实阻塞', category: '管理', hot: false, summary: '少问进度，多问需要什么支持。' },
    ],
    financial: [
      { id: crypto.randomUUID(), title: '小规模纳税人季度申报节点提醒', category: '财税', hot: true, summary: '注意发票开具时间与收入确认口径，避免跨期差错。' },
      { id: crypto.randomUUID(), title: '个人养老金账户投资范围再扩大', category: '理财', hot: false, summary: '新增多款指数基金，长期配置选择更丰富。' },
    ],
    'family-baby': [
      { id: crypto.randomUUID(), title: '儿童疫苗接种时间表：一类疫苗免费接种节点', category: '育儿', hot: true, summary: '按时接种是入园入学的重要凭证，建议提前预约。' },
      { id: crypto.randomUUID(), title: '宝宝睡眠安全：美国儿科学会更新建议', category: '育儿', hot: false, summary: '仰睡、硬床垫、无杂物是降低风险的核心措施。' },
    ],
  }
  const extra = roleMap[roleId] || []
  return [...common, ...extra].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0))
}

// --- 客户跟进 ---
function clientFollowupItems() {
  return [
    { title: '客户 A 需求确认', meta: '明天 14:00 · 微信', tone: 'blue' },
    { title: '客户 B 合同修订', meta: '周五前发出第二版', tone: 'apricot' },
    { title: '客户 C 回款提醒', meta: '账期剩余 3 天', tone: 'sage' },
  ]
}

// --- 发票统计 ---
function invoiceItems() {
  return [
    { title: '7 月服务费', value: '¥6,000', meta: '已收 · 增值税普通发票', status: '已收' },
    { title: '设计费尾款', value: '¥4,500', meta: '待开 · 增值税专用发票', status: '待开' },
    { title: '咨询费预付款', value: '¥3,200', meta: '已收 · 普票', status: '已收' },
  ]
}

// --- 记账 ---
function bookkeepingItems() {
  return [
    { title: '工资收入', value: '+¥12,500', meta: '本月', category: 'income' },
    { title: '房租支出', value: '-¥3,200', meta: '本月', category: 'expense' },
    { title: '餐饮', value: '-¥58', meta: '今天', category: 'expense' },
    { title: '交通', value: '-¥34', meta: '今天', category: 'expense' },
  ]
}

// --- 理财知识 ---
function financeKnowledgeItems() {
  return [
    { title: '应急储备金', meta: '建议预留 3-6 个月生活开支，放在流动性好的账户。' },
    { title: '基金定投的微笑曲线', meta: '长期坚持定投可以在市场低点积累更多份额。' },
    { title: '保险配置顺序', meta: '先保障后理财：医疗险、意外险、重疾险优先。' },
  ]
}

// --- 运动记录 ---
function workoutItems() {
  return [
    { title: '今日步数', value: '6,842', meta: '目标 10,000' },
    { title: '晨跑', value: '3.2 km', meta: '消耗 186 kcal' },
    { title: '拉伸', value: '10 min', meta: '已完成' },
  ]
}

// --- 好好吃饭 ---
function mealItems() {
  return [
    { title: '早餐', meta: '燕麦牛奶 + 煮鸡蛋 + 蓝莓', tone: 'sage' },
    { title: '午餐', meta: '米饭 + 清炒时蔬 + 鸡胸肉', tone: 'apricot' },
    { title: '晚餐', meta: '杂粮粥 + 豆腐 + 凉拌黄瓜', tone: 'blue' },
  ]
}

// --- 健康管理 ---
function healthItems() {
  return [
    { title: '体重', value: '62.4 kg', meta: '较上周 -0.3 kg' },
    { title: '昨晚睡眠', value: '7h 12m', meta: '深睡 1h 40m' },
    { title: '血压', value: '118/76', meta: '正常范围' },
    { title: '步数', value: '6,842', meta: '今日' },
  ]
}

// --- 生日记录 ---
function birthdayItems() {
  return [
    { title: '妈妈', meta: `${inDaysStr(12)}（12 天后）`, tone: 'apricot' },
    { title: '闺蜜小林', meta: `${inDaysStr(25)}（25 天后）`, tone: 'sage' },
    { title: '爸爸', meta: `${inDaysStr(95)}（95 天后）`, tone: 'blue' },
    { title: '自己', meta: `${inDaysStr(140)}（140 天后）`, tone: 'plum' },
  ]
}

// --- 生理期记录 ---
function periodData() {
  const today = new Date()
  const last = new Date(today)
  last.setDate(last.getDate() - 26)
  const next = new Date(last)
  next.setDate(next.getDate() + 28)
  const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return {
    lastPeriod: last.toISOString().slice(0, 10),
    cycleDays: 28,
    predictedNext: next.toISOString().slice(0, 10),
    currentDay: 26,
    status: daysUntil > 0 ? `预计 ${daysUntil} 天后来潮` : '预计今日来潮',
    history: [
      { date: last.toISOString().slice(0, 10), duration: 5 },
      { date: new Date(last.getFullYear(), last.getMonth(), last.getDate() - 28).toISOString().slice(0, 10), duration: 5 },
      { date: new Date(last.getFullYear(), last.getMonth(), last.getDate() - 56).toISOString().slice(0, 10), duration: 6 },
    ],
  }
}

// --- 日记本 ---
function diaryItems() {
  return [
    { title: '今天的小确幸', meta: todayStr(), note: '午休时读到一句不错的话，记下来。' },
    { title: '一点反思', meta: todayStr(), note: '事情很多的时候，先把最重要的那件做完。' },
  ]
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
    meals: [
      { title: '早餐', meta: '包子 + 豆浆', tone: 'sage' },
      { title: '午餐', meta: '食堂套餐', tone: 'apricot' },
      { title: '晚餐', meta: '宿舍小煮', tone: 'blue' },
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
    clientFollowup: [
      { title: '客户 A 终稿确认', meta: '周四 10:00 · 邮件', tone: 'apricot' },
      { title: '客户 B 报价跟进', meta: '下周一前回复', tone: 'blue' },
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
  financial: {
    quote: '把每一笔账都算清楚，心里才有底。',
    tasks: [task('核对昨日收支'), task('整理本周发票'), task('跟进客户 B 回款')],
    schedule: [
      { time: '09:00', title: '发票录入', meta: '扫描与分类' },
      { time: '14:00', title: '客户对账', meta: '发送月度明细' },
      { time: '16:30', title: '理财学习', meta: '阅读 20 分钟' },
    ],
    goals: [
      { title: '本月账目日清率 100%', progress: 88 },
      { title: '读完一本理财书', progress: 45 },
    ],
    links: [
      { title: '发票夹', meta: '本月 12 张' },
      { title: '合同模板', meta: '仅本机' },
      { title: '税务日历', meta: '关键申报节点' },
    ],
    finance: [
      { title: '本月已确认收入', value: '¥32,000', meta: '4 个项目' },
      { title: '待回款', value: '¥11,500', meta: '2 位客户' },
      { title: '待抵扣进项', value: '¥2,800', meta: '6 张专票' },
    ],
    bookkeeping: [
      { title: '设计服务收入', value: '+¥8,000', meta: '客户 A', category: 'income' },
      { title: '办公耗材', value: '-¥420', meta: '采购', category: 'expense' },
      { title: '社保缴纳', value: '-¥1,860', meta: '个人', category: 'expense' },
      { title: '咨询费', value: '+¥3,200', meta: '客户 B', category: 'income' },
    ],
    invoices: [
      { title: '7 月设计服务费', value: '¥8,000', meta: '已收 · 专票', status: '已收' },
      { title: '咨询费尾款', value: '¥3,200', meta: '待收 · 普票', status: '待收' },
      { title: '办公设备', value: '¥1,200', meta: '待抵扣 · 专票', status: '待抵扣' },
    ],
    financeKnowledge: [
      { title: '增值税小规模纳税人优惠', meta: '季度销售额未超 30 万可免征增值税。' },
      { title: '发票抵扣期限', meta: '增值税专用发票需在开具后 360 日内认证抵扣。' },
    ],
    clients: [
      { title: '客户 A 设计项目', meta: '已收首款 50%', progress: 82 },
      { title: '客户 B 年度顾问', meta: '合同谈判中', progress: 45 },
    ],
    clientFollowup: [
      { title: '客户 A 尾款催收', meta: '账期剩余 3 天 · 微信', tone: 'apricot' },
      { title: '客户 B 合同修订', meta: '周五前发出', tone: 'blue' },
    ],
  },
  'family-baby': {
    quote: '宝宝的成长没有白走的路，记录本身就是一种陪伴。',
    tasks: [task('记录今日喂养'), task('预约下周疫苗'), task('整理宝宝照片')],
    schedule: [
      { time: '07:00', title: '起床喂奶', meta: '180 ml' },
      { time: '10:00', title: '早教游戏', meta: '黑白卡 + 抚触' },
      { time: '20:30', title: '睡前故事', meta: '15 分钟' },
    ],
    goals: [
      { title: '本周完成 5 天规律作息', progress: 60 },
      { title: '建立家庭健康档案', progress: 35 },
    ],
    links: [
      { title: '疫苗本', meta: '接种记录' },
      { title: '育儿资料', meta: '仅本机' },
      { title: '亲子相册', meta: '按月整理' },
    ],
    meals: [
      { title: '宝宝早餐', meta: '配方奶 180 ml + 蛋黄泥', tone: 'sage' },
      { title: '宝宝午餐', meta: '米粉 + 胡萝卜泥', tone: 'apricot' },
      { title: '宝宝晚餐', meta: '小米粥 + 南瓜泥', tone: 'blue' },
    ],
    health: [
      { title: '宝宝体温', value: '36.6°C', meta: '正常' },
      { title: '昨日睡眠', value: '13h 30m', meta: '含 2 次小睡' },
      { title: '体重', value: '8.2 kg', meta: '较上月 +0.6 kg' },
    ],
    birthdays: [
      { title: '宝宝周岁', meta: `${inDaysStr(145)}（145 天后）`, tone: 'apricot' },
      { title: '妈妈生日', meta: `${inDaysStr(12)}（12 天后）`, tone: 'sage' },
    ],
    period: {
      lastPeriod: new Date(new Date().setDate(new Date().getDate() - 26)).toISOString().slice(0, 10),
      cycleDays: 28,
      predictedNext: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10),
      currentDay: 26,
      status: '预计 2 天后来潮',
      history: [
        { date: new Date(new Date().setDate(new Date().getDate() - 26)).toISOString().slice(0, 10), duration: 5 },
        { date: new Date(new Date().setDate(new Date().getDate() - 54)).toISOString().slice(0, 10), duration: 5 },
      ],
    },
    diary: [
      { title: '宝宝今天会翻身了', meta: todayStr(), note: '趴着的时候突然自己翻过来，一脸懵。' },
      { title: '育儿小笔记', meta: todayStr(), note: '喂奶后拍嗝 5 分钟，今天没有吐奶。' },
    ],
    habits: [habit('给宝宝读绘本'), habit('记录喂养'), habit('户外 30 分钟')],
    reading: [{ title: '崔玉涛育儿百科', meta: '读到 30%' }, { title: '正面管教', meta: '本月待读' }],
  },
}

export function defaultWorkspaceData(workspace) {
  const role = roleSeeds[workspace.sourcePack] || roleSeeds.university
  const dailyQuotes = quoteData()
  return {
    ...shared,
    ...role,
    quote: role.quote || dailyQuotes.quote,
    quotes: role.quotes || dailyQuotes.quotes,
    tasks: role.tasks || [task('完成今天最重要的一件事')],
    habits: role.habits || shared.habits,
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
    // 新增模块：由内置逻辑自动填充示例数据
    news: role.news || newsItems(workspace.sourcePack),
    clientFollowup: role.clientFollowup || clientFollowupItems(),
    invoices: role.invoices || invoiceItems(),
    bookkeeping: role.bookkeeping || bookkeepingItems(),
    financeKnowledge: role.financeKnowledge || financeKnowledgeItems(),
    workout: role.workout || workoutItems(),
    meals: role.meals || mealItems(),
    health: role.health || healthItems(),
    birthdays: role.birthdays || birthdayItems(),
    period: role.period || periodData(),
    diary: role.diary || diaryItems(),
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
    weather: { ...defaults.weather, ...(candidate.weather || {}) },
    period: { ...defaults.period, ...(candidate.period || {}) },
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
