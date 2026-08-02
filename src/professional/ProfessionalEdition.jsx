import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowCounterClockwise, BookOpen, CalendarBlank, ChartBar, Check, CheckCircle,
  ClockCountdown, DownloadSimple, FileText, GearSix, GraduationCap, House,
  Kanban, Lightbulb, ListChecks, Notebook, Plus, Rabbit, Smiley, Star, Student,
  Target, Trash, UploadSimple, UsersThree, VideoCamera, WarningCircle, X,
} from '@phosphor-icons/react'
import './professional-edition.css'

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const today = () => new Date().toISOString().slice(0, 10)

const editions = {
  exam: { label: '考公冲刺台', icon: GraduationCap, subtitle: '刷题、错题与申论闭环' },
  teacher: { label: '班主任工作台', icon: Student, subtitle: '学生、成绩与班级事务' },
  hu: { label: '胡楚靓同款', icon: Smiley, subtitle: '生活、灵感与长期学习' },
  creator: { label: '创作者工作台', icon: VideoCamera, subtitle: '选题、制作、发布与复盘' },
}

const defaults = {
  exam: {
    profile: { name: '小兔子', compact: false },
    tasks: [{ id: 'e-t1', text: '言语理解 20 题', done: true }, { id: 'e-t2', text: '申论素材积累', done: false }, { id: 'e-t3', text: '错题二刷', done: false }],
    countdowns: [{ id: 'e-c1', title: '国家公务员考试', date: '2026-11-29' }, { id: 'e-c2', title: '省考笔试', date: '2027-03-14' }],
    practices: [{ id: 'e-p1', category: '资料分析', questions: 20, correct: 17, minutes: 31, date: today() }, { id: 'e-p2', category: '言语理解', questions: 20, correct: 15, minutes: 18, date: today() }],
    mistakes: [{ id: 'e-m1', category: '资料分析', title: '基期量计算', reason: '公式代入顺序错误', reviewed: false }, { id: 'e-m2', category: '判断推理', title: '位置规律', reason: '遗漏旋转方向', reviewed: true }],
    essays: [{ id: 'e-s1', title: '基层治理归纳概括', type: '小题', words: 260, date: today() }],
    studyLogs: [{ id: 'e-l1', title: '行测套卷', minutes: 105, date: today() }],
  },
  teacher: {
    profile: { name: '陈老师', compact: false },
    classSize: 42,
    tasks: [{ id: 't-t1', text: '批改 3 班周记', done: true }, { id: 't-t2', text: '联系小宇家长', done: false }, { id: 't-t3', text: '整理月考数据', done: false }],
    students: [{ id: 't-s1', name: '林小宇', tag: '数学波动', status: '需跟进' }, { id: 't-s2', name: '王思雨', tag: '作业稳定', status: '良好' }, { id: 't-s3', name: '陈可欣', tag: '课堂进步', status: '观察' }],
    scores: [{ id: 't-g1', name: '林小宇', subject: '数学', score: 78 }, { id: 't-g2', name: '王思雨', subject: '数学', score: 93 }, { id: 't-g3', name: '陈可欣', subject: '数学', score: 88 }],
    assignments: [{ id: 't-a1', title: '周记', submitted: 36, total: 42 }, { id: 't-a2', title: '数学练习册', submitted: 39, total: 42 }],
    conversations: [{ id: 't-c1', student: '林小宇', summary: '了解最近学习状态', date: today(), done: false }],
    discipline: [{ id: 't-d1', student: '周宁', summary: '课堂迟到，已提醒', date: today() }],
    seats: ['林小宇', '王思雨', '陈可欣', '周宁', '赵一然', '许嘉', '沈清', '陆遥', '方越', '宋禾', '顾川', '韩笑'],
  },
  hu: {
    profile: { name: '楚靓', compact: false },
    tasks: [{ id: 'h-t1', text: '晨间拉伸 15 分钟', done: true }, { id: 'h-t2', text: '完成方案初稿', done: false }, { id: 'h-t3', text: '英语精听练习', done: false }],
    ideas: [{ id: 'h-i1', title: '给未来的自己', tag: '成长', status: 0 }, { id: 'h-i2', title: '一周真实复盘', tag: '生活', status: 1 }],
    content: [{ id: 'h-c1', title: '小空间效率改造', format: '图文', status: 1 }, { id: 'h-c2', title: '我的晨间工作流', format: '视频', status: 2 }],
    reviews: [{ id: 'h-r1', title: '晨间工作流', metric: '收藏率 12.4%', insight: '开头直接给清单' }],
    memos: [{ id: 'h-m1', text: '周三预约体检', done: false }, { id: 'h-m2', text: '购买小提琴琴弦', done: true }],
    learning: [{ id: 'h-l1', title: '英语精听', minutes: 30, date: today() }, { id: 'h-l2', title: '小提琴连弓', minutes: 45, date: today() }],
  },
  creator: {
    profile: { name: '一位创作者', compact: false },
    tasks: [{ id: 'c-t1', text: '写完「效率系统」脚本', done: true }, { id: 'c-t2', text: '录制周四视频', done: false }, { id: 'c-t3', text: '回复合作邮件', done: false }],
    pipeline: [{ id: 'c-p1', title: '我的 AI 工作流', stage: 1, platform: '小红书' }, { id: 'c-p2', title: '夏日效率挑战', stage: 0, platform: '视频号' }, { id: 'c-p3', title: 'Notion 模板复盘', stage: 2, platform: '小红书' }],
    schedule: [{ id: 'c-s1', title: '完成脚本', date: today(), time: '10:00' }, { id: 'c-s2', title: '录制主视频', date: today(), time: '15:00' }],
    reviews: [{ id: 'c-r1', title: 'AI 工作流', views: 18600, saves: 1280, insight: '教程步骤前置，收藏明显提升' }],
    okrs: [{ id: 'c-o1', title: '发布 12 条有用内容', current: 7, target: 12 }, { id: 'c-o2', title: '完成 3 次深度复盘', current: 2, target: 3 }],
  },
}

const navs = {
  exam: [['今日冲刺', House], ['行测记录', ListChecks], ['错题本', Notebook], ['申论写作', FileText], ['学习数据', ChartBar]],
  teacher: [['班级总览', House], ['学生管理', UsersThree], ['成绩分析', ChartBar], ['作业管理', Notebook], ['谈话与纪律', Smiley], ['排座位', Kanban]],
  hu: [['今日生活', House], ['灵感库', Lightbulb], ['内容进度', Kanban], ['复盘', Notebook], ['备忘录', FileText], ['长期学习', BookOpen]],
  creator: [['今日推进', House], ['内容管线', Kanban], ['发布档期', CalendarBlank], ['复盘实验室', Notebook], ['阶段目标', Target]],
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function readStore(edition) {
  try {
    const stored = JSON.parse(localStorage.getItem(`onebench.professional.${edition}`) || '{}')
    const merged = { ...clone(defaults[edition]), ...stored, profile: { ...defaults[edition].profile, ...(stored.profile || {}) } }
    for (const [key, value] of Object.entries(merged)) {
      if (key !== 'seats' && Array.isArray(value)) merged[key] = value.map((item) => typeof item === 'object' && item !== null ? { id: item.id || uid(), ...item } : item)
    }
    return merged
  } catch { return clone(defaults[edition]) }
}
function daysUntil(date) { return Math.max(0, Math.ceil((new Date(`${date}T00:00:00`) - new Date()) / 86400000)) }

export function ProfessionalEdition({ onBackToBasic }) {
  const initial = localStorage.getItem('onebench.edition')
  const [edition, setEdition] = useState(editions[initial] ? initial : 'exam')
  const [data, setData] = useState(() => readStore(editions[initial] ? initial : 'exam'))
  const [active, setActive] = useState(0)
  const [settings, setSettings] = useState(false)
  const [toast, setToast] = useState('')
  const importRef = useRef(null)

  useEffect(() => { localStorage.setItem('onebench.edition', edition) }, [edition])
  useEffect(() => { localStorage.setItem(`onebench.professional.${edition}`, JSON.stringify(data)) }, [edition, data])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 1800); return () => clearTimeout(timer) }, [toast])

  const switchEdition = (next) => {
    if (next === 'basic') { setSettings(false); onBackToBasic(); return }
    setData(readStore(next)); setEdition(next); setActive(0); setSettings(false); setToast(`已切换到${editions[next].label}`)
  }
  const update = (key, next) => setData((old) => ({ ...old, [key]: typeof next === 'function' ? next(old[key] || []) : next }))
  const updateItem = (key, id, patch) => update(key, (items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  const removeItem = (key, id) => update(key, (items) => items.filter((item) => item.id !== id))
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ edition, data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `onebench-${edition}.json`; link.click(); URL.revokeObjectURL(url); setToast('备份已下载')
  }
  const importData = async (event) => {
    const file = event.target.files?.[0]; if (!file) return
    try { const parsed = JSON.parse(await file.text()); setData({ ...clone(defaults[edition]), ...(parsed.data || parsed) }); setToast('数据已导入') } catch { setToast('文件格式不正确') }
    event.target.value = ''
  }
  const reset = () => { if (!window.confirm('恢复当前版本的示例数据？你的修改会被覆盖。')) return; setData(clone(defaults[edition])); setToast('已恢复示例数据') }
  const Page = { exam: ExamEdition, teacher: TeacherEdition, hu: HuEdition, creator: CreatorEdition }[edition]
  const CurrentIcon = editions[edition].icon
  const dateLabel = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  return <main className={`professional professional--${edition} ${data.profile?.compact ? 'is-compact' : ''}`}>
    <aside className="professional__sidebar">
      <div className="professional__brand"><span className="brand-orb"><CurrentIcon weight="fill" /></span><span>OneBench</span></div>
      <nav aria-label={`${editions[edition].label}导航`}>{navs[edition].map(([label, Icon], index) => <button type="button" className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} key={label}><Icon weight={active === index ? 'fill' : 'regular'} /><span>{label}</span></button>)}</nav>
      <button className="professional__settings" type="button" onClick={() => setSettings(true)}><GearSix weight="duotone" /><span>设置</span></button>
    </aside>
    <section className="professional__content">
      <header className="professional__topbar"><div><b>{editions[edition].label}</b><span>{editions[edition].subtitle}</span></div><div className="professional__date">{dateLabel}</div></header>
      <Page active={active} data={data} update={update} updateItem={updateItem} removeItem={removeItem} />
    </section>
    {settings && <SettingsPanel edition={edition} data={data} setData={setData} onClose={() => setSettings(false)} onSwitch={switchEdition} onExport={exportData} onImport={() => importRef.current?.click()} onReset={reset} />}
    <input ref={importRef} type="file" accept="application/json" hidden onChange={importData} />
    {toast && <div className="professional__toast" role="status">{toast}</div>}
  </main>
}

function PageHeader({ eyebrow, title, subtitle, action }) { return <header className="pro-page-header"><div><p>{eyebrow}</p><h1>{title}</h1><span>{subtitle}</span></div>{action}</header> }
function IconButton({ label, onClick, children }) { return <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick}>{children}</button> }
function AddForm({ fields, submitLabel = '添加', onAdd }) {
  const initial = useMemo(() => Object.fromEntries(fields.map((field) => [field.key, field.default ?? ''])), [fields])
  const [form, setForm] = useState(initial)
  const submit = (event) => { event.preventDefault(); if (!fields.some((field) => `${form[field.key]}`.trim())) return; onAdd({ id: uid(), ...form }); setForm(initial) }
  return <form className="pro-add-form" onSubmit={submit}>{fields.map((field) => <label key={field.key}>{field.label}<input type={field.type || 'text'} min={field.min} max={field.max} placeholder={field.placeholder} value={form[field.key]} onChange={(event) => setForm((old) => ({ ...old, [field.key]: field.type === 'number' ? Number(event.target.value) : event.target.value }))} /></label>)}<button type="submit"><Plus weight="bold" />{submitLabel}</button></form>
}
function TaskPanel({ tasks, update, title = '今日待办' }) {
  const [draft, setDraft] = useState('')
  const done = tasks.filter((item) => item.done).length
  const add = (event) => { event.preventDefault(); if (!draft.trim()) return; update([...tasks, { id: uid(), text: draft.trim(), done: false }]); setDraft('') }
  return <section className="pro-panel task-panel"><div className="panel-heading"><div><small>{title}</small><h2>{done}/{tasks.length} 已完成</h2></div><CheckCircle weight="fill" /></div><div className="task-list">{tasks.map((task) => <div className={task.done ? 'done' : ''} key={task.id}><button type="button" onClick={() => update(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}><span className="tick">{task.done && <Check weight="bold" />}</span>{task.text}</button><IconButton label="删除" onClick={() => update(tasks.filter((item) => item.id !== task.id))}><Trash /></IconButton></div>)}</div><form className="quick-add" onSubmit={add}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="添加一件真实要做的事…" /><button type="submit" aria-label="添加"><Plus /></button></form></section>
}
function Empty({ children }) { return <div className="empty-state">{children}</div> }
function Metric({ value, label, tone }) { return <article className={tone || ''}><strong>{value}</strong><span>{label}</span></article> }

function ExamEdition({ active, data, update, updateItem, removeItem }) {
  const total = data.practices.reduce((sum, item) => sum + Number(item.questions || 0), 0)
  const correct = data.practices.reduce((sum, item) => sum + Number(item.correct || 0), 0)
  if (active === 0) return <div className="edition-page exam-home"><div className="exam-hero"><div><p>下午好，{data.profile.name}</p><h1>今天也稳稳向前</h1><span>最近一场考试还有</span><strong>{daysUntil(data.countdowns[0]?.date)} <small>天</small></strong></div><Rabbit weight="duotone" /></div><div className="countdown-strip">{data.countdowns.map((item) => <label key={item.id}><span>{item.title}</span><b>{daysUntil(item.date)} 天</b><input type="date" value={item.date} onChange={(event) => updateItem('countdowns', item.id, { date: event.target.value })} /></label>)}</div><TaskPanel tasks={data.tasks} update={(items) => update('tasks', items)} title="今日学习清单" /><div className="metric-row"><Metric value={`${total}题`} label="累计刷题" /><Metric value={`${total ? Math.round(correct / total * 100) : 0}%`} label="综合正确率" /><Metric value={`${data.mistakes.filter((item) => !item.reviewed).length}题`} label="待二刷错题" /></div></div>
  if (active === 1) return <div className="edition-page"><PageHeader eyebrow="行测记录" title="每一次练习，都留下可比较的数据" subtitle="记录题量、正确数和用时，正确率自动计算。" /><AddForm fields={[{ key: 'category', label: '模块', placeholder: '资料分析' }, { key: 'questions', label: '题量', type: 'number', min: 1, default: 20 }, { key: 'correct', label: '正确', type: 'number', min: 0, default: 15 }, { key: 'minutes', label: '分钟', type: 'number', min: 1, default: 30 }]} onAdd={(item) => update('practices', (rows) => [{ ...item, date: today() }, ...rows])} /><section className="data-table"><div className="data-table__head"><span>模块</span><span>题量</span><span>正确率</span><span>用时</span><span></span></div>{data.practices.map((item) => <div key={item.id}><b>{item.category}</b><span>{item.questions}</span><span>{Math.round(item.correct / Math.max(1, item.questions) * 100)}%</span><span>{item.minutes} 分</span><IconButton label="删除记录" onClick={() => removeItem('practices', item.id)}><Trash /></IconButton></div>)}</section></div>
  if (active === 2) return <div className="edition-page"><PageHeader eyebrow="错题本" title="不只是收藏错题，而是完成二刷" subtitle="记录错因，点击状态完成复习。" /><AddForm fields={[{ key: 'category', label: '题型', placeholder: '判断推理' }, { key: 'title', label: '错题', placeholder: '位置规律' }, { key: 'reason', label: '错因', placeholder: '为什么会错' }]} onAdd={(item) => update('mistakes', (rows) => [{ ...item, reviewed: false }, ...rows])} /><div className="mistake-grid">{data.mistakes.map((item) => <article className={item.reviewed ? 'reviewed' : ''} key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.reason}</p><div><button type="button" onClick={() => updateItem('mistakes', item.id, { reviewed: !item.reviewed })}>{item.reviewed ? '已完成二刷' : '标记二刷完成'}</button><IconButton label="删除" onClick={() => removeItem('mistakes', item.id)}><Trash /></IconButton></div></article>)}</div></div>
  if (active === 3) return <div className="edition-page"><PageHeader eyebrow="申论写作" title="把素材积累变成限时作答" subtitle="保留题型、字数与完成日期。" /><AddForm fields={[{ key: 'title', label: '题目', placeholder: '基层治理' }, { key: 'type', label: '类型', placeholder: '大作文/小题' }, { key: 'words', label: '字数', type: 'number', min: 0, default: 800 }]} onAdd={(item) => update('essays', (rows) => [{ ...item, date: today() }, ...rows])} /><RecordCards rows={data.essays} titleKey="title" meta={(item) => `${item.type} · ${item.words} 字 · ${item.date}`} onDelete={(id) => removeItem('essays', id)} /></div>
  return <ExamInsights data={data} update={update} />
}

function ExamInsights({ data, update }) {
  const grouped = Object.values(data.practices.reduce((map, item) => { const row = map[item.category] || { category: item.category, q: 0, c: 0 }; row.q += Number(item.questions); row.c += Number(item.correct); map[item.category] = row; return map }, {}))
  return <div className="edition-page"><PageHeader eyebrow="学习数据" title="薄弱项从真实记录中生成" subtitle="不是写死的示例；新增练习后这里会自动变化。" /><div className="analytics-grid"><section className="pro-panel"><h2>模块正确率</h2>{grouped.length ? grouped.map((item) => <div className="bar-row" key={item.category}><span>{item.category}</span><progress value={item.c} max={Math.max(1, item.q)} /><b>{Math.round(item.c / Math.max(1, item.q) * 100)}%</b></div>) : <Empty>先在“行测记录”添加一次练习</Empty>}</section><section className="pro-panel"><h2>学习时长</h2><AddForm fields={[{ key: 'title', label: '内容', placeholder: '行测套卷' }, { key: 'minutes', label: '分钟', type: 'number', min: 1, default: 60 }]} onAdd={(item) => update('studyLogs', (rows) => [{ ...item, date: today() }, ...rows])} /><strong className="big-number">{data.studyLogs.reduce((sum, item) => sum + Number(item.minutes || 0), 0)}<small> 分钟</small></strong><RecordCards rows={data.studyLogs.slice(0, 4)} titleKey="title" meta={(item) => `${item.minutes} 分钟 · ${item.date}`} onDelete={(id) => update('studyLogs', (rows) => rows.filter((item) => item.id !== id))} /></section></div></div>
}

function TeacherEdition({ active, data, update, updateItem, removeItem }) {
  const average = Math.round(data.scores.reduce((sum, item) => sum + Number(item.score), 0) / Math.max(1, data.scores.length))
  if (active === 0) return <div className="edition-page teacher-home"><PageHeader eyebrow="高二（3）班 · 班主任工作台" title={`上午好，${data.profile.name}`} subtitle="把琐碎交给系统，把时间留给学生。" /><div className="metric-row"><Metric value={data.classSize || data.students.length} label="班级学生" /><Metric value={`${average}分`} label="当前成绩均分" /><Metric value={data.students.filter((item) => item.status === '需跟进').length} label="需要关注" tone="warning" /></div><TaskPanel tasks={data.tasks} update={(items) => update('tasks', items)} title="班级待办" /><section className="pro-panel attention-panel"><div className="panel-heading"><div><small>学生动态</small><h2>本周需要跟进</h2></div><WarningCircle weight="fill" /></div>{data.students.filter((item) => item.status !== '良好').map((item) => <div className="attention-row" key={item.id}><b>{item.name}</b><span>{item.tag}</span><em>{item.status}</em></div>)}</section></div>
  if (active === 1) return <div className="edition-page"><PageHeader eyebrow="学生管理" title="每一条关注，都能被修改和删除" subtitle="状态仅用于教师本人跟进，不做公开排名。" /><AddForm fields={[{ key: 'name', label: '姓名', placeholder: '学生姓名' }, { key: 'tag', label: '关注点', placeholder: '近期表现' }]} onAdd={(item) => update('students', (rows) => [{ ...item, status: '观察' }, ...rows])} /><section className="student-roster">{data.students.map((item) => <article key={item.id}><span className="student-avatar">{item.name.slice(-1)}</span><div><b>{item.name}</b><small>{item.tag}</small></div><button type="button" onClick={() => updateItem('students', item.id, { status: item.status === '良好' ? '观察' : item.status === '观察' ? '需跟进' : '良好' })}>{item.status}</button><IconButton label="删除学生" onClick={() => removeItem('students', item.id)}><Trash /></IconButton></article>)}</section></div>
  if (active === 2) return <div className="edition-page"><PageHeader eyebrow="成绩分析" title="录入成绩后，趋势即时计算" subtitle="支持按学生与学科记录，不再展示写死的数据。" /><AddForm fields={[{ key: 'name', label: '学生', placeholder: '姓名' }, { key: 'subject', label: '学科', placeholder: '数学' }, { key: 'score', label: '分数', type: 'number', min: 0, max: 150, default: 90 }]} onAdd={(item) => update('scores', (rows) => [{ ...item }, ...rows])} /><section className="score-board"><div className="score-summary"><strong>{average}</strong><span>当前平均分</span></div>{data.scores.map((item) => <div className="score-row" key={item.id}><b>{item.name}</b><span>{item.subject}</span><progress value={item.score} max="150" /><input aria-label={`${item.name}分数`} type="number" min="0" max="150" value={item.score} onChange={(event) => updateItem('scores', item.id, { score: Number(event.target.value) })} /><IconButton label="删除成绩" onClick={() => removeItem('scores', item.id)}><Trash /></IconButton></div>)}</section></div>
  if (active === 3) return <div className="edition-page"><PageHeader eyebrow="作业管理" title="发布、收集与补交放在一起" subtitle="直接修改提交人数，完成率自动更新。" /><AddForm fields={[{ key: 'title', label: '作业', placeholder: '周末练习' }, { key: 'submitted', label: '已交', type: 'number', min: 0, default: 0 }, { key: 'total', label: '总人数', type: 'number', min: 1, default: 42 }]} onAdd={(item) => update('assignments', (rows) => [{ ...item }, ...rows])} /><div className="assignment-grid">{data.assignments.map((item) => <article key={item.id}><div><b>{item.title}</b><span>{Math.round(item.submitted / Math.max(1, item.total) * 100)}%</span></div><progress value={item.submitted} max={Math.max(1, item.total)} /><label>已交 <input type="number" min="0" max={item.total} value={item.submitted} onChange={(event) => updateItem('assignments', item.id, { submitted: Number(event.target.value) })} /> / {item.total}</label><IconButton label="删除作业" onClick={() => removeItem('assignments', item.id)}><Trash /></IconButton></article>)}</div></div>
  if (active === 4) return <TeacherRecords data={data} update={update} removeItem={removeItem} />
  return <Seating data={data} update={update} />
}

function TeacherRecords({ data, update, removeItem }) {
  return <div className="edition-page"><PageHeader eyebrow="谈话与纪律" title="必要记录集中保存，随时可删" subtitle="不做永久标签，只为下一次跟进提供上下文。" /><div className="record-columns"><section><h2>谈话记录</h2><AddForm fields={[{ key: 'student', label: '学生', placeholder: '姓名' }, { key: 'summary', label: '摘要', placeholder: '沟通重点' }]} onAdd={(item) => update('conversations', (rows) => [{ ...item, date: today(), done: false }, ...rows])} /><RecordCards rows={data.conversations} titleKey="student" meta={(item) => `${item.summary} · ${item.date}`} onDelete={(id) => removeItem('conversations', id)} /></section><section><h2>纪律记录</h2><AddForm fields={[{ key: 'student', label: '学生', placeholder: '姓名' }, { key: 'summary', label: '情况', placeholder: '客观描述' }]} onAdd={(item) => update('discipline', (rows) => [{ ...item, date: today() }, ...rows])} /><RecordCards rows={data.discipline} titleKey="student" meta={(item) => `${item.summary} · ${item.date}`} onDelete={(id) => removeItem('discipline', id)} /></section></div></div>
}
function Seating({ data, update }) {
  const [selected, setSelected] = useState(null)
  const choose = (index) => { if (selected === null) { setSelected(index); return } const seats = [...data.seats]; [seats[selected], seats[index]] = [seats[index], seats[selected]]; update('seats', seats); setSelected(null) }
  return <div className="edition-page"><PageHeader eyebrow="排座位" title="点击两名学生即可交换座位" subtitle="第一排靠近讲台，座位变化会自动保存。" /><div className="teacher-desk">讲台</div><div className="seat-grid">{data.seats.map((name, index) => <button type="button" className={selected === index ? 'selected' : ''} onClick={() => choose(index)} key={`${name}-${index}`}><span>{index + 1}</span><b>{name}</b></button>)}</div></div>
}

function HuEdition({ active, data, update, updateItem, removeItem }) {
  if (active === 0) return <div className="edition-page hu-home"><PageHeader eyebrow="SUNDAY · ONE DAY AT A TIME" title={`慢慢生活，${data.profile.name}`} subtitle="今天的节奏，由你定义。" /><div className="hu-layout"><TaskPanel tasks={data.tasks} update={(items) => update('tasks', items)} title="每日计划" /><section className="hu-quote"><Star weight="fill" /><p>认真完成一个小动作，也是在把生活慢慢变成喜欢的样子。</p><span>今日给自己的话</span></section></div><div className="hu-glance"><button type="button"><Lightbulb /><span>灵感库</span><b>{data.ideas.length} 条</b></button><button type="button"><Kanban /><span>内容推进</span><b>{data.content.filter((item) => item.status < 2).length} 个</b></button><button type="button"><BookOpen /><span>本周学习</span><b>{data.learning.reduce((sum, item) => sum + Number(item.minutes), 0)} 分</b></button></div></div>
  if (active === 1) return <StageBoard eyebrow="灵感库" title="随手记下，再决定要不要做" subtitle="灵感可从收集推进到选题和完成。" rows={data.ideas} stages={['收集', '已选题', '已完成']} fields={[{ key: 'title', label: '灵感', placeholder: '突然想到的选题' }, { key: 'tag', label: '标签', placeholder: '生活/成长' }]} metaKey="tag" onAdd={(item) => update('ideas', (rows) => [{ ...item, status: 0 }, ...rows])} onAdvance={(item) => updateItem('ideas', item.id, { status: (item.status + 1) % 3 })} onDelete={(item) => removeItem('ideas', item.id)} />
  if (active === 2) return <StageBoard eyebrow="内容进度" title="从想法到发布，保留每一步" subtitle="点击状态推进，不再只是静态展示。" rows={data.content} stages={['待开始', '制作中', '已发布']} fields={[{ key: 'title', label: '内容', placeholder: '内容标题' }, { key: 'format', label: '形式', placeholder: '图文/视频' }]} metaKey="format" onAdd={(item) => update('content', (rows) => [{ ...item, status: 0 }, ...rows])} onAdvance={(item) => updateItem('content', item.id, { status: (item.status + 1) % 3 })} onDelete={(item) => removeItem('content', item.id)} />
  if (active === 3) return <div className="edition-page"><PageHeader eyebrow="内容复盘" title="只记录下一次真的会用到的结论" subtitle="指标、结论和作品绑定保存。" /><AddForm fields={[{ key: 'title', label: '作品', placeholder: '作品名称' }, { key: 'metric', label: '指标', placeholder: '收藏率 10%' }, { key: 'insight', label: '结论', placeholder: '下次怎么做' }]} onAdd={(item) => update('reviews', (rows) => [{ ...item }, ...rows])} /><div className="review-cards">{data.reviews.map((item) => <article key={item.id}><span>{item.metric}</span><h3>{item.title}</h3><p>{item.insight}</p><IconButton label="删除复盘" onClick={() => removeItem('reviews', item.id)}><Trash /></IconButton></article>)}</div></div>
  if (active === 4) return <SimpleChecklist title="备忘录" subtitle="随手写下，完成后勾选，也可以删除。" rows={data.memos} update={(rows) => update('memos', rows)} />
  return <div className="edition-page"><PageHeader eyebrow="长期学习" title="把喜欢的事，做得更久一点" subtitle="英语、小提琴、阅读都可以记录真实时长。" /><AddForm fields={[{ key: 'title', label: '学习内容', placeholder: '英语精听' }, { key: 'minutes', label: '分钟', type: 'number', min: 1, default: 30 }]} onAdd={(item) => update('learning', (rows) => [{ ...item, date: today() }, ...rows])} /><div className="learning-total"><ClockCountdown /><div><strong>{data.learning.reduce((sum, item) => sum + Number(item.minutes), 0)}</strong><span>累计投入分钟</span></div></div><RecordCards rows={data.learning} titleKey="title" meta={(item) => `${item.minutes} 分钟 · ${item.date}`} onDelete={(id) => removeItem('learning', id)} /></div>
}

function CreatorEdition({ active, data, update, updateItem, removeItem }) {
  if (active === 0) return <div className="edition-page creator-home"><PageHeader eyebrow="CREATOR OS" title={`让今天的推进看得见，${data.profile.name}`} subtitle="不靠灵感焦虑，靠清晰的下一步。" action={<div className="streak"><b>{data.pipeline.filter((item) => item.stage === 2).length}</b><span>已发布作品</span></div>} /><div className="creator-dashboard"><TaskPanel tasks={data.tasks} update={(items) => update('tasks', items)} title="今日推进" /><MiniPipeline data={data} updateItem={updateItem} /></div><div className="metric-row"><Metric value={data.pipeline.length} label="内容项目" /><Metric value={data.schedule.length} label="已安排档期" /><Metric value={data.reviews.reduce((sum, item) => sum + Number(item.saves || 0), 0)} label="累计收藏" /></div></div>
  if (active === 1) return <StageBoard eyebrow="内容管线" title="选题、制作、发布连续推进" subtitle="新增内容后直接进入待选题列，点击状态即可推进。" rows={data.pipeline} stages={['选题', '制作中', '已发布']} fields={[{ key: 'title', label: '选题', placeholder: '内容标题' }, { key: 'platform', label: '平台', placeholder: '小红书' }]} metaKey="platform" onAdd={(item) => update('pipeline', (rows) => [{ ...item, stage: 0 }, ...rows])} stageKey="stage" onAdvance={(item) => updateItem('pipeline', item.id, { stage: (item.stage + 1) % 3 })} onDelete={(item) => removeItem('pipeline', item.id)} />
  if (active === 2) return <div className="edition-page"><PageHeader eyebrow="发布档期" title="明确什么时候做、什么时候发" subtitle="时间可直接修改，刷新后仍会保留。" /><AddForm fields={[{ key: 'title', label: '事项', placeholder: '完成脚本' }, { key: 'date', label: '日期', type: 'date', default: today() }, { key: 'time', label: '时间', type: 'time', default: '10:00' }]} onAdd={(item) => update('schedule', (rows) => [...rows, item].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)))} /><div className="schedule-list">{data.schedule.map((item) => <article key={item.id}><CalendarBlank weight="duotone" /><input aria-label="日期" type="date" value={item.date} onChange={(event) => updateItem('schedule', item.id, { date: event.target.value })} /><input aria-label="时间" type="time" value={item.time} onChange={(event) => updateItem('schedule', item.id, { time: event.target.value })} /><b>{item.title}</b><IconButton label="删除档期" onClick={() => removeItem('schedule', item.id)}><Trash /></IconButton></article>)}</div></div>
  if (active === 3) return <div className="edition-page"><PageHeader eyebrow="复盘实验室" title="让数据变成下一条内容的动作" subtitle="记录播放、收藏和一句可复用结论。" /><AddForm fields={[{ key: 'title', label: '作品', placeholder: '作品标题' }, { key: 'views', label: '播放', type: 'number', min: 0, default: 0 }, { key: 'saves', label: '收藏', type: 'number', min: 0, default: 0 }, { key: 'insight', label: '结论', placeholder: '下次继续/停止什么' }]} onAdd={(item) => update('reviews', (rows) => [{ ...item }, ...rows])} /><div className="review-cards creator-reviews">{data.reviews.map((item) => <article key={item.id}><span>{item.views} 播放 · {item.saves} 收藏</span><h3>{item.title}</h3><p>{item.insight}</p><IconButton label="删除复盘" onClick={() => removeItem('reviews', item.id)}><Trash /></IconButton></article>)}</div></div>
  return <div className="edition-page"><PageHeader eyebrow="阶段目标" title="把大目标拆成今天能推进的数字" subtitle="目标和当前进度都可以直接调整。" /><AddForm fields={[{ key: 'title', label: '目标', placeholder: '发布 12 条内容' }, { key: 'current', label: '当前', type: 'number', min: 0, default: 0 }, { key: 'target', label: '目标值', type: 'number', min: 1, default: 10 }]} onAdd={(item) => update('okrs', (rows) => [...rows, item])} /><div className="okr-list">{data.okrs.map((item) => <article key={item.id}><div><h3>{item.title}</h3><span>{item.current} / {item.target}</span></div><progress value={item.current} max={Math.max(1, item.target)} /><div className="okr-actions"><button type="button" onClick={() => updateItem('okrs', item.id, { current: Math.max(0, Number(item.current) - 1) })}>−1</button><button type="button" onClick={() => updateItem('okrs', item.id, { current: Number(item.current) + 1 })}>+1</button><IconButton label="删除目标" onClick={() => removeItem('okrs', item.id)}><Trash /></IconButton></div></article>)}</div></div>
}

function MiniPipeline({ data, updateItem }) { return <section className="pro-panel mini-pipeline"><div className="panel-heading"><div><small>内容管线</small><h2>点击推进状态</h2></div><Kanban weight="fill" /></div>{data.pipeline.slice(0, 5).map((item) => <button type="button" key={item.id} onClick={() => updateItem('pipeline', item.id, { stage: (item.stage + 1) % 3 })}><span>{['选题', '制作中', '已发布'][item.stage]}</span><b>{item.title}</b><small>{item.platform}</small></button>)}</section> }
function StageBoard({ eyebrow, title, subtitle, rows, stages, fields, metaKey, stageKey = 'status', onAdd, onAdvance, onDelete }) { return <div className="edition-page"><PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} /><AddForm fields={fields} onAdd={onAdd} /><div className="stage-board">{stages.map((stage, index) => <section key={stage}><header><b>{stage}</b><span>{rows.filter((item) => item[stageKey] === index).length}</span></header>{rows.filter((item) => item[stageKey] === index).map((item) => <article key={item.id}><small>{item[metaKey]}</small><h3>{item.title}</h3><div><button type="button" onClick={() => onAdvance(item)}>{index === stages.length - 1 ? '重新开始' : `推进到${stages[index + 1]}`}</button><IconButton label="删除" onClick={() => onDelete(item)}><Trash /></IconButton></div></article>)}{!rows.some((item) => item[stageKey] === index) && <Empty>暂无内容</Empty>}</section>)}</div></div> }
function SimpleChecklist({ title, subtitle, rows, update }) { const [draft, setDraft] = useState(''); const add = (event) => { event.preventDefault(); if (!draft.trim()) return; update([{ id: uid(), text: draft.trim(), done: false }, ...rows]); setDraft('') }; return <div className="edition-page"><PageHeader eyebrow="随手记录" title={title} subtitle={subtitle} /><form className="memo-add" onSubmit={add}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="写下一件不想忘记的事…" /><button type="submit"><Plus />添加</button></form><div className="memo-list">{rows.map((item) => <article className={item.done ? 'done' : ''} key={item.id}><button type="button" onClick={() => update(rows.map((row) => row.id === item.id ? { ...row, done: !row.done } : row))}><span className="tick">{item.done && <Check />}</span>{item.text}</button><IconButton label="删除" onClick={() => update(rows.filter((row) => row.id !== item.id))}><Trash /></IconButton></article>)}</div></div> }
function RecordCards({ rows, titleKey, meta, onDelete }) { return <div className="record-cards">{rows.map((item) => <article key={item.id}><div><b>{item[titleKey]}</b><span>{meta(item)}</span></div><IconButton label="删除" onClick={() => onDelete(item.id)}><Trash /></IconButton></article>)}</div> }

function SettingsPanel({ edition, data, setData, onClose, onSwitch, onExport, onImport, onReset }) {
  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="settings-panel" role="dialog" aria-modal="true" aria-label="专业版设置"><header><div><small>OneBench</small><h2>设置</h2></div><IconButton label="关闭设置" onClick={onClose}><X /></IconButton></header><div className="settings-section"><h3>个人资料与显示</h3><label>工作台称呼<input value={data.profile?.name || ''} onChange={(event) => setData((old) => ({ ...old, profile: { ...old.profile, name: event.target.value } }))} /></label>{edition === 'teacher' && <label>班级人数<input type="number" min="1" max="100" value={data.classSize || 42} onChange={(event) => setData((old) => ({ ...old, classSize: Number(event.target.value) }))} /></label>}<label className="switch-row"><span><b>紧凑布局</b><small>在一屏显示更多内容</small></span><input type="checkbox" checked={Boolean(data.profile?.compact)} onChange={(event) => setData((old) => ({ ...old, profile: { ...old.profile, compact: event.target.checked } }))} /></label></div><div className="settings-section"><h3>切换工作台版本</h3><p>每个版本的数据独立保存，切换不会丢失。</p><div className="edition-settings-grid"><button type="button" onClick={() => onSwitch('basic')}><House /><span><b>基础版</b><small>通用模块与模块市场</small></span></button>{Object.entries(editions).map(([key, item]) => { const Icon = item.icon; return <button type="button" className={edition === key ? 'selected' : ''} key={key} onClick={() => onSwitch(key)}><Icon /><span><b>{item.label}</b><small>{item.subtitle}</small></span>{edition === key && <CheckCircle weight="fill" />}</button> })}</div></div><div className="settings-section"><h3>本地数据</h3><p>内容默认只保存在这台设备的浏览器中。</p><div className="settings-actions"><button type="button" onClick={onExport}><DownloadSimple />导出备份</button><button type="button" onClick={onImport}><UploadSimple />导入备份</button><button type="button" className="danger" onClick={onReset}><ArrowCounterClockwise />恢复示例</button></div></div></section></div>
}
