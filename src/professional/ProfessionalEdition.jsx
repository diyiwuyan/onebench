import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, CalendarBlank, CaretRight, ChartBar, Check, CheckCircle,
  ClockCountdown, FileText, GraduationCap, House, Kanban, Lightbulb,
  ListChecks, Notebook, Plus, Smiley, Star, Student, Target, UsersThree,
  VideoCamera, WarningCircle, Rabbit,
} from '@phosphor-icons/react'
import './professional-edition.css'

const editions = {
  exam: { label: '考公兔兔', icon: GraduationCap },
  teacher: { label: '班主任', icon: Student },
  hu: { label: '生活工作台', icon: Smiley },
  creator: { label: '创作者', icon: VideoCamera },
}

const defaults = {
  exam: { tasks: [{ text: '言语理解 20 题', done: true }, { text: '申论素材积累', done: false }, { text: '错题二刷', done: false }] },
  teacher: { tasks: [{ text: '批改 3 班周记', done: true }, { text: '联系小宇家长', done: false }, { text: '整理月考数据', done: false }] },
  hu: { tasks: [{ text: '晨间拉伸 15 分钟', done: true }, { text: '完成方案初稿', done: false }, { text: '英语听力练习', done: false }] },
  creator: { tasks: [{ text: '写完选题「效率系统」', done: true }, { text: '录制周四视频', done: false }, { text: '回复合作邮件', done: false }], pipeline: [{ title: '我的 AI 工作流', stage: 0 }, { title: '夏日效率挑战', stage: 1 }, { title: 'Notion 模板复盘', stage: 2 }] },
}

const navs = {
  exam: [['今日学习', House], ['行测练习', ListChecks], ['申论写作', FileText], ['错题本', Notebook], ['学习数据', ChartBar]],
  teacher: [['班级总览', House], ['学生管理', UsersThree], ['成绩分析', ChartBar], ['作业管理', Notebook], ['谈话记录', Smiley]],
  hu: [['今日', House], ['每日计划', ListChecks], ['灵感', Lightbulb], ['复盘', Notebook], ['备忘录', FileText], ['学习', BookOpen]],
  creator: [['今日推进', House], ['内容管线', Kanban], ['档期', CalendarBlank], ['复盘实验室', Notebook], ['OKR', Target]],
}

const secondaryPages = {
  exam: [null,
    { id: 'aptitude', title: '行测练习', subtitle: '按模块记录题量、正确率和用时', items: [['资料分析 20 题', '正确率 80% · 32 分钟', 80], ['言语理解 20 题', '正确率 75% · 18 分钟', 75], ['判断推理 25 题', '正确率 68% · 27 分钟', 68]] },
    { id: 'essay', title: '申论写作', subtitle: '从素材积累推进到完整作答', items: [['热点素材：基层治理', '已摘录 6 条观点', 70], ['归纳概括小题', '待完成一次限时练习', 35], ['大作文框架', '本周完成 1/2 篇', 50]] },
    { id: 'mistakes', title: '错题本', subtitle: '今天只复习真正薄弱的题型', items: [['资料分析 · 基期量', '6 题待二刷', 42], ['图形推理 · 位置规律', '4 题待二刷', 58], ['数量关系 · 工程问题', '8 题待二刷', 30]] },
    { id: 'study-data', title: '学习数据', subtitle: '日、周、月趋势都由真实记录生成', items: [['本周学习时长', '12 小时 40 分', 76], ['本周刷题', '680 题', 68], ['综合正确率', '74%', 74]] },
  ],
  teacher: [null,
    { id: 'students', title: '学生管理', subtitle: '关注需要帮助的人，而不是公开排名', items: [['林小宇', '数学波动较大 · 待谈话', 45], ['王思雨', '作业连续三次按时提交', 92], ['陈可欣', '课堂参与度正在提升', 78]] },
    { id: 'scores', title: '成绩分析', subtitle: '从班级趋势下钻到知识点', items: [['语文平均分', '92.4 · 较上次 +2.1', 92], ['数学平均分', '88.7 · 需关注函数', 89], ['英语平均分', '90.1 · 阅读稳定', 90]] },
    { id: 'assignments', title: '作业管理', subtitle: '发布、收集、批改和补交在同一处', items: [['周记批改', '已完成 36/42', 86], ['数学练习册', '已完成 39/42', 93], ['英语朗读', '已完成 31/42', 74]] },
    { id: 'conversations', title: '谈话记录', subtitle: '只记录必要信息，支持随时删除', items: [['林小宇 · 学习状态', '今天课后 · 待进行', 20], ['王思雨 · 阶段鼓励', '已完成 · 记录已归档', 100], ['陈可欣 · 家校沟通', '周五前联系家长', 55]] },
  ],
  hu: [null,
    { id: 'daily', title: '每日计划', subtitle: '个人日常与重要任务放在同一条时间线上', items: [['普拉提练习', '60 分钟 · 每日必做', 100], ['英语精听', '30 分钟 · BBC', 60], ['内容拍摄', '下午 15:00', 35]] },
    { id: 'ideas', title: '选题每日灵感', subtitle: '把灵感变成下一步动作', items: [['给未来的自己', '个人成长系列', 25], ['一周真实复盘', '生活记录系列', 60], ['小空间效率改造', '实用经验系列', 40]] },
    { id: 'review', title: '内容复盘', subtitle: '记录有效动作，不追逐空洞指标', items: [['上周短视频', '完播率提升 8%', 78], ['图文选题实验', '收藏率 12.4%', 64], ['本周改进', '开头提前给结论', 35]] },
    { id: 'memo', title: '备忘录', subtitle: '随手写下，不需要先分类', items: [['周三预约体检', '生活', 30], ['更新作品集首页', '工作', 65], ['购买小提琴琴弦', '个人', 20]] },
    { id: 'learning', title: '个人学习', subtitle: '长期积累也要有清晰下一步', items: [['英语精听', '本周 3/5 次', 60], ['小提琴练习', '第一阶段 · 连弓换弦', 45], ['阅读计划', '《创造的勇气》42%', 42]] },
  ],
  creator: [null,
    { id: 'pipeline', title: '内容管线', subtitle: '选题、制作、发布和复盘连续推进', items: [['我的 AI 工作流', '制作中 · 下一步录屏', 58], ['夏日效率挑战', '脚本完成 · 待录制', 44], ['Notion 模板复盘', '已发布 · 待复盘', 88]] },
    { id: 'schedule', title: '档期规划', subtitle: '拖动排期将在后续版本开放，当前可勾选确认', items: [['周二 10:00', '完成脚本', 70], ['周四 15:00', '录制主视频', 35], ['周六 11:00', '发布与互动', 20]] },
    { id: 'creator-review', title: '复盘实验室', subtitle: '从数据和过程里沉淀可复用方法', items: [['选题验证', '搜索需求明确', 80], ['前 3 秒留存', '需要缩短铺垫', 46], ['评论区问题', '整理为下一条选题', 68]] },
    { id: 'creator-okr', title: '阶段目标', subtitle: '目标与每天的真实推进联动', items: [['发布 12 条有用内容', '7/12', 58], ['完成 3 次深度复盘', '2/3', 67], ['沉淀 1 套创作流程', '进行中', 42]] },
  ],
}

function readStore(edition) {
  try { return { ...defaults[edition], ...JSON.parse(localStorage.getItem(`onebench.professional.${edition}`) || '{}') } } catch { return defaults[edition] }
}

export function ProfessionalEdition({ onBackToBasic }) {
  const initial = localStorage.getItem('onebench.edition')
  const [edition, setEdition] = useState(editions[initial] ? initial : 'exam')
  const [data, setData] = useState(() => readStore(editions[initial] ? initial : 'exam'))
  const [active, setActive] = useState(0)
  const [draft, setDraft] = useState('')

  useEffect(() => { localStorage.setItem('onebench.edition', edition) }, [edition])
  useEffect(() => { localStorage.setItem(`onebench.professional.${edition}`, JSON.stringify(data)) }, [edition, data])
  const completed = useMemo(() => data.tasks.filter((task) => task.done).length, [data.tasks])
  const dateLabel = useMemo(() => new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }), [])
  const toggle = (i) => setData((old) => ({ ...old, tasks: old.tasks.map((t, index) => index === i ? { ...t, done: !t.done } : t) }))
  const addTask = (event) => { event.preventDefault(); if (!draft.trim()) return; setData((old) => ({ ...old, tasks: [...old.tasks, { text: draft.trim(), done: false }] })); setDraft('') }
  const advance = (i) => setData((old) => ({ ...old, pipeline: (old.pipeline || defaults.creator.pipeline).map((item, index) => index === i ? { ...item, stage: (item.stage + 1) % 3 } : item) }))
  const switchEdition = (nextEdition) => {
    setData(readStore(nextEdition))
    setActive(0)
    setEdition(nextEdition)
  }
  const toggleSectionItem = (pageId, itemIndex) => setData((old) => {
    const current = old.sectionDone?.[pageId] || []
    return { ...old, sectionDone: { ...old.sectionDone, [pageId]: current.includes(itemIndex) ? current.filter((index) => index !== itemIndex) : [...current, itemIndex] } }
  })
  const updateSectionNote = (pageId, value) => setData((old) => ({ ...old, sectionNotes: { ...old.sectionNotes, [pageId]: value } }))
  const theme = edition

  return <main className={`professional professional--${theme}`}>
    <aside className="professional__sidebar">
      <div className="professional__brand"><span className="brand-orb"><Star weight="fill" /></span><span>OneBench</span></div>
      <nav>{navs[edition].map(([label, Icon], index) => <button className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} key={label}><Icon weight={active === index ? 'fill' : 'regular'} />{label}</button>)}</nav>
      <button className="professional__back" onClick={onBackToBasic}>返回基础版 <CaretRight /></button>
    </aside>
    <section className="professional__content">
      <header className="professional__topbar">
        <div className="edition-switcher" aria-label="切换专业版">{Object.entries(editions).map(([key, item]) => { const Icon = item.icon; return <button key={key} aria-label={item.label} onClick={() => switchEdition(key)} className={edition === key ? 'selected' : ''}><Icon weight="fill" /> <span>{item.label}</span></button> })}</div>
        <div className="professional__date">{dateLabel}</div>
      </header>
      {active > 0 && <SecondaryView spec={secondaryPages[edition][active]} data={data} onToggle={toggleSectionItem} onNote={updateSectionNote} />}
      {active === 0 && edition === 'exam' && <ExamView data={data} completed={completed} toggle={toggle} draft={draft} setDraft={setDraft} addTask={addTask} />}
      {active === 0 && edition === 'teacher' && <TeacherView data={data} completed={completed} toggle={toggle} draft={draft} setDraft={setDraft} addTask={addTask} />}
      {active === 0 && edition === 'hu' && <HuView data={data} completed={completed} toggle={toggle} draft={draft} setDraft={setDraft} addTask={addTask} />}
      {active === 0 && edition === 'creator' && <CreatorView data={data} completed={completed} toggle={toggle} draft={draft} setDraft={setDraft} addTask={addTask} advance={advance} />}
    </section>
  </main>
}

function TaskList({ data, completed, toggle, draft, setDraft, addTask, title = '今日任务' }) {
  return <section className="task-card"><div className="section-title"><div><p>{title}</p><h2>{completed}/{data.tasks.length} 已完成</h2></div><CheckCircle weight="fill" /></div><div className="task-list">{data.tasks.map((task, i) => <button className={task.done ? 'done' : ''} onClick={() => toggle(i)} key={`${task.text}-${i}`}><span className="tick">{task.done && <Check weight="bold" />}</span>{task.text}</button>)}</div><form onSubmit={addTask}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="添加一件小事…" /><button aria-label="新增任务"><Plus weight="bold" /></button></form></section>
}

function ExamView(props) { return <div className="edition-page exam-page"><div className="exam-hero"><div><p>下午好，小兔子</p><h1>今天也稳稳向前</h1><span>距离国考还有</span><strong>128 <small>天</small></strong></div><div className="bunny-icon"><Rabbit weight="duotone" /></div></div><TaskList {...props} title="今日学习清单" /><div className="module-grid"><Mini icon={ListChecks} label="行测" value="正确率 72%" /><Mini icon={FileText} label="申论" value="已写 2 篇" /><Mini icon={Notebook} label="错题本" value="待复习 18 题" /></div></div> }
function TeacherView(props) { return <div className="edition-page teacher-page"><div className="welcome"><p>高二（3）班 · 班主任工作台</p><h1>上午好，陈老师</h1><span>把琐碎交给系统，把时间留给学生。</span></div><div className="stat-row"><Stat n="42" t="班级学生" /><Stat n="96%" t="本周作业交齐" /><Stat n="3" t="需要关注" warning /></div><TaskList {...props} title="待办事项" /><section className="student-card"><div className="section-title"><div><p>学生动态</p><h2>本周需要跟进</h2></div><UsersThree weight="fill" /></div><div className="student-line"><b>林小宇</b><span>数学波动较大 · 建议课后谈话</span><WarningCircle /></div></section></div> }
function HuView(props) { return <div className="edition-page hu-page"><div className="hu-hero"><p>Sunday, August 02</p><h1>慢慢生活，认真发光</h1><span>今天的节奏，由你定义。</span></div><TaskList {...props} title="每日计划" /><div className="note-grid"><article><Lightbulb weight="fill" /><p>灵感收集</p><b>「给未来的自己」系列选题</b></article><article><Notebook weight="fill" /><p>今日复盘</p><b>完成一个重要动作，也算进步。</b></article><article><BookOpen weight="fill" /><p>学习角</p><b>英语精听 · 30 分钟</b></article></div></div> }
function CreatorView(props) { const pipeline = props.data.pipeline || defaults.creator.pipeline; return <div className="edition-page creator-page"><div className="creator-hero"><div><p>CREATOR OS</p><h1>让今天的推进看得见</h1></div><div className="streak"><b>12</b><span>连续推进天数</span></div></div><div className="creator-grid"><TaskList {...props} title="今日推进" /><section className="pipeline-card"><div className="section-title"><div><p>内容管线</p><h2>点击卡片推进状态</h2></div><Kanban weight="fill" /></div>{pipeline.map((item, i) => <button className={`pipe stage-${item.stage}`} onClick={() => props.advance(i)} key={item.title}><span>{['选题', '制作中', '已发布'][item.stage]}</span><b>{item.title}</b><CaretRight /></button>)}</section></div><div className="okr"><Target weight="fill" /><div><p>Q3 OKR</p><b>发布 12 条有用的内容</b></div><span>7 / 12</span></div></div> }
function Mini({ icon: Icon, label, value }) { return <article className="mini"><Icon weight="fill" /><p>{label}</p><b>{value}</b></article> }
function Stat({ n, t, warning }) { return <article className={warning ? 'warning' : ''}><b>{n}</b><span>{t}</span></article> }

function SecondaryView({ spec, data, onToggle, onNote }) {
  const done = data.sectionDone?.[spec.id] || []
  return <div className="edition-page secondary-page"><header><p>专业模块</p><h1>{spec.title}</h1><span>{spec.subtitle}</span></header><section className="secondary-list">{spec.items.map(([title, meta, progress], index) => <button type="button" key={title} className={done.includes(index) ? 'done' : ''} onClick={() => onToggle(spec.id, index)}><span className="tick">{done.includes(index) && <Check weight="bold" />}</span><span><strong>{title}</strong><small>{meta}</small><progress max="100" value={progress}>{progress}%</progress></span><b>{progress}%</b></button>)}</section><label className="section-note">这个模块的备注<textarea value={data.sectionNotes?.[spec.id] || ''} onChange={(event) => onNote(spec.id, event.target.value)} placeholder="记录下一步、问题或复盘结论，内容会自动保存在本机。" /></label></div>
}
