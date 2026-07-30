import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AddressBook,
  ArrowClockwise,
  ArrowRight,
  ArrowSquareOut,
  BookOpenText,
  Books,
  CalendarBlank,
  ChartLineUp,
  Check,
  CheckCircle,
  ClockCountdown,
  CloudArrowDown,
  CloudArrowUp,
  DeviceMobile,
  DownloadSimple,
  FolderSimple,
  GearSix,
  GraduationCap,
  House,
  Kanban,
  ListChecks,
  LockKey,
  NotePencil,
  Palette,
  Pause,
  Play,
  Plus,
  Repeat,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  StackSimple,
  Student,
  Target,
  UsersThree,
  X,
} from '@phosphor-icons/react'
import morningArt from './assets/workbench-morning.webp'
import { findModule, moduleCatalog } from './data/modules'
import { findPack, packs } from './data/packs'
import {
  pullWorkspaceDataFromGitHub,
  pullWorkspaceFromGitHub,
  pushWorkspaceDataToGitHub,
  pushWorkspaceToGitHub,
} from './lib/github'
import { defaultWorkspaceData, loadWorkspaceData, saveWorkspaceData } from './lib/local-data'
import { injectStandalonePayload } from './lib/local-export'
import {
  GITHUB_STORAGE_KEY,
  createWorkspace,
  loadWorkspace,
  normalizeWorkspace,
  saveWorkspace,
  toggleModule,
} from './lib/workspace'
import './styles.css'

const registryUrl = 'https://raw.githubusercontent.com/diyiwuyan/onebench/main/packages/community-registry/registry.json'

const themes = [
  {
    id: 'warm-paper',
    name: '暖杏纸张',
    accent: '#d66f51',
    tokens: { '--page': '#f2eee5', '--surface': '#fffdf8', '--surface-2': '#f8f2e8', '--ink': '#30322e', '--muted': '#74786f', '--line': '#e6ded1', '--accent': '#d66f51', '--accent-soft': '#f8ddd2', '--sage': '#dce7d5', '--blue': '#dce5ef' },
  },
  {
    id: 'sage-paper',
    name: '鼠尾草纸',
    accent: '#667d61',
    tokens: { '--page': '#edf0e9', '--surface': '#fbfcf8', '--surface-2': '#f0f4ec', '--ink': '#2f352e', '--muted': '#70786d', '--line': '#dce3d8', '--accent': '#667d61', '--accent-soft': '#dce8d7', '--sage': '#d7e5dc', '--blue': '#dde6ec' },
  },
  {
    id: 'lavender-paper',
    name: '雾紫纸张',
    accent: '#756783',
    tokens: { '--page': '#efecf1', '--surface': '#fdfbfe', '--surface-2': '#f3eef5', '--ink': '#342f37', '--muted': '#77707c', '--line': '#e2dbe5', '--accent': '#756783', '--accent-soft': '#e7ddec', '--sage': '#dce5dc', '--blue': '#dce3ee' },
  },
]

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

function readEmbeddedSeed() {
  const raw = window.__ONEBENCH_SEED__
  if (!raw || raw === '__ONEBENCH_PAYLOAD__') return null
  try {
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return null
  }
}

function readConnection() {
  try {
    return {
      owner: '',
      repo: '',
      branch: 'main',
      path: 'workspace.json',
      dataPath: 'workspace-data.json',
      syncContent: false,
      token: '',
      ...JSON.parse(localStorage.getItem(GITHUB_STORAGE_KEY)),
    }
  } catch {
    return { owner: '', repo: '', branch: 'main', path: 'workspace.json', dataPath: 'workspace-data.json', syncContent: false, token: '' }
  }
}

function downloadFile(name, text, type = 'text/html;charset=utf-8') {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([text], { type }))
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

function greeting(date) {
  const hour = date.getHours()
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function daysLeft(value) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000))
}

function formatTimer(seconds) {
  const minute = Math.floor(seconds / 60).toString().padStart(2, '0')
  const second = (seconds % 60).toString().padStart(2, '0')
  return `${minute}:${second}`
}

function todayWeek() {
  const mondayOffset = (new Date().getDay() + 6) % 7
  return weekLabels.map((label, index) => {
    const date = new Date()
    date.setDate(date.getDate() - mondayOffset + index)
    return { label, date: date.getDate(), today: index === mondayOffset }
  })
}

function Card({ id, title, subtitle, icon: Icon, className = '', children }) {
  return (
    <article className={`module-card ${className}`} data-module={id}>
      <header className="module-head">
        <span className="module-icon"><Icon weight="duotone" /></span>
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      </header>
      {children}
    </article>
  )
}

function ProgressRow({ item }) {
  return (
    <div className="progress-row">
      <div><strong>{item.title}</strong><small>{item.note || item.meta}</small></div>
      <span>{item.progress}%</span>
      <progress max="100" value={item.progress}>{item.progress}%</progress>
    </div>
  )
}

export function App() {
  const embeddedSeed = useMemo(readEmbeddedSeed, [])
  const initialWorkspace = useMemo(() => {
    if (embeddedSeed?.workspace) {
      try { return normalizeWorkspace(embeddedSeed.workspace) } catch { /* use fallback */ }
    }
    return loadWorkspace() || createWorkspace({ packId: 'postgraduate-exam' })
  }, [embeddedSeed])

  const [workspace, setWorkspace] = useState(initialWorkspace)
  const [workspaceData, setWorkspaceData] = useState(() => loadWorkspaceData(initialWorkspace, embeddedSeed?.data))
  const [prompt, setPrompt] = useState(initialWorkspace.intent)
  const [now, setNow] = useState(new Date())
  const [newTask, setNewTask] = useState('')
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState(embeddedSeed ? '这是你的本地工作台，数据保存在当前设备。' : '这是可直接操作的 Demo，改动只保存在你的浏览器。')
  const [timerSeconds, setTimerSeconds] = useState((workspaceData.focus?.minutes || 25) * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [connection, setConnection] = useState(readConnection)
  const [syncStatus, setSyncStatus] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [marketEntries, setMarketEntries] = useState([])
  const [marketStatus, setMarketStatus] = useState('内置模块离线可用；联网后可检查社区更新。')
  const [installPrompt, setInstallPrompt] = useState(null)
  const drawerRef = useRef(null)

  const pack = findPack(workspace.sourcePack)
  const activeModuleIds = useMemo(() => new Set(workspace.modules.map((module) => module.id)), [workspace.modules])
  const theme = themes.find((item) => item.id === workspace.theme?.id) || themes[0]
  const weeks = useMemo(todayWeek, [now.toDateString()])
  const completedTasks = workspaceData.tasks.filter((item) => item.done).length
  const completedHabits = workspaceData.habits.filter((item) => item.done).length
  const isStandalone = Boolean(embeddedSeed)

  useEffect(() => {
    saveWorkspace(workspace)
  }, [])

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(clock)
  }, [])

  useEffect(() => {
    if (!timerRunning) return undefined
    const timer = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          setTimerRunning(false)
          setToast('这一轮专注完成了，休息一下再继续。')
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [timerRunning])

  useEffect(() => {
    if (!import.meta.env.ONEBENCH_EXTENSION && !import.meta.env.ONEBENCH_STANDALONE && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined)
    }
    const onInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', onInstall)
    return () => window.removeEventListener('beforeinstallprompt', onInstall)
  }, [])

  useEffect(() => {
    if (panel) window.setTimeout(() => drawerRef.current?.focus(), 20)
  }, [panel])

  function persistWorkspace(next) {
    const saved = saveWorkspace(next)
    setWorkspace(saved)
    return saved
  }

  function persistData(next, targetWorkspace = workspace) {
    const saved = saveWorkspaceData(targetWorkspace, next)
    setWorkspaceData(saved)
    return saved
  }

  function choosePack(nextPack) {
    const nextWorkspace = createWorkspace({ packId: nextPack.id, prompt: nextPack.prompt })
    const nextData = defaultWorkspaceData(nextWorkspace)
    persistWorkspace(nextWorkspace)
    persistData(nextData, nextWorkspace)
    setPrompt(nextWorkspace.intent)
    setTimerRunning(false)
    setTimerSeconds((nextData.focus?.minutes || 25) * 60)
    setToast(`已换成「${nextPack.name}」默认搭配，页面和内容都已更新。`)
    setPanel(null)
  }

  function rebuildFromPrompt() {
    if (!prompt.trim()) return
    const nextWorkspace = createWorkspace({ packId: pack.id, prompt })
    const nextData = defaultWorkspaceData(nextWorkspace)
    persistWorkspace(nextWorkspace)
    persistData(nextData, nextWorkspace)
    setTimerRunning(false)
    setTimerSeconds((nextData.focus?.minutes || 25) * 60)
    setToast('已按你的描述重新搭好一版，可继续在模块市场增减。')
    setPanel(null)
  }

  function updateData(recipe) {
    const next = typeof recipe === 'function' ? recipe(workspaceData) : recipe
    persistData(next)
  }

  function addTask(event) {
    event.preventDefault()
    if (!newTask.trim()) return
    updateData((data) => ({ ...data, tasks: [...data.tasks, { id: crypto.randomUUID(), title: newTask.trim(), done: false }] }))
    setNewTask('')
  }

  function toggleTask(id) {
    updateData((data) => ({ ...data, tasks: data.tasks.map((item) => item.id === id ? { ...item, done: !item.done } : item) }))
  }

  function toggleHabit(id) {
    updateData((data) => ({ ...data, habits: data.habits.map((item) => item.id === id ? { ...item, done: !item.done } : item) }))
  }

  function updateGoal(index, value) {
    updateData((data) => ({ ...data, goals: data.goals.map((item, itemIndex) => itemIndex === index ? { ...item, progress: value } : item) }))
  }

  function setFocusPreset(minutes) {
    setTimerRunning(false)
    setTimerSeconds(minutes * 60)
    updateData((data) => ({ ...data, focus: { ...data.focus, minutes } }))
  }

  async function downloadLocalWorkbench() {
    try {
      let html
      if (isStandalone) {
        const clone = document.documentElement.cloneNode(true)
        clone.querySelector('#root').innerHTML = ''
        const encoded = encodeURIComponent(JSON.stringify({ workspace, data: workspaceData }))
        html = `<!doctype html>${clone.outerHTML}`.replace(window.__ONEBENCH_SEED__, encoded)
      } else {
        const response = await fetch(`${import.meta.env.BASE_URL}standalone.html`)
        if (!response.ok) throw new Error('离线运行时下载失败')
        html = injectStandalonePayload(await response.text(), workspace, workspaceData)
      }
      downloadFile(`${workspace.name}.html`, html)
      setToast('已下载完整工作台：功能、样式和当前内容都会一起带走。')
    } catch (error) {
      setToast(error.message || '下载失败，请稍后重试。')
    }
  }

  async function installApp() {
    if (!installPrompt) {
      setPanel('help')
      return
    }
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  function changeTheme(nextTheme) {
    persistWorkspace({ ...workspace, theme: { id: nextTheme.id, name: nextTheme.name, accent: nextTheme.accent } })
    setToast(`主题已换成「${nextTheme.name}」。`)
  }

  function changeConnection(field, value) {
    const next = { ...connection, [field]: value }
    setConnection(next)
    localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(next))
  }

  async function pushToGitHub() {
    if (!connection.owner || !connection.repo || !connection.token) {
      setSyncStatus('还缺 GitHub 用户名、私有仓库名或访问令牌。')
      return
    }
    setSyncing(true)
    setSyncStatus('正在同步…')
    try {
      const sha = await pushWorkspaceToGitHub(connection, workspace, { lastSha: connection.lastSha })
      if (connection.syncContent) await pushWorkspaceDataToGitHub(connection, workspaceData)
      const next = { ...connection, lastSha: sha || connection.lastSha }
      setConnection(next)
      localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(next))
      setSyncStatus(connection.syncContent ? '配置和个人内容已同步到你的私有仓库。' : '工作台配置已同步，个人内容仍只在本机。')
    } catch (error) {
      setSyncStatus(error.message)
    } finally {
      setSyncing(false)
    }
  }

  async function pullFromGitHub() {
    if (!connection.owner || !connection.repo || !connection.token) {
      setSyncStatus('还缺 GitHub 用户名、私有仓库名或访问令牌。')
      return
    }
    setSyncing(true)
    setSyncStatus('正在读取远端版本…')
    try {
      const remote = await pullWorkspaceFromGitHub(connection)
      const nextWorkspace = normalizeWorkspace(remote.workspace)
      let nextData = defaultWorkspaceData(nextWorkspace)
      if (connection.syncContent) {
        const remoteData = await pullWorkspaceDataFromGitHub(connection)
        if (remoteData?.data) nextData = remoteData.data
      }
      persistWorkspace(nextWorkspace)
      persistData(nextData, nextWorkspace)
      setPrompt(nextWorkspace.intent)
      setSyncStatus('已恢复远端工作台。')
    } catch (error) {
      setSyncStatus(error.message)
    } finally {
      setSyncing(false)
    }
  }

  async function refreshMarket() {
    setMarketStatus('正在联网检查社区目录…')
    try {
      const response = await fetch(registryUrl)
      if (!response.ok) throw new Error(`目录更新失败（${response.status}）`)
      const registry = await response.json()
      const entries = [...(registry.templates || []), ...(registry.modules || [])]
      setMarketEntries(entries)
      setMarketStatus(`已检查到 ${entries.length} 个经过登记的公共条目。`)
    } catch (error) {
      setMarketStatus(error.message || '目前无法连接社区目录，内置模块仍可正常使用。')
    }
  }

  function installMarketEntry(entry) {
    const required = Array.isArray(entry.requires) ? entry.requires.filter(findModule) : []
    if (!required.length) {
      setMarketStatus('这个条目需要先由维护者审阅源码，浏览器不会直接执行第三方代码。')
      return
    }
    const ids = new Set([...activeModuleIds, ...required])
    persistWorkspace({ ...workspace, modules: [...ids].map((id) => ({ id, enabled: true })) })
    setMarketStatus(`已添加「${entry.name}」所需的模块组合。`)
  }

  const summary = [
    { label: '今日任务', value: `${completedTasks}/${workspaceData.tasks.length}`, note: '完成进度', progress: Math.round(completedTasks / Math.max(1, workspaceData.tasks.length) * 100), color: 'apricot' },
    { label: '专注计划', value: `${workspaceData.focus.minutes}m`, note: workspaceData.focus.subject, progress: Math.min(100, workspaceData.focus.minutes * 3), color: 'blue' },
    { label: '习惯打卡', value: `${completedHabits}/${workspaceData.habits.length}`, note: '今天已完成', progress: Math.round(completedHabits / Math.max(1, workspaceData.habits.length) * 100), color: 'sage' },
    { label: '本周节奏', value: `${Math.round(workspaceData.week.reduce((sum, item) => sum + item, 0) / workspaceData.week.length)}%`, note: '稳步向前', progress: Math.round(workspaceData.week.reduce((sum, item) => sum + item, 0) / workspaceData.week.length), color: 'plum' },
  ]

  return (
    <div className="app-shell" style={theme.tokens} data-theme={theme.id}>
      <aside className="side-rail" aria-label="工作台主导航">
        <button className="brand-mark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部"><StackSimple weight="fill" /></button>
        <nav>
          <button className="active" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><House weight="fill" /><span>首页</span></button>
          <button type="button" onClick={() => setPanel('studio')}><SlidersHorizontal weight="duotone" /><span>定制</span></button>
          <button type="button" onClick={() => setPanel('market')}><SquaresFour weight="duotone" /><span>模块</span></button>
          <button type="button" onClick={() => setPanel('sync')}><CloudArrowUp weight="duotone" /><span>同步</span></button>
        </nav>
        <button className="rail-settings" type="button" onClick={() => setPanel('help')} aria-label="打开帮助"><GearSix weight="duotone" /></button>
      </aside>

      <main className="workbench">
        <header className="topbar">
          <div className="identity-block">
            <span className="avatar">{pack.name.slice(0, 1)}</span>
            <div><strong>{workspace.name}</strong><small>{isStandalone ? '本地离线版' : 'OneBench 可操作演示'}</small></div>
          </div>
          <div className="top-actions">
            <button className="secondary-button" type="button" onClick={() => setPanel('studio')}><Palette weight="duotone" /> 换身份与主题</button>
            <button className="primary-button" type="button" onClick={downloadLocalWorkbench}><DownloadSimple weight="bold" /> 一键拥有</button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <h1>{greeting(now)}，今天也在稳稳向前。</h1>
            <p className="hero-quote">{workspaceData.quote}</p>
            <div className="hero-actions">
              <button type="button" onClick={() => document.querySelector('[data-module="tasks"]')?.scrollIntoView({ behavior: 'smooth' })}><CheckCircle weight="fill" /> 查看今日任务</button>
              <button type="button" onClick={() => setPanel('studio')}><Sparkle weight="duotone" /> 一句话修改</button>
            </div>
          </div>
          <img src={morningArt} alt="晨光、书本、笔记本与一株正在生长的绿植" />
        </section>

        <section className="summary-grid" aria-label="今日概览">
          {summary.map((item) => (
            <article className={`summary-card ${item.color}`} key={item.label}>
              <div><span>{item.label}</span><strong>{item.value}</strong></div>
              <progress max="100" value={item.progress}>{item.progress}%</progress>
              <small>{item.note}</small>
            </article>
          ))}
        </section>

        <section className="module-grid" aria-label={`${pack.name}工作台模块`}>
          {activeModuleIds.has('tasks') && (
            <Card id="tasks" title="今日任务" subtitle="先完成最重要的三件事" icon={ListChecks} className="span-6">
              <div className="task-list">
                {workspaceData.tasks.map((item) => (
                  <label key={item.id} className={item.done ? 'done' : ''}>
                    <input type="checkbox" checked={item.done} onChange={() => toggleTask(item.id)} />
                    <span className="fake-check"><Check weight="bold" /></span>
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
              <form className="add-task" onSubmit={addTask}>
                <input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="再加一件今天要做的事" />
                <button type="submit" aria-label="添加任务"><Plus weight="bold" /></button>
              </form>
            </Card>
          )}

          {activeModuleIds.has('calendar') && (
            <Card id="calendar" title="本周日历" subtitle="课程、会议和截止日" icon={CalendarBlank} className="span-3">
              <div className="week-strip">{weeks.map((item) => <span className={item.today ? 'today' : ''} key={item.label}><small>{item.label}</small><b>{item.date}</b></span>)}</div>
              <div className="next-event"><span>{workspaceData.schedule[0]?.time || '今天'}</span><div><strong>{workspaceData.schedule[0]?.title || '安排今天的第一件事'}</strong><small>{workspaceData.schedule[0]?.meta || '点击定制你的日程'}</small></div></div>
            </Card>
          )}

          {activeModuleIds.has('focus') && (
            <Card id="focus" title="番茄专注" subtitle={workspaceData.focus.subject} icon={ClockCountdown} className="span-3 focus-card">
              <div className="focus-presets">{[25, 45, 60].map((minutes) => <button className={workspaceData.focus.minutes === minutes ? 'selected' : ''} type="button" key={minutes} onClick={() => setFocusPreset(minutes)}>{minutes} 分钟</button>)}</div>
              <strong className="timer">{formatTimer(timerSeconds)}</strong>
              <div className="focus-actions">
                <button className="primary-button" type="button" onClick={() => { if (timerSeconds === 0) setTimerSeconds(workspaceData.focus.minutes * 60); setTimerRunning((value) => !value) }}>{timerRunning ? <Pause weight="fill" /> : <Play weight="fill" />}{timerRunning ? '暂停' : '开始'}</button>
                <button className="secondary-button" type="button" onClick={() => { setTimerRunning(false); setTimerSeconds(workspaceData.focus.minutes * 60) }}>重置</button>
              </div>
            </Card>
          )}

          {activeModuleIds.has('countdown') && (
            <Card id="countdown" title="重要倒计时" subtitle="把远目标变成今天的节奏" icon={Target} className="span-6">
              <div className="countdown-grid">
                {workspaceData.milestones.map((item) => <div className={item.tone} key={item.label}><span>{item.label}</span><strong>{daysLeft(item.date)}</strong><small>天</small></div>)}
              </div>
            </Card>
          )}

          {(activeModuleIds.has('schedule')) && (
            <Card id="schedule" title="今天的安排" subtitle="按时间走，不被临时事情带跑" icon={CalendarBlank} className="span-6">
              <div className="timeline">{workspaceData.schedule.map((item) => <div key={`${item.time}-${item.title}`}><time>{item.time}</time><span></span><p><strong>{item.title}</strong><small>{item.meta}</small></p></div>)}</div>
            </Card>
          )}

          {activeModuleIds.has('learning') && (
            <Card id="learning" title={pack.id.includes('exam') ? '科目进度' : '学习计划'} subtitle="清楚看到下一步学什么" icon={BookOpenText} className="span-6">
              <div className="progress-list">{workspaceData.learning.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('exam-practice') && (
            <Card id="exam-practice" title="刷题与错题" subtitle="题量不是终点，复盘才是" icon={Student} className="span-6">
              <div className="practice-grid">{workspaceData.practice.map((item) => <div key={item.title}><span>{item.title}</span><strong>{item.value}</strong><small>{item.meta}</small><progress max="100" value={item.progress}>{item.progress}%</progress></div>)}</div>
            </Card>
          )}

          {activeModuleIds.has('habits') && (
            <Card id="habits" title="今日习惯" subtitle={`${completedHabits}/${workspaceData.habits.length} 已完成`} icon={Repeat} className="span-6">
              <div className="habit-list">{workspaceData.habits.map((item) => <button className={item.done ? 'done' : ''} type="button" key={item.id} onClick={() => toggleHabit(item.id)}><span>{item.done ? <Check weight="bold" /> : null}</span>{item.name}</button>)}</div>
            </Card>
          )}

          {activeModuleIds.has('goals') && (
            <Card id="goals" title="阶段目标" subtitle="只展示正在推进的目标" icon={Target} className="span-6">
              <div className="goal-list">{workspaceData.goals.map((item, index) => <div key={item.title}><div><strong>{item.title}</strong><span>{item.progress}%</span></div><input type="range" min="0" max="100" value={item.progress} onChange={(event) => updateGoal(index, Number(event.target.value))} /></div>)}</div>
            </Card>
          )}

          {activeModuleIds.has('quick-note') && (
            <Card id="quick-note" title="快速记录" subtitle="灵感、提醒和临时想法" icon={NotePencil} className="span-6">
              <textarea className="quick-note" value={workspaceData.quickNote} onChange={(event) => updateData({ ...workspaceData, quickNote: event.target.value })} placeholder="现在脑子里最不想忘记的是什么？" />
            </Card>
          )}

          {activeModuleIds.has('analytics') && (
            <Card id="analytics" title="本周投入趋势" subtitle="不追求全满，只看是否持续" icon={ChartLineUp} className="span-6">
              <div className="trend-bars">{workspaceData.week.map((value, index) => <div key={weekLabels[index]}><span style={{ height: `${Math.max(16, value)}%` }}></span><small>{weekLabels[index]}</small></div>)}</div>
            </Card>
          )}

          {activeModuleIds.has('review') && (
            <Card id="review" title="今日复盘" subtitle="三句话收好今天" icon={ChartLineUp} className="span-6">
              <div className="review-fields">
                <label>今天做得好的<input value={workspaceData.review.win} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, win: event.target.value } })} placeholder="哪怕只是一件小事" /></label>
                <label>现在的卡点<input value={workspaceData.review.blocker} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, blocker: event.target.value } })} placeholder="把问题说清楚" /></label>
                <label>明天第一步<input value={workspaceData.review.next} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, next: event.target.value } })} placeholder="足够小、可以立刻开始" /></label>
              </div>
            </Card>
          )}

          {activeModuleIds.has('files') && (
            <Card id="files" title="资料与快捷入口" subtitle="常用内容一处打开" icon={FolderSimple} className="span-12">
              <div className="link-grid">{workspaceData.links.map((item) => <button type="button" key={item.title} onClick={() => setToast(`「${item.title}」是示例入口，可在定制时换成你的真实链接。`)}><FolderSimple weight="duotone" /><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowRight /></button>)}</div>
            </Card>
          )}

          {activeModuleIds.has('projects') && (
            <Card id="projects" title="项目进度" subtitle="进度、节点与阻塞" icon={Kanban} className="span-6">
              <div className="progress-list">{workspaceData.projects.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('classroom') && (
            <Card id="classroom" title="教学与班级" subtitle="备课、批改与班务" icon={GraduationCap} className="span-6">
              <div className="progress-list">{workspaceData.classroom.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('content-pipeline') && (
            <Card id="content-pipeline" title="内容流水线" subtitle="从灵感到发布" icon={Kanban} className="span-8">
              <div className="pipeline-grid">{workspaceData.pipeline.map((item) => <div key={item.title}><span>{item.title}</span><strong>{item.value}</strong><small>{item.meta}</small></div>)}</div>
            </Card>
          )}

          {activeModuleIds.has('clients') && (
            <Card id="clients" title="客户与交付" subtitle="所有承诺都看得见" icon={AddressBook} className="span-6">
              <div className="progress-list">{workspaceData.clients.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('team') && (
            <Card id="team" title="团队节奏" subtitle="1:1、进展与需要帮助的人" icon={UsersThree} className="span-6">
              <div className="progress-list">{workspaceData.team.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('reading') && (
            <Card id="reading" title="阅读书架" subtitle="在读与待读" icon={Books} className="span-4">
              <div className="book-list">{workspaceData.reading.map((item) => <div key={item.title}><span><Books weight="duotone" /></span><p><strong>{item.title}</strong><small>{item.meta}</small></p></div>)}</div>
            </Card>
          )}
        </section>

        <footer className="workbench-footer">
          <div><StackSimple weight="fill" /><span>OneBench</span></div>
          <p>你的数据默认留在本机。需要时再开启私有同步。</p>
          <button type="button" onClick={() => setPanel('help')}>使用帮助 <ArrowRight /></button>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="手机底部导航">
        <button className="active" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><House weight="fill" /><span>首页</span></button>
        <button type="button" onClick={() => setPanel('studio')}><SlidersHorizontal weight="duotone" /><span>定制</span></button>
        <button className="mobile-add" type="button" onClick={() => document.querySelector('.add-task input')?.focus()} aria-label="添加任务"><Plus weight="bold" /></button>
        <button type="button" onClick={() => setPanel('market')}><SquaresFour weight="duotone" /><span>模块</span></button>
        <button type="button" onClick={() => setPanel('help')}><GearSix weight="duotone" /><span>设置</span></button>
      </nav>

      {toast && <button className="toast" type="button" onClick={() => setToast('')}><CheckCircle weight="fill" /><span>{toast}</span><X /></button>}

      {panel && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null) }}>
          <section className="drawer" role="dialog" aria-modal="true" aria-label="工作台设置" tabIndex="-1" ref={drawerRef}>
            <header className="drawer-head">
              <div><p>ONEBENCH</p><h2>{panel === 'studio' ? '换成更像你的工作台' : panel === 'market' ? '模块市场' : panel === 'sync' ? '多端同步' : '怎么使用'}</h2></div>
              <button type="button" onClick={() => setPanel(null)} aria-label="关闭"><X weight="bold" /></button>
            </header>

            {panel === 'studio' && (
              <div className="drawer-body">
                <section><h3>1. 选择你的身份</h3><div className="pack-grid">{packs.map((item) => { const Icon = item.icon; return <button className={item.id === pack.id ? 'selected' : ''} type="button" key={item.id} onClick={() => choosePack(item)}><Icon weight="duotone" /><span><strong>{item.name}</strong><small>{item.description}</small></span></button> })}</div></section>
                <section><h3>2. 选择整体感觉</h3><div className="theme-grid">{themes.map((item) => <button className={item.id === theme.id ? 'selected' : ''} type="button" key={item.id} onClick={() => changeTheme(item)}><i style={{ background: item.accent }}></i><span>{item.name}</span>{item.id === theme.id && <Check weight="bold" />}</button>)}</div></section>
                <section><h3>3. 用一句话调整重点</h3><textarea className="prompt-box" value={prompt} onChange={(event) => setPrompt(event.target.value)} /><button className="primary-button wide-button" type="button" onClick={rebuildFromPrompt}><Sparkle weight="fill" /> 按这句话重新搭配</button></section>
              </div>
            )}

            {panel === 'market' && (
              <div className="drawer-body">
                <div className="market-toolbar"><p>{marketStatus}</p><button className="secondary-button" type="button" onClick={refreshMarket}><ArrowClockwise /> 联网检查更新</button></div>
                <div className="module-market">{moduleCatalog.filter((item) => item.id !== 'settings').map((item) => { const Icon = item.icon; const enabled = activeModuleIds.has(item.id); return <button className={enabled ? 'enabled' : ''} type="button" key={item.id} onClick={() => persistWorkspace(toggleModule(workspace, item.id))}><Icon weight="duotone" /><span><strong>{item.name}</strong><small>{item.description}</small></span><i>{enabled ? '已添加' : '添加'}</i></button> })}</div>
                {marketEntries.length > 0 && <section><h3>社区组合</h3><div className="community-list">{marketEntries.map((entry) => <article key={entry.id}><div><strong>{entry.name}</strong><small>{entry.description}</small></div><button type="button" onClick={() => installMarketEntry(entry)}>添加组合</button></article>)}</div></section>}
              </div>
            )}

            {panel === 'sync' && (
              <div className="drawer-body">
                <div className="simple-callout"><LockKey weight="duotone" /><div><strong>默认不需要配置</strong><p>只在这台电脑用，直接下载 HTML 即可。只有需要手机和多台电脑同步时，才开启下面的高级方案。</p></div></div>
                <section><h3>连接你自己的私有仓库</h3><div className="sync-fields"><label>GitHub 用户名<input value={connection.owner} onChange={(event) => changeConnection('owner', event.target.value)} placeholder="你的 GitHub 用户名" /></label><label>私有仓库名<input value={connection.repo} onChange={(event) => changeConnection('repo', event.target.value)} placeholder="my-onebench" /></label><label className="full-field">Fine-grained token<input type="password" value={connection.token} onChange={(event) => changeConnection('token', event.target.value)} placeholder="只授予该私有仓库 Contents 读写权限" /></label></div><label className="check-line"><input type="checkbox" checked={connection.syncContent} onChange={(event) => changeConnection('syncContent', event.target.checked)} />同时同步个人待办、记录和进度（仅建议私有仓库）</label><div className="sync-actions"><button className="primary-button" type="button" disabled={syncing} onClick={pushToGitHub}><CloudArrowUp /> 保存到云端</button><button className="secondary-button" type="button" disabled={syncing} onClick={pullFromGitHub}><CloudArrowDown /> 从云端恢复</button></div>{syncStatus && <p className="sync-status">{syncStatus}</p>}</section>
              </div>
            )}

            {panel === 'help' && (
              <div className="drawer-body help-body">
                <article><span>1</span><div><h3>电脑上直接用</h3><p>点“一键拥有”，把下载的 HTML 放到桌面。以后双击就能打开，不需要安装软件。</p><button className="primary-button" type="button" onClick={downloadLocalWorkbench}><DownloadSimple /> 下载完整本地版</button></div></article>
                <article><span>2</span><div><h3>添加到手机桌面</h3><p>先使用线上版打开工作台。iPhone 在 Safari 点“分享 → 添加到主屏幕”；Android 在浏览器菜单点“添加到主屏幕”。</p><button className="secondary-button" type="button" onClick={installApp}><DeviceMobile /> {installPrompt ? '现在安装' : '查看安装方式'}</button></div></article>
                <article><span>3</span><div><h3>变成浏览器新标签页</h3><p>让智能体执行“帮我生成 OneBench 浏览器插件版”。然后在 Chrome／Edge 扩展管理页打开开发者模式，加载生成的 <code>dist/extension</code> 文件夹。</p></div></article>
                <article><span>4</span><div><h3>以后继续修改</h3><p>直接对智能体说：“把我的工作台改成……”“增加……模块”“换成……风格”。它会在同一个开源项目上继续迭代。</p><a href="https://github.com/diyiwuyan/onebench/tree/main/skills/onebench-deploy" target="_blank" rel="noreferrer">查看 OneBench Skill <ArrowSquareOut /></a></div></article>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
