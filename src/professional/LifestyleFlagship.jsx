import { useState } from 'react'
import {
  Archive, ArrowClockwise, ArrowRight, CalendarBlank, ChartLineUp,
  Check, CheckCircle, CloudCheck, Fire, GearSix, Globe, House, Lightbulb,
  LinkSimple, List, ListChecks, MagnifyingGlass, MusicNotes, NotePencil, PencilSimple,
  Play, Plus, Sparkle, Star, Trash, UserCircle, VideoCamera, X,
} from '@phosphor-icons/react'
import './lifestyle-flagship.css'

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const today = () => new Date().toISOString().slice(0, 10)

const navItems = [
  { label: '每日计划', hint: '安排今天', icon: ListChecks },
  { label: '选题每日灵感', hint: '每天 09:00 更新', icon: Lightbulb },
  { label: '热点视频 / 二创', hint: '发现并转化', icon: Fire },
  { label: '内容复盘', hint: '用数据改进', icon: ChartLineUp },
  { label: '备忘录', hint: '不让想法溜走', icon: NotePencil },
  { label: '小提琴练习', hint: '阶段化进阶', icon: MusicNotes },
  { label: '英语学习', hint: '精听与表达', icon: Globe },
]

const violinStages = [
  { title: '准备与空弦运弓', goal: '让身体保持放松，四根空弦都能拉出干净、均匀的声音。', passCriteria: '连续拉完四根弦时，声音稳定、节奏不过快，肩颈没有明显紧张。', resource: '小提琴 空弦 运弓 入门' },
  { title: '一指与音阶入门', goal: '建立左手落点感，能在慢速下完成一组音阶。', passCriteria: '每个音高可辨、节拍稳定，并能听出需要重练的小节。', resource: '小提琴 一指 D大调 音阶 初学' },
  { title: '换弦与节奏', goal: '在换弦时保持右手稳定，让乐句不断开。', passCriteria: '四小节练习能跟上节拍器，换弦没有明显噪音。', resource: '小提琴 换弦 节拍器 基础' },
  { title: '连弓与乐句', goal: '控制弓速与音量，开始表达一句完整旋律。', passCriteria: '连弓中声音连续，能完成渐强或渐弱的一次变化。', resource: '小提琴 连弓 音色 乐句' },
  { title: '完整片段演奏', goal: '把基础动作放进一段作品，形成自己的演奏记录。', passCriteria: '能完整演奏一段小品，并从录音中写下一条具体改进。', resource: '小提琴 初学者 完整曲目 练习' },
]

function pageDate() {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

export function LifestyleFlagship({ active, data, onNavigate, onOpenSettings, update, updateItem, removeItem, showToast }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const ActiveIcon = navItems[active]?.icon || House

  const navigate = (index) => {
    onNavigate(index)
    setDrawerOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <main className={`lifestyle-flagship lifestyle-flagship--${data.profile?.theme || 'forest'}`}>
    <header className="lf-topbar">
      <button className="lf-square-button" type="button" aria-label="打开模块导航" onClick={() => setDrawerOpen(true)}><List weight="bold" /></button>
      <div className="lf-topbar__title"><ActiveIcon weight="duotone" /><b>{navItems[active]?.label || '每日计划'}</b></div>
      <time>{pageDate()}</time>
    </header>

    <div className="lf-app-stage">
      {active === 0 && <DailyPlan data={data} update={update} updateItem={updateItem} removeItem={removeItem} />}
      {active === 1 && <IdeaFeed data={data} update={update} updateItem={updateItem} showToast={showToast} onNavigate={navigate} />}
      {active === 2 && <TrendFeed data={data} update={update} updateItem={updateItem} showToast={showToast} onNavigate={navigate} />}
      {active === 3 && <ReviewLab data={data} update={update} updateItem={updateItem} removeItem={removeItem} />}
      {active === 4 && <MemoBook data={data} update={update} updateItem={updateItem} removeItem={removeItem} />}
      {active === 5 && <ViolinJourney data={data} update={update} updateItem={updateItem} removeItem={removeItem} showToast={showToast} />}
      {active === 6 && <PracticePage kind="english" data={data} update={update} updateItem={updateItem} removeItem={removeItem} />}
    </div>

    <nav className="lf-desktop-dock" aria-label="快速模块导航">
      {navItems.map(({ label, icon: Icon }, index) => <button type="button" className={active === index ? 'is-active' : ''} onClick={() => navigate(index)} key={label}><Icon weight={active === index ? 'fill' : 'regular'} /><span>{label}</span></button>)}
      <button type="button" onClick={onOpenSettings}><GearSix /><span>设置</span></button>
    </nav>

    {drawerOpen && <div className="lf-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDrawerOpen(false)}>
      <aside className="lf-drawer" role="dialog" aria-modal="true" aria-label="生活创作旗舰版模块导航">
        <header>
          <div className="lf-profile-mark">{data.profile?.avatar ? <img src={data.profile.avatar} alt="个人头像" /> : <UserCircle weight="fill" />}</div>
          <div><strong>{data.profile?.name || '我的工作台'}</strong><span>{data.profile?.role || '创作与生活练习者'}</span></div>
          <button className="lf-square-button" type="button" aria-label="关闭导航" onClick={() => setDrawerOpen(false)}><X /></button>
        </header>
        <div className="lf-drawer__rule" />
        <nav>{navItems.map(({ label, hint, icon: Icon }, index) => <button type="button" className={active === index ? 'is-active' : ''} onClick={() => navigate(index)} key={label}><Icon weight={active === index ? 'fill' : 'regular'} /><span><b>{label}</b><small>{hint}</small></span><ArrowRight /></button>)}</nav>
        <footer>
          <div className="lf-sync-state"><CloudCheck weight="fill" /><span><b>本地已自动保存</b><small>{data.profile?.status || '稳定更新中'} · 灵感每日 09:00 更新</small></span></div>
          <button type="button" onClick={() => { setDrawerOpen(false); onOpenSettings() }}><GearSix /><span>设置、备份与版本切换</span><ArrowRight /></button>
          <p>灵感来自公开工作台案例 · OneBench 原创实现</p>
        </footer>
      </aside>
    </div>}
  </main>
}

function DailyPlan({ data, update, updateItem, removeItem }) {
  const all = [...data.tasks, ...(data.creativeTasks || [])]
  const completed = all.filter((item) => item.done).length
  const rate = all.length ? Math.round(completed / all.length * 100) : 0

  return <div className="lf-page lf-daily-page">
    <section className="lf-metric-grid" aria-label="今日完成情况">
      <article><strong>{all.length - completed}</strong><span>待完成</span></article>
      <article><strong>{rate}%</strong><span>完成率</span></article>
    </section>
    <TaskSection title="个人日常" subtitle="普拉提 / 小提琴 / 英语，循环不动的日课。" rows={data.tasks} onAdd={(item) => update('tasks', (rows) => [...rows, item])} onUpdate={(id, patch) => updateItem('tasks', id, patch)} onDelete={(id) => removeItem('tasks', id)} />
    <TaskSection title="创作任务" subtitle="内容拍摄、运营、复盘，来自灵感与热点的下一步。" rows={data.creativeTasks || []} onAdd={(item) => update('creativeTasks', (rows) => [...rows, item])} onUpdate={(id, patch) => updateItem('creativeTasks', id, patch)} onDelete={(id) => removeItem('creativeTasks', id)} empty="今天没有创作任务，去每日灵感挑一个吧。" />
    <details className="lf-history-card"><summary><span><CalendarBlank weight="duotone" /><b>今日记录</b></span><span>{completed} 项完成 <ArrowRight /></span></summary><p>{today()} · 工作台已自动保存。关闭页面后再次打开，任务状态仍会保留。</p></details>
  </div>
}

function TaskSection({ title, subtitle, rows, onAdd, onUpdate, onDelete, empty }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    onAdd({ id: uid(), text: draft.trim(), note: title === '个人日常' ? '每日必做' : '今日任务', done: false })
    setDraft('')
    setAdding(false)
  }
  const edit = (item) => {
    const text = window.prompt('修改任务', item.text)
    if (text?.trim()) onUpdate(item.id, { text: text.trim() })
  }

  return <section className="lf-card lf-task-section">
    <header><div><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={() => setAdding((value) => !value)}><Plus weight="bold" />新增</button></header>
    {adding && <form className="lf-inline-form" onSubmit={submit}><input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="写下一件今天要做的事" /><button type="submit">保存</button></form>}
    <div className="lf-task-list">
      {rows.map((item) => <article className={item.done ? 'is-done' : ''} key={item.id}>
        <button className="lf-check" type="button" aria-label={item.done ? '标记未完成' : '标记完成'} onClick={() => onUpdate(item.id, { done: !item.done })}>{item.done && <Check weight="bold" />}</button>
        <button className="lf-task-copy" type="button" aria-label={`编辑任务：${item.text}`} onClick={() => edit(item)}><b>{item.text}</b><span>{item.note || '今日任务'}</span></button>
        <button className="lf-icon-quiet" type="button" aria-label="编辑任务" onClick={() => edit(item)}><PencilSimple /></button>
        <button className="lf-icon-quiet" type="button" aria-label="删除任务" onClick={() => onDelete(item.id)}><X /></button>
      </article>)}
      {!rows.length && <div className="lf-empty"><Sparkle /><span>{empty || '还没有任务，新增一条开始今天。'}</span></div>}
    </div>
  </section>
}

function IdeaFeed({ data, update, updateItem, showToast, onNavigate }) {
  const refresh = () => {
    update('ideas', (rows) => rows.length > 1 ? [...rows.slice(1), rows[0]] : rows)
    update('lastIdeaRefresh', new Date().toLocaleString('zh-CN'))
    showToast('已换一批灵感')
  }
  const addTask = (item) => {
    if (!(data.creativeTasks || []).some((task) => task.sourceId === item.id)) update('creativeTasks', (rows) => [...rows, { id: uid(), sourceId: item.id, text: `把「${item.title}」做成内容`, note: '来自每日灵感', done: false }])
    updateItem('ideas', item.id, { taskAdded: true })
    showToast('已加入创作任务')
  }

  return <div className="lf-page">
    <section className="lf-source-card">
      <header><div><Lightbulb weight="fill" /><b>每日灵感来源</b></div><span>{data.lastIdeaRefresh || `${today()} 示例更新`} · 共 {data.ideas.length} 条</span></header>
      <p>每天给你一组能立刻改成内容的方向。默认使用本地示例；联网内容接入后会显示来源与更新时间，离线时仍保留上一批。</p>
      <button type="button" onClick={refresh}><ArrowClockwise />立即刷新灵感</button>
    </section>
    <div className="lf-reference-feed">{data.ideas.map((item, index) => <article className="lf-reference-idea" key={item.id}>
      <header><h2><span>{index + 1}.</span>{item.title}</h2><small>{item.tag || '灵感'}</small></header>
      <p>{item.summary || '把这条灵感拆成一个可以在今天完成的小动作。'}</p>
      <div className="lf-reference-actions">
        <button type="button" onClick={() => window.open(`https://www.douyin.com/search/${encodeURIComponent(item.title)}`, '_blank', 'noopener')}><Play weight="fill" />看抖音相关视频</button>
        <button type="button" onClick={() => window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(item.title)}`, '_blank', 'noopener')}><Play />B站相关</button>
        <button className="lf-subtle-action" type="button" onClick={() => updateItem('ideas', item.id, { saved: !item.saved })}><Star weight={item.saved ? 'fill' : 'regular'} />{item.saved ? '已存' : '收藏'}</button>
        <button className={item.taskAdded ? 'is-success' : 'lf-subtle-action'} type="button" onClick={() => addTask(item)}><Plus />{item.taskAdded ? '已加入' : '加入任务'}</button>
      </div>
    </article>)}</div>
    <button className="lf-bottom-route" type="button" onClick={() => onNavigate(0)}><ListChecks /><span><b>查看今天的创作任务</b><small>灵感加入后会出现在每日计划</small></span><ArrowRight /></button>
  </div>
}

function TrendFeed({ data, update, updateItem, showToast, onNavigate }) {
  const [tab, setTab] = useState('challenge')
  const [filter, setFilter] = useState('全部')
  const categories = ['全部', '搞笑', '化妆', '服装', '唱歌', '弹琴', '思考', ...new Set((data.trends || []).map((item) => item.category))]
  const filtered = filter === '全部' ? data.trends : data.trends.filter((item) => item.category === filter)

  const addTask = (item) => {
    if (!(data.creativeTasks || []).some((task) => task.sourceId === item.id)) update('creativeTasks', (rows) => [...rows, { id: uid(), sourceId: item.id, text: item.remix, note: '来自热点二创', done: false }])
    updateItem('trends', item.id, { taskAdded: true })
    showToast('二创方案已加入任务')
  }
  const saveIdea = (item) => {
    if (!data.ideas.some((idea) => idea.sourceId === item.id)) update('ideas', (rows) => [{ id: uid(), sourceId: item.id, title: item.title, tag: item.category, summary: item.remix, saved: true, taskAdded: false }, ...rows])
    updateItem('trends', item.id, { saved: true })
    showToast('已保存到灵感库')
  }
  const next = () => {
    update('trends', (rows) => rows.length > 1 ? [...rows.slice(1), rows[0]] : rows)
    update('lastTrendRefresh', new Date().toLocaleString('zh-CN'))
    showToast('已换下一个热点')
  }

  return <div className="lf-page">
    <section className="lf-trend-lead">
      <div className="lf-trend-tabs"><button type="button" className={tab === 'hot' ? 'is-active' : ''} onClick={() => setTab('hot')}><Fire weight="fill" />热榜</button><button type="button" className={tab === 'challenge' ? 'is-active' : ''} onClick={() => setTab('challenge')}><Star weight="fill" />挑战榜 · 可二创</button></div>
      <h1>{tab === 'challenge' ? '挑战榜 · 跟我拍就能二创' : '热榜 · 找到可以转化的内容'}</h1>
      <p>{tab === 'challenge' ? '挑出能直接参与或改编的挑战，先理解为什么值得拍，再把它变成自己的动作。' : '热榜只作灵感入口，不承诺实时数据；切换到挑战榜可以直接生成二创任务。'}</p>
      <FilterPills values={[...new Set(categories)]} value={filter} onChange={setFilter} />
      <button className="lf-refresh-outline" type="button" onClick={next}><ArrowClockwise />立即刷新{tab === 'challenge' ? '挑战榜' : '热榜'}</button>
    </section>
    <div className="lf-feed-list">{filtered.map((item) => <article className="lf-trend-card" key={item.id}>
      <header><div><h2>{item.title}</h2><small>{item.category}</small></div><span><Star weight="fill" />{item.publishedAt || '本地示例'} · {item.heat}</span></header>
      <dl><div><dt>为什么适合你二创</dt><dd>{item.why}</dd></div><div className="lf-remix-plan"><dt>改编角度</dt><dd>{item.remix}</dd></div></dl>
      <small className="lf-trend-source">来源：{item.source || `${item.platform} 搜索结果`} · 点击外链前请自行核验</small>
      <div className="lf-trend-note"><VideoCamera weight="fill" /><span>{item.note || '用自己的真实过程替换模仿，保留一个清楚的反差点。'}</span></div>
      <div className="lf-reference-actions">
        <button type="button" onClick={() => window.open(`https://www.douyin.com/search/${encodeURIComponent(item.title)}`, '_blank', 'noopener')}><LinkSimple />去抖音查看 / 参与挑战</button>
        <button className={item.taskAdded ? 'is-success' : ''} type="button" onClick={() => addTask(item)}><Plus />{item.taskAdded ? '已加入任务' : '加入任务'}</button>
        <button className="lf-subtle-action" type="button" onClick={() => saveIdea(item)}><Star weight={item.saved ? 'fill' : 'regular'} />{item.saved ? '已存为灵感' : '存为灵感'}</button>
        <button className="lf-subtle-action" type="button" onClick={next}><ArrowClockwise />换视频</button>
      </div>
    </article>)}</div>
    <button className="lf-bottom-route" type="button" onClick={() => onNavigate(1)}><Lightbulb /><span><b>回到每日灵感</b><small>查看刚刚收藏的热点方向</small></span><ArrowRight /></button>
  </div>
}

function ReviewLab({ data, update, updateItem, removeItem }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', channel: '小红书', views: 0, likes: 0, saves: 0, insight: '', next: '' })
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    update('reviews', (rows) => [{ id: uid(), ...form, date: today() }, ...rows])
    setForm({ title: '', channel: '小红书', views: 0, likes: 0, saves: 0, insight: '', next: '' })
    setAdding(false)
  }

  return <div className="lf-page">
    <PageIntro kicker="REVIEW TO GROW" title="内容复盘" copy="把作品数据、判断和下一次动作绑在一起；复盘的终点是下一条内容。" action={<button className="lf-primary-action" type="button" onClick={() => setAdding((value) => !value)}><Plus />新增复盘</button>} />
    {adding && <form className="lf-form-card" onSubmit={submit}>
      <label>作品名称<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="输入作品标题" /></label>
      <label>平台<input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} /></label>
      <div className="lf-form-grid"><label>播放<input type="number" min="0" value={form.views} onChange={(event) => setForm({ ...form, views: Number(event.target.value) })} /></label><label>点赞<input type="number" min="0" value={form.likes} onChange={(event) => setForm({ ...form, likes: Number(event.target.value) })} /></label><label>收藏<input type="number" min="0" value={form.saves} onChange={(event) => setForm({ ...form, saves: Number(event.target.value) })} /></label></div>
      <label>这次学到了什么<textarea value={form.insight} onChange={(event) => setForm({ ...form, insight: event.target.value })} placeholder="保留一个可复用结论" /></label>
      <label>下一条具体怎么改<textarea value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} placeholder="写成一个可以执行的动作" /></label>
      <button type="submit">保存复盘</button>
    </form>}
    <div className="lf-review-list">{data.reviews.map((item) => {
      const saveRate = Number(item.views) ? (Number(item.saves || 0) / Number(item.views) * 100).toFixed(1) : '0.0'
      return <article className="lf-card" key={item.id}>
        <header><div><small>{item.channel || '内容'} · {item.date || today()}</small><h2>{item.title}</h2></div><button className="lf-icon-quiet" type="button" aria-label="删除复盘" onClick={() => removeItem('reviews', item.id)}><Trash /></button></header>
        <div className="lf-review-metrics"><label><span>播放</span><input type="number" min="0" value={item.views || 0} onChange={(event) => updateItem('reviews', item.id, { views: Number(event.target.value) })} /></label><label><span>点赞</span><input type="number" min="0" value={item.likes || 0} onChange={(event) => updateItem('reviews', item.id, { likes: Number(event.target.value) })} /></label><label><span>收藏</span><input type="number" min="0" value={item.saves || 0} onChange={(event) => updateItem('reviews', item.id, { saves: Number(event.target.value) })} /></label><div><span>收藏率</span><strong>{saveRate}%</strong></div></div>
        <div className="lf-review-note"><b>有效结论</b><p>{item.insight || '还没有写结论。'}</p><button type="button" onClick={() => { const insight = window.prompt('修改有效结论', item.insight || ''); if (insight?.trim()) updateItem('reviews', item.id, { insight: insight.trim() }) }}><PencilSimple />编辑</button></div>
        <div className="lf-review-note is-next"><b>下一步动作</b><p>{item.next || '点击编辑补充下一条要改的动作。'}</p><button type="button" onClick={() => { const next = window.prompt('修改下一步动作', item.next || ''); if (next?.trim()) updateItem('reviews', item.id, { next: next.trim() }) }}><PencilSimple />编辑</button></div>
      </article>
    })}</div>
  </div>
}

function MemoBook({ data, update, updateItem, removeItem }) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState('生活')
  const visible = data.memos.filter((item) => !item.archived && (!query.trim() || `${item.text}${item.tag}`.toLowerCase().includes(query.trim().toLowerCase())))
  const add = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    update('memos', (rows) => [{ id: uid(), text: draft.trim(), tag: tag.trim() || '未分类', done: false, archived: false }, ...rows])
    setDraft('')
  }

  return <div className="lf-page">
    <PageIntro kicker="MEMO BOOK" title="备忘录" copy="记录、搜索、完成和归档都在这里。任何一条都可以随时修改或删除。" />
    <form className="lf-memo-compose" onSubmit={add}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="写下一件不想忘记的事" /><input className="lf-tag-input" value={tag} onChange={(event) => setTag(event.target.value)} aria-label="标签" /><button type="submit"><Plus />添加</button></form>
    <label className="lf-search"><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索备忘录或标签" /></label>
    <div className="lf-memo-list">{visible.map((item) => <article className={item.done ? 'is-done' : ''} key={item.id}>
      <button className="lf-check" type="button" aria-label={item.done ? '标记备忘未完成' : '标记备忘完成'} onClick={() => updateItem('memos', item.id, { done: !item.done })}>{item.done && <Check />}</button>
      <button className="lf-memo-copy" type="button" onClick={() => { const text = window.prompt('修改备忘录', item.text); if (text?.trim()) updateItem('memos', item.id, { text: text.trim() }) }}><b>{item.text}</b><span>{item.tag || '未分类'}</span></button>
      <button className="lf-icon-quiet" type="button" aria-label="归档" onClick={() => updateItem('memos', item.id, { archived: true })}><Archive /></button>
      <button className="lf-icon-quiet" type="button" aria-label="删除" onClick={() => removeItem('memos', item.id)}><Trash /></button>
    </article>)}</div>
    {!visible.length && <div className="lf-empty lf-empty--large"><NotePencil /><span>没有匹配的备忘录</span></div>}
  </div>
}

const practiceConfig = {
  english: {
    key: 'englishPractice', kicker: 'ENGLISH LEARNING', title: '英语学习 · 精听路线', icon: Globe,
    intro: '用精听、跟读和表达整理形成闭环，不只累计一个学习时长。',
    stage: '第 1 阶段 · 听清与复述', goal: '可以听清主旨，跟读关键句，并用自己的话复述今天的内容。',
    resource: 'BBC 6 minute English 精听',
  },
}

function ViolinJourney({ data, update, updateItem, removeItem, showToast }) {
  const [detail, setDetail] = useState(false)
  const progress = data.violinProgress || { activeStage: 0, masteredStages: [] }
  const activeStage = Math.min(Math.max(0, Number(progress.activeStage || 0)), violinStages.length - 1)
  const stage = violinStages[activeStage]
  const rows = (data.violinPractice || []).filter((item) => Number(item.stage || 0) === activeStage)
  const done = rows.filter((item) => item.done).length
  const allDone = rows.length > 0 && done === rows.length
  const masteredCount = (progress.masteredStages || []).length
  const minutes = rows.filter((item) => item.done).reduce((sum, item) => sum + Number(item.minutes || 0), 0)

  const reset = () => {
    if (!window.confirm('重置小提琴进度？已勾选的练习会恢复为未完成。')) return
    update('violinProgress', { activeStage: 0, masteredStages: [] })
    update('violinPractice', (items) => items.map((item) => ({ ...item, done: false })))
    setDetail(false)
    showToast('已重置到第 1 阶段')
  }
  const masterStage = () => {
    if (!allDone) { showToast('先完成本阶段的全部练习，再标记掌握'); return }
    const masteredStages = [...new Set([...(progress.masteredStages || []), activeStage])]
    const nextStage = Math.min(activeStage + 1, violinStages.length - 1)
    update('violinProgress', { activeStage: nextStage, masteredStages })
    setDetail(false)
    showToast(activeStage === violinStages.length - 1 ? '五个阶段已全部掌握' : `已解锁第 ${nextStage + 1} 阶段`)
  }

  if (detail) return <div className="lf-page lf-violin-detail-page">
    <button className="lf-back-button" type="button" onClick={() => setDetail(false)}><ArrowRight />返回进阶路线</button>
    <section className="lf-stage-detail">
      <header><div><small>第 {activeStage + 1} 阶段</small><h1>{stage.title}</h1></div><span>{allDone ? '已达标' : '进行中'}</span></header>
      <section><b>目标</b><p>{stage.goal}</p></section>
      <section><b>过关标准</b><p>{stage.passCriteria}</p></section>
      <div className="lf-stage-resource-list">{rows.slice(1).map((item) => <article key={item.id}>
        <h2>{item.title}</h2><p>{item.detail || '跟着分步练习，完成后再进入下一项。'}</p>
        <div className="lf-reference-actions"><button type="button" onClick={() => window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(`${stage.resource} ${item.title}`)}`, '_blank', 'noopener')}><Play weight="fill" />看教学视频</button><button className="lf-subtle-action" type="button" onClick={() => window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(item.title)}`, '_blank', 'noopener')}>B站搜更多</button><button className="lf-subtle-action" type="button" onClick={() => window.open(`https://www.douyin.com/search/${encodeURIComponent(item.title)}`, '_blank', 'noopener')}>抖音跟练</button></div>
      </article>)}</div>
      <button className={`lf-master-stage ${allDone ? '' : 'is-disabled'}`} type="button" onClick={masterStage}><CheckCircle weight="fill" />{allDone ? '标记掌握（已达到过关标准）' : `完成全部练习后可标记掌握（${done}/${rows.length}）`}</button>
    </section>
  </div>

  return <div className="lf-page lf-violin-overview-page">
    <section className="lf-violin-overview">
      <header><MusicNotes weight="fill" /><div><h1>小提琴练习 · 进阶路线</h1><p>从空弦运弓到完整演奏，共 5 个阶段。每一阶段都有可搜索的教学资源，练到过关标准再解锁下一阶段。</p></div></header>
      <div className="lf-progress-track"><span style={{ width: `${masteredCount / violinStages.length * 100}%` }} /></div>
      <div className="lf-stage-summary"><b>已掌握 {masteredCount}/{violinStages.length} 阶段</b><span>当前：第 {activeStage + 1} 阶段 · {stage.title}</span></div>
      <div><button className="lf-refresh-outline" type="button" onClick={reset}><ArrowClockwise />重置进度</button><button className="lf-primary-action" type="button" onClick={() => setDetail(true)}>查看本阶段详情<ArrowRight /></button></div>
    </section>
    <section className="lf-card lf-reference-practice">
      <header><div><small>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</small><h2>今日练习</h2><p>第 {activeStage + 1} 阶段 · {stage.title}：每天投入 {rows.reduce((sum, item) => sum + Number(item.minutes || 0), 0)} 分钟，逐项完成。</p></div><b>{done}/{rows.length}</b></header>
      <div className="lf-practice-list">{rows.map((item) => <article className={item.done ? 'is-done' : ''} key={item.id}>
        <button className="lf-check" type="button" aria-label={item.done ? '标记练习未完成' : '标记练习完成'} onClick={() => updateItem('violinPractice', item.id, { done: !item.done })}>{item.done && <Check />}</button>
        <button className="lf-practice-copy" type="button" aria-label={`编辑练习：${item.title}`} onClick={() => { const title = window.prompt('修改练习内容', item.title); if (title?.trim()) updateItem('violinPractice', item.id, { title: title.trim() }) }}><b>{item.title}</b><span>{item.detail || `${item.minutes} 分钟练习`}</span></button>
        <button className="lf-icon-quiet" type="button" aria-label="删除练习" onClick={() => removeItem('violinPractice', item.id)}><Trash /></button>
      </article>)}</div>
      <footer><span>本阶段已投入 {minutes} 分钟</span><button type="button" onClick={() => setDetail(true)}>查看过关标准<ArrowRight /></button></footer>
    </section>
  </div>
}

function PracticePage({ kind, data, update, updateItem, removeItem }) {
  const config = practiceConfig[kind]
  const Icon = config.icon
  const rows = data[config.key] || []
  const done = rows.filter((item) => item.done).length
  const minutes = rows.filter((item) => item.done).reduce((sum, item) => sum + Number(item.minutes || 0), 0)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ title: '', minutes: 20 })
  const submit = (event) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    update(config.key, (items) => [...items, { id: uid(), title: draft.title.trim(), minutes: Number(draft.minutes), done: false, date: today() }])
    setDraft({ title: '', minutes: 20 })
    setAdding(false)
  }

  return <div className="lf-page">
    <PageIntro kicker={config.kicker} title={config.title} copy={config.intro} />
    <section className="lf-route-card">
      <header><span><Icon weight="fill" /></span><div><small>当前路线</small><h2>{config.stage}</h2></div><em>{done}/{rows.length}</em></header>
      <p>{config.goal}</p>
      <div className="lf-progress-track"><span style={{ width: `${rows.length ? done / rows.length * 100 : 0}%` }} /></div>
      <footer><b>已投入 {minutes} 分钟</b><span>完成全部练习后进入下一阶段</span></footer>
    </section>
    <section className="lf-card lf-practice-section">
      <header><div><h2>今日练习</h2><p>按顺序完成，也可以加入自己的练习。</p></div><button type="button" onClick={() => setAdding((value) => !value)}><Plus />添加</button></header>
      {adding && <form className="lf-inline-form" onSubmit={submit}><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="练习内容" /><input className="lf-minutes-input" type="number" min="1" value={draft.minutes} onChange={(event) => setDraft({ ...draft, minutes: event.target.value })} /><button type="submit">保存</button></form>}
      <div className="lf-practice-list">{rows.map((item) => <article className={item.done ? 'is-done' : ''} key={item.id}>
        <button className="lf-check" type="button" aria-label={item.done ? '标记练习未完成' : '标记练习完成'} onClick={() => updateItem(config.key, item.id, { done: !item.done })}>{item.done && <Check />}</button>
        <button className="lf-practice-copy" type="button" aria-label={`编辑练习：${item.title}`} onClick={() => { const title = window.prompt('修改练习内容', item.title); if (title?.trim()) updateItem(config.key, item.id, { title: title.trim() }) }}><b>{item.title}</b><span>{item.minutes} 分钟 · {item.done ? '今天已完成' : '等待练习'}</span></button>
        <button className="lf-icon-quiet" type="button" aria-label="删除练习" onClick={() => removeItem(config.key, item.id)}><Trash /></button>
      </article>)}</div>
    </section>
    <section className="lf-resource-card"><div><Play weight="fill" /><span><b>练习资源</b><small>从公开平台搜索匹配的教学内容</small></span></div><div><button type="button" onClick={() => window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(config.resource)}`, '_blank', 'noopener')}>B站搜索</button><button type="button" onClick={() => window.open(`https://www.douyin.com/search/${encodeURIComponent(config.resource)}`, '_blank', 'noopener')}>短视频跟练</button></div></section>
  </div>
}

function PageIntro({ kicker, title, copy, action }) {
  return <header className="lf-page-intro"><div><small>{kicker}</small><h1>{title}</h1><p>{copy}</p></div>{action}</header>
}

function InfoStrip({ icon: Icon, title, copy }) {
  return <div className="lf-info-strip"><Icon weight="fill" /><span><b>{title}</b><small>{copy}</small></span></div>
}

function FilterPills({ values, value, onChange }) {
  return <div className="lf-filter-pills" role="group" aria-label="筛选">{values.map((item) => <button type="button" className={value === item ? 'is-active' : ''} onClick={() => onChange(item)} key={item}>{item}</button>)}</div>
}
