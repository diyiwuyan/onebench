import { useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AddressBook,
  ArrowClockwise,
  ArrowRight,
  ArrowSquareOut,
  Baby,
  Barbell,
  BookOpenText,
  Cake,
  Books,
  BowlFood,
  Briefcase,
  CalendarBlank,
  CalendarDots,
  ChartLineUp,
  Check,
  CheckCircle,
  ClockCountdown,
  CloudArrowDown,
  CloudArrowUp,
  CloudSun,
  Coins,
  DeviceMobile,
  DownloadSimple,
  Drop,
  FolderSimple,
  GearSix,
  GraduationCap,
  Heartbeat,
  House,
  Kanban,
  ListChecks,
  ListDashes,
  LockKey,
  MapPin,
  Newspaper,
  Notebook,
  NotePencil,
  Palette,
  Pause,
  PhoneCall,
  PencilSimple,
  Play,
  Plus,
  Quotes,
  Receipt,
  Repeat,
  SidebarSimple,
  SlidersHorizontal,
  SneakerMove,
  Sparkle,
  SquaresFour,
  StackSimple,
  Student,
  Target,
  Trash,
  TrendUp,
  UsersThree,
  ArrowsOutSimple,
  DotsSixVertical,
  X,
} from '@phosphor-icons/react'
import morningArt from './assets/workbench-morning.webp'
import bundledRegistry from '../packages/community-registry/registry.json'
import { findModule, moduleCatalog } from './data/modules'
import { findPack, packs } from './data/packs'
import { findTheme, themeCatalog } from './data/themes'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from './lib/backup'
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
  reorderHomeModules,
  saveWorkspace,
  toggleModule,
  updateModuleLayout,
} from './lib/workspace'
import { interpretPrompt } from './lib/intent'
import './styles.css'

const registryUrl = 'https://raw.githubusercontent.com/diyiwuyan/onebench/main/packages/community-registry/registry.json'

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

const avatarPresets = [
  { id: 'role', name: '职业头像' },
  { id: 'study', name: '学习者', icon: Student },
  { id: 'reader', name: '阅读者', icon: Books },
  { id: 'maker', name: '创造者', icon: Sparkle },
  { id: 'professional', name: '职业人', icon: Briefcase },
  { id: 'leader', name: '带队者', icon: UsersThree },
]

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
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? Math.max(0, Math.ceil((time - Date.now()) / 86400000)) : 0
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

function Card({ id, title, subtitle, icon: Icon, className = '', children, actions }) {
  return (
    <article className={`module-card ${className}`} data-module={id}>
      <header className="module-head">
        <span className="module-icon"><Icon weight="duotone" /></span>
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {actions && <aside className="module-actions">{actions}</aside>}
      </header>
      {children}
    </article>
  )
}

function SortableWidget({ module, editMode, onEdit, onResize, onMoveToSidebar, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
    disabled: !editMode,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-slot widget-${module.size} ${editMode ? 'editing' : ''} ${isDragging ? 'dragging' : ''}`}
      data-widget-id={module.id}
    >
      {children({
        actions: (
          <>
            {editMode && <button className="drag-handle" type="button" aria-label="拖拽调整位置" {...attributes} {...listeners}><DotsSixVertical weight="bold" /></button>}
            <button type="button" onClick={() => onEdit(module.id)} aria-label={`编辑${findModule(module.id)?.name || '模块'}`}><PencilSimple weight="bold" /></button>
            {editMode && <button type="button" onClick={() => onResize(module.id)} aria-label="切换小组件尺寸"><ArrowsOutSimple weight="bold" /></button>}
            {editMode && <button type="button" onClick={() => onMoveToSidebar(module.id)} aria-label="移到侧边栏"><SidebarSimple weight="bold" /></button>}
          </>
        ),
      })}
    </div>
  )
}

function monthCells(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1
    return day > 0 && day <= days ? day : null
  })
}

function weatherLabel(code) {
  if (code === 0) return '晴朗'
  if ([1, 2, 3].includes(code)) return '多云'
  if ([45, 48].includes(code)) return '有雾'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '有雨'
  if ([71, 73, 75, 85, 86].includes(code)) return '有雪'
  if ([95, 96, 99].includes(code)) return '雷雨'
  return '天气变化'
}

const editorSpecs = {
  tasks: { key: 'tasks', fields: [{ key: 'title', label: '待办内容' }] },
  calendar: { key: 'schedule', fields: [{ key: 'time', label: '时间', type: 'time' }, { key: 'title', label: '日程' }, { key: 'meta', label: '地点／说明' }] },
  schedule: { key: 'schedule', fields: [{ key: 'time', label: '时间', type: 'time' }, { key: 'title', label: '安排' }, { key: 'meta', label: '说明' }] },
  habits: { key: 'habits', fields: [{ key: 'name', label: '习惯名称' }] },
  countdown: { key: 'milestones', fields: [{ key: 'label', label: '节点' }, { key: 'date', label: '日期', type: 'date' }] },
  goals: { key: 'goals', fields: [{ key: 'title', label: '目标' }, { key: 'progress', label: '进度', type: 'number' }] },
  files: { key: 'links', fields: [{ key: 'title', label: '名称' }, { key: 'meta', label: '说明' }, { key: 'url', label: '链接', type: 'url' }] },
  learning: { key: 'learning', fields: [{ key: 'title', label: '科目／计划' }, { key: 'note', label: '下一步' }, { key: 'progress', label: '进度', type: 'number' }] },
  'exam-practice': { key: 'practice', fields: [{ key: 'title', label: '项目' }, { key: 'value', label: '数值' }, { key: 'meta', label: '说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  assignments: { key: 'assignments', fields: [{ key: 'title', label: '作业' }, { key: 'meta', label: '截止／说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  'lesson-plans': { key: 'lessonPlans', fields: [{ key: 'title', label: '课题' }, { key: 'meta', label: '班级／说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  classroom: { key: 'classroom', fields: [{ key: 'title', label: '事项' }, { key: 'meta', label: '说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  projects: { key: 'projects', fields: [{ key: 'title', label: '项目' }, { key: 'meta', label: '节点／阻塞' }, { key: 'progress', label: '进度', type: 'number' }] },
  clients: { key: 'clients', fields: [{ key: 'title', label: '客户／交付' }, { key: 'meta', label: '说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  team: { key: 'team', fields: [{ key: 'title', label: '成员／事项' }, { key: 'meta', label: '说明' }, { key: 'progress', label: '进度', type: 'number' }] },
  reading: { key: 'reading', fields: [{ key: 'title', label: '书名' }, { key: 'meta', label: '进度／备注' }] },
  'content-pipeline': { key: 'pipeline', fields: [{ key: 'title', label: '阶段' }, { key: 'value', label: '数量', type: 'number' }, { key: 'meta', label: '说明' }] },
  notices: { key: 'notices', fields: [{ key: 'title', label: '公告／节点' }, { key: 'meta', label: '说明' }] },
  inbox: { key: 'inbox', fields: [{ key: 'title', label: '灵感／需求' }, { key: 'meta', label: '来源／说明' }] },
  'content-calendar': { key: 'contentCalendar', fields: [{ key: 'title', label: '排期' }, { key: 'meta', label: '平台／时间' }, { key: 'status', label: '状态' }] },
  meetings: { key: 'meetings', fields: [{ key: 'title', label: '会议' }, { key: 'meta', label: '时间／跟进' }] },
  decisions: { key: 'decisions', fields: [{ key: 'title', label: '决定' }, { key: 'meta', label: '依据／复查' }] },
  finance: { key: 'finance', fields: [{ key: 'title', label: '项目' }, { key: 'value', label: '数值' }, { key: 'meta', label: '说明' }] },
  wellbeing: { key: 'wellbeing', fields: [{ key: 'title', label: '指标' }, { key: 'value', label: '状态' }, { key: 'meta', label: '说明' }] },
  'client-followup': { key: 'clientFollowup', fields: [{ key: 'title', label: '跟进事项' }, { key: 'meta', label: '时间／渠道' }] },
  invoices: { key: 'invoices', fields: [{ key: 'title', label: '发票项目' }, { key: 'value', label: '金额' }, { key: 'meta', label: '类型／状态' }, { key: 'status', label: '标签' }] },
  bookkeeping: { key: 'bookkeeping', fields: [{ key: 'title', label: '收支项目' }, { key: 'value', label: '金额' }, { key: 'meta', label: '分类' }, { key: 'category', label: '类型（income/expense）' }] },
  'finance-knowledge': { key: 'financeKnowledge', fields: [{ key: 'title', label: '知识点' }, { key: 'meta', label: '说明' }] },
  workout: { key: 'workout', fields: [{ key: 'title', label: '运动' }, { key: 'value', label: '数据' }, { key: 'meta', label: '说明' }] },
  meals: { key: 'meals', fields: [{ key: 'title', label: '餐次' }, { key: 'meta', label: '内容' }] },
  health: { key: 'health', fields: [{ key: 'title', label: '指标' }, { key: 'value', label: '数值' }, { key: 'meta', label: '说明' }] },
  birthdays: { key: 'birthdays', fields: [{ key: 'title', label: '亲友' }, { key: 'meta', label: '日期' }, { key: 'tone', label: '颜色' }] },
  diary: { key: 'diary', fields: [{ key: 'title', label: '标题' }, { key: 'meta', label: '日期' }, { key: 'note', label: '内容' }] },
  news: { key: 'news', fields: [{ key: 'title', label: '标题' }, { key: 'category', label: '分类' }, { key: 'summary', label: '摘要' }] },
  quotes: { key: 'quotes', fields: [{ key: 'title', label: '语录' }, { key: 'meta', label: '出处' }] },
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

function ProfileAvatar({ workspace, workspaceData, pack, large = false }) {
  if (workspaceData.profileImage) {
    return <img className="profile-photo" src={workspaceData.profileImage} alt={`${workspace.profile?.displayName || '用户'}的头像`} />
  }
  const preset = avatarPresets.find((item) => item.id === workspace.profile?.avatarId)
  const Icon = preset?.icon || pack.icon
  return <Icon weight="duotone" size={large ? 28 : 20} />
}

function DetailList({ items }) {
  return (
    <div className="detail-list">
      {items.map((item) => (
        <div key={`${item.title}-${item.meta}`}>
          <span className={item.tone || ''}></span>
          <p><strong>{item.title}</strong><small>{item.meta}</small></p>
          {item.status && <i>{item.status}</i>}
        </div>
      ))}
    </div>
  )
}

function MetricTiles({ items }) {
  return (
    <div className="metric-tiles">
      {items.map((item) => <div key={item.title}><span>{item.title}</span><strong>{item.value}</strong><small>{item.meta}</small></div>)}
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
  const [marketEntries, setMarketEntries] = useState(() => [...(bundledRegistry.templates || []), ...(bundledRegistry.modules || [])])
  const [marketStatus, setMarketStatus] = useState(`已载入社区目录快照：${(bundledRegistry.templates || []).length} 个模板、${(bundledRegistry.modules || []).length} 个模块。`)
  const [backupPassphrase, setBackupPassphrase] = useState('')
  const [backupStatus, setBackupStatus] = useState('')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [weatherStatus, setWeatherStatus] = useState('')
  const drawerRef = useRef(null)
  const avatarInputRef = useRef(null)
  const backupInputRef = useRef(null)

  const pack = findPack(workspace.sourcePack)
  const activeModuleIds = useMemo(() => new Set(workspace.modules.map((module) => module.id)), [workspace.modules])
  const theme = findTheme(workspace.theme?.id)
  const weeks = useMemo(todayWeek, [now.toDateString()])
  const completedTasks = workspaceData.tasks.filter((item) => item.done).length
  const completedHabits = workspaceData.habits.filter((item) => item.done).length
  const isStandalone = Boolean(embeddedSeed)
  const homeModules = useMemo(() => workspace.modules.filter((module) => module.enabled && module.placement === 'home').sort((a, b) => a.order - b.order), [workspace.modules])
  const editorModuleId = panel?.startsWith('module:') ? panel.slice(7) : ''
  const editorSpec = editorSpecs[editorModuleId]
  const interpreted = useMemo(() => (prompt.trim() ? interpretPrompt(prompt, pack) : null), [prompt, pack])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
    const nextWorkspace = {
      ...createWorkspace({ packId: nextPack.id, prompt: nextPack.prompt }),
      profile: { ...workspace.profile },
    }
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
    const result = interpretPrompt(prompt, pack)
    const targetPack = findPack(result.packId)
    const nextWorkspace = {
      ...createWorkspace({ packId: targetPack.id, prompt, moduleIds: result.moduleIds }),
      profile: { ...workspace.profile },
    }
    const nextData = defaultWorkspaceData(nextWorkspace)
    persistWorkspace(nextWorkspace)
    persistData(nextData, nextWorkspace)
    setPrompt(nextWorkspace.intent)
    setTimerRunning(false)
    setTimerSeconds((nextData.focus?.minutes || 25) * 60)
    setToast(result.summary)
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

  function editModule(moduleId) {
    setPanel(`module:${moduleId}`)
  }

  function resizeModule(moduleId) {
    const current = workspace.modules.find((module) => module.id === moduleId)
    const sizes = ['small', 'medium', 'wide']
    const nextSize = sizes[(sizes.indexOf(current?.size) + 1) % sizes.length]
    persistWorkspace(updateModuleLayout(workspace, moduleId, { size: nextSize }))
    setToast(`小组件已切换为${nextSize === 'small' ? '小号' : nextSize === 'medium' ? '中号' : '大号'}。`)
  }

  function moveModule(moduleId, placement) {
    persistWorkspace(updateModuleLayout(workspace, moduleId, { placement }))
    setToast(placement === 'home' ? '已添加到首页，可以继续拖拽调整位置。' : '已移到左侧应用区，数据不会删除。')
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    persistWorkspace(reorderHomeModules(workspace, active.id, over.id))
  }

  function updateArrayItem(spec, index, field, value) {
    updateData((data) => ({
      ...data,
      [spec.key]: data[spec.key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  function addArrayItem(spec) {
    const item = { id: crypto.randomUUID() }
    spec.fields.forEach((field) => {
      item[field.key] = field.type === 'number' ? 0 : field.type === 'date' ? new Date().toISOString().slice(0, 10) : ''
    })
    if (spec.key === 'tasks' || spec.key === 'habits') item.done = false
    if (spec.key === 'milestones') item.tone = 'sage'
    updateData((data) => ({ ...data, [spec.key]: [...(data[spec.key] || []), item] }))
  }

  function deleteArrayItem(spec, index) {
    updateData((data) => ({ ...data, [spec.key]: data[spec.key].filter((_, itemIndex) => itemIndex !== index) }))
  }

  async function refreshWeather(city = workspaceData.weather.city) {
    const nextCity = city.trim()
    if (!nextCity) {
      setWeatherStatus('请先输入城市。')
      return
    }
    setWeatherStatus('正在更新天气…')
    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nextCity)}&count=1&language=zh&format=json`)
      if (!geoResponse.ok) throw new Error('城市查询失败')
      const geo = await geoResponse.json()
      const place = geo.results?.[0]
      if (!place) throw new Error('没有找到这个城市')
      const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`)
      if (!forecastResponse.ok) throw new Error('天气更新失败')
      const forecast = await forecastResponse.json()
      updateData((data) => ({
        ...data,
        weather: {
          city: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
          temperature: Math.round(forecast.current.temperature_2m),
          apparentTemperature: Math.round(forecast.current.apparent_temperature),
          weatherCode: forecast.current.weather_code,
          high: Math.round(forecast.daily.temperature_2m_max[0]),
          low: Math.round(forecast.daily.temperature_2m_min[0]),
          dailyHigh: forecast.daily.temperature_2m_max.map(Math.round),
          dailyLow: forecast.daily.temperature_2m_min.map(Math.round),
          updatedAt: new Date().toISOString(),
          source: 'Open-Meteo',
        },
      }))
      setWeatherStatus('已更新，离线时会继续显示最近一次结果。')
    } catch (error) {
      setWeatherStatus(`${error.message || '天气更新失败'}，已保留本地缓存。`)
    }
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

  function updateProfile(field, value) {
    persistWorkspace({ ...workspace, profile: { ...workspace.profile, [field]: value } })
  }

  function updateWorkspaceName(value) {
    persistWorkspace({ ...workspace, name: value.slice(0, 80) || pack.title })
  }

  function chooseAvatar(avatarId) {
    persistWorkspace({ ...workspace, profile: { ...workspace.profile, avatarId } })
    updateData({ ...workspaceData, profileImage: '' })
    setToast('头像已经更新，并会跟随本地版一起下载。')
  }

  function uploadAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast('请选择图片文件。')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast('头像请控制在 2MB 以内。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateData({ ...workspaceData, profileImage: String(reader.result || '') })
      setToast('已经换成你的照片，下载本地版时也会带上。')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  async function downloadEncryptedBackup() {
    try {
      const backup = await encryptWorkspaceBackup({ workspace, data: workspaceData }, backupPassphrase)
      downloadFile(`${workspace.name}-加密备份.json`, JSON.stringify(backup, null, 2), 'application/json;charset=utf-8')
      setBackupStatus('加密备份已下载。请把口令和文件分开保存。')
    } catch (error) {
      setBackupStatus(error.message)
    }
  }

  async function restoreEncryptedBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const backup = JSON.parse(await file.text())
      const restored = await decryptWorkspaceBackup(backup, backupPassphrase)
      const nextWorkspace = normalizeWorkspace(restored.workspace)
      persistWorkspace(nextWorkspace)
      persistData(restored.data, nextWorkspace)
      setPrompt(nextWorkspace.intent)
      setBackupStatus('加密备份已恢复。')
      setToast('工作台、个人资料和日常内容都已恢复。')
    } catch (error) {
      setBackupStatus(error.message)
    } finally {
      event.target.value = ''
    }
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
      const next = { ...connection, lastSha: sha || connection.lastSha, lastSyncedAt: new Date().toISOString() }
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
      changeConnection('lastSyncedAt', new Date().toISOString())
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
    const missing = required.filter((id) => !activeModuleIds.has(id))
    let nextWorkspace = workspace
    missing.forEach((id) => { nextWorkspace = toggleModule(nextWorkspace, id) })
    persistWorkspace(nextWorkspace)
    setMarketStatus(`已添加「${entry.name}」所需的模块组合。`)
  }

  function widget(module, cardProps, content) {
    return (
      <SortableWidget
        key={module.id}
        module={module}
        editMode={editMode}
        onEdit={editModule}
        onResize={resizeModule}
        onMoveToSidebar={(id) => moveModule(id, 'sidebar')}
      >
        {({ actions }) => <Card id={module.id} {...cardProps} actions={actions}>{content}</Card>}
      </SortableWidget>
    )
  }

  function renderWidget(module) {
    const id = module.id
    if (id === 'tasks') return widget(module, { title: '今日任务', subtitle: '先完成最重要的三件事', icon: ListChecks }, <>
      <div className="task-list">
        {workspaceData.tasks.map((item) => <label key={item.id} className={item.done ? 'done' : ''}><input type="checkbox" checked={item.done} onChange={() => toggleTask(item.id)} /><span className="fake-check"><Check weight="bold" /></span><span>{item.title}</span></label>)}
      </div>
      <form className="add-task" onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="再加一件今天要做的事" /><button type="submit" aria-label="添加任务"><Plus weight="bold" /></button></form>
    </>)

    if (id === 'calendar') {
      const cells = monthCells(now)
      return widget(module, { title: `${now.getMonth() + 1} 月日历`, subtitle: '点击编辑日程与截止日', icon: CalendarBlank }, <>
        <div className="mini-calendar-labels">{weekLabels.map((label) => <span key={label}>{label}</span>)}</div>
        <div className="mini-calendar">{cells.map((day, index) => <span className={day === now.getDate() ? 'today' : ''} key={`${day}-${index}`}>{day || ''}</span>)}</div>
        <button className="next-event next-event-button" type="button" onClick={() => editModule('calendar')}><span>{workspaceData.schedule[0]?.time || '今天'}</span><div><strong>{workspaceData.schedule[0]?.title || '安排第一件事'}</strong><small>{workspaceData.schedule[0]?.meta || '点击添加日程'}</small></div><ArrowRight /></button>
      </>)
    }

    if (id === 'weather') return widget(module, { title: workspaceData.weather.city || '天气', subtitle: workspaceData.weather.updatedAt ? `更新于 ${new Date(workspaceData.weather.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '点击刷新真实天气', icon: CloudSun }, <>
      <div className="weather-main"><div><strong>{workspaceData.weather.temperature}°</strong><span>{weatherLabel(workspaceData.weather.weatherCode)}</span></div><CloudSun weight="duotone" /></div>
      <div className="weather-meta"><span>体感 {workspaceData.weather.apparentTemperature}°</span><span>最高 {workspaceData.weather.high}°</span><span>最低 {workspaceData.weather.low}°</span></div>
      <button className="weather-refresh" type="button" onClick={() => refreshWeather()}><MapPin weight="fill" /> {workspaceData.weather.city} · 刷新</button>
    </>)

    if (id === 'focus') return widget(module, { title: '番茄专注', subtitle: workspaceData.focus.subject, icon: ClockCountdown }, <>
      <div className="focus-presets">{[25, 45, 60].map((minutes) => <button className={workspaceData.focus.minutes === minutes ? 'selected' : ''} type="button" key={minutes} onClick={() => setFocusPreset(minutes)}>{minutes} 分钟</button>)}</div>
      <strong className="timer">{formatTimer(timerSeconds)}</strong>
      <div className="focus-actions"><button className="primary-button" type="button" onClick={() => { if (timerSeconds === 0) setTimerSeconds(workspaceData.focus.minutes * 60); setTimerRunning((value) => !value) }}>{timerRunning ? <Pause weight="fill" /> : <Play weight="fill" />}{timerRunning ? '暂停' : '开始'}</button><button className="secondary-button" type="button" onClick={() => { setTimerRunning(false); setTimerSeconds(workspaceData.focus.minutes * 60) }}>重置</button></div>
    </>)

    if (id === 'countdown') return widget(module, { title: '重要倒计时', subtitle: '每个日期都可以修改', icon: Target }, <div className="countdown-grid">{workspaceData.milestones.map((item) => <div className={item.tone} key={`${item.label}-${item.date}`}><span>{item.label}</span><strong>{daysLeft(item.date)}</strong><small>天</small></div>)}</div>)
    if (id === 'schedule') return widget(module, { title: '今天的安排', subtitle: '按时间走，不被临时事情带跑', icon: CalendarDots }, <div className="timeline">{workspaceData.schedule.map((item) => <div key={`${item.time}-${item.title}`}><time>{item.time}</time><span></span><p><strong>{item.title}</strong><small>{item.meta}</small></p></div>)}</div>)
    if (id === 'learning') return widget(module, { title: pack.id.includes('exam') ? '科目进度' : '学习计划', subtitle: '示例内容可改、可删、可新增', icon: BookOpenText }, <div className="progress-list">{workspaceData.learning.map((item) => <ProgressRow item={item} key={item.title} />)}</div>)
    if (id === 'exam-practice') return widget(module, { title: '刷题与错题', subtitle: '题量不是终点，复盘才是', icon: Student }, <div className="practice-grid">{workspaceData.practice.map((item) => <div key={item.title}><span>{item.title}</span><strong>{item.value}</strong><small>{item.meta}</small><progress max="100" value={item.progress}>{item.progress}%</progress></div>)}</div>)
    if (id === 'habits') return widget(module, { title: '今日习惯', subtitle: `${completedHabits}/${workspaceData.habits.length} 已完成`, icon: Repeat }, <div className="habit-list">{workspaceData.habits.map((item) => <button className={item.done ? 'done' : ''} type="button" key={item.id} onClick={() => toggleHabit(item.id)}><span>{item.done ? <Check weight="bold" /> : null}</span>{item.name}</button>)}</div>)
    if (id === 'goals') return widget(module, { title: '阶段目标', subtitle: '目标名称和进度都能修改', icon: Target }, <div className="goal-list">{workspaceData.goals.map((item, index) => <div key={item.title}><div><strong>{item.title}</strong><span>{item.progress}%</span></div><input type="range" min="0" max="100" value={item.progress} onChange={(event) => updateGoal(index, Number(event.target.value))} /></div>)}</div>)
    if (id === 'quick-note') return widget(module, { title: '快速记录', subtitle: '灵感、提醒和临时想法', icon: NotePencil }, <textarea className="quick-note" value={workspaceData.quickNote} onChange={(event) => updateData({ ...workspaceData, quickNote: event.target.value })} placeholder="现在脑子里最不想忘记的是什么？" />)
    if (id === 'analytics') return widget(module, { title: '本周投入趋势', subtitle: '点击编辑每天的投入比例', icon: ChartLineUp }, <div className="trend-bars">{workspaceData.week.map((value, index) => <div key={weekLabels[index]}><span style={{ height: `${Math.max(16, value)}%` }}></span><small>{weekLabels[index]}</small></div>)}</div>)
    if (id === 'review') return widget(module, { title: '今日复盘', subtitle: '三句话收好今天', icon: ChartLineUp }, <div className="review-fields"><label>今天做得好的<input value={workspaceData.review.win} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, win: event.target.value } })} placeholder="哪怕只是一件小事" /></label><label>现在的卡点<input value={workspaceData.review.blocker} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, blocker: event.target.value } })} placeholder="把问题说清楚" /></label><label>明天第一步<input value={workspaceData.review.next} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, next: event.target.value } })} placeholder="足够小、可以立刻开始" /></label></div>)
    if (id === 'files') return widget(module, { title: '资料与快捷入口', subtitle: '常用内容一处打开', icon: FolderSimple }, <div className="link-grid">{workspaceData.links.map((item) => <button type="button" key={item.title} onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : editModule('files')}><FolderSimple weight="duotone" /><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowRight /></button>)}</div>)

    const progressGroups = {
      assignments: ['作业与 DDL', '重要截止日不再散落', ListChecks, workspaceData.assignments],
      'lesson-plans': ['备课台', '课题、课件、学情和反思', BookOpenText, workspaceData.lessonPlans],
      projects: ['项目进度', '进度、节点与阻塞', Kanban, workspaceData.projects],
      classroom: ['教学与班级', '备课、批改与班务', GraduationCap, workspaceData.classroom],
      clients: ['客户与交付', '所有承诺都看得见', AddressBook, workspaceData.clients],
      team: ['团队节奏', '1:1、进展与需要帮助的人', UsersThree, workspaceData.team],
    }
    if (progressGroups[id]) {
      const [title, subtitle, Icon, items] = progressGroups[id]
      return widget(module, { title, subtitle, icon: Icon }, <div className="progress-list">{items.map((item) => <ProgressRow item={item} key={item.title} />)}</div>)
    }

    const detailGroups = {
      notices: ['公告与报名', '关键材料和时间节点', NotePencil, workspaceData.notices],
      inbox: ['灵感／需求收件箱', '先收下来，再决定放到哪里', StackSimple, workspaceData.inbox],
      'content-calendar': ['发布日历', '平台、主题和发布时间', CalendarBlank, workspaceData.contentCalendar],
      meetings: ['会议与沟通', '会前准备，会后跟进', UsersThree, workspaceData.meetings],
      decisions: ['决策记录', '判断依据与复查时间', Target, workspaceData.decisions],
      'client-followup': ['客户跟进', '沟通记录与下次提醒', PhoneCall, workspaceData.clientFollowup],
      'finance-knowledge': ['理财知识', '每天一个理财知识点', TrendUp, workspaceData.financeKnowledge],
      meals: ['好好吃饭', '三餐记录与营养提醒', BowlFood, workspaceData.meals],
      diary: ['日记本', '每日心情与关键小事', Notebook, workspaceData.diary],
    }
    if (detailGroups[id]) {
      const [title, subtitle, Icon, items] = detailGroups[id]
      return widget(module, { title, subtitle, icon: Icon }, <DetailList items={items} />)
    }

    const metricGroups = {
      wellbeing: ['身心状态', '学习之外，也照顾自己的节奏', Repeat, workspaceData.wellbeing],
      finance: ['收入与回款', '收入、发票和未完成的承诺', ChartLineUp, workspaceData.finance],
      invoices: ['发票统计', '发票收集、分类与抵扣提醒', Receipt, workspaceData.invoices],
      bookkeeping: ['记账', '每日收支与分类统计', Coins, workspaceData.bookkeeping],
      workout: ['运动记录', '今日运动、步数与消耗', SneakerMove, workspaceData.workout],
      health: ['健康管理', '体重、血压、睡眠等健康指标', Heartbeat, workspaceData.health],
    }
    if (metricGroups[id]) {
      const [title, subtitle, Icon, items] = metricGroups[id]
      return widget(module, { title, subtitle, icon: Icon }, <MetricTiles items={items} />)
    }

    if (id === 'content-pipeline') return widget(module, { title: '内容流水线', subtitle: '从灵感到发布', icon: Kanban }, <div className="pipeline-grid">{workspaceData.pipeline.map((item) => <div key={item.title}><span>{item.title}</span><strong>{item.value}</strong><small>{item.meta}</small></div>)}</div>)
    if (id === 'reading') return widget(module, { title: '阅读书架', subtitle: '在读与待读', icon: Books }, <div className="book-list">{workspaceData.reading.map((item) => <div key={item.title}><span><Books weight="duotone" /></span><p><strong>{item.title}</strong><small>{item.meta}</small></p></div>)}</div>)

    if (id === 'news') {
      return widget(module, { title: '新闻资讯', subtitle: '按你的身份推荐，离线也能看示例', icon: Newspaper }, <div className="news-list">{workspaceData.news.map((item) => <div key={item.id}><span className="news-category">{item.category}</span>{item.hot && <span className="news-hot">热</span>}<strong>{item.title}</strong><small>{item.summary}</small></div>)}</div>)
    }

    if (id === 'quotes') {
      const first = workspaceData.quotes[0] || { title: workspaceData.quote, meta: 'OneBench' }
      return widget(module, { title: '语录', subtitle: '每日一句，内置轮换', icon: Quotes }, <div className="quote-card"><Quotes weight="duotone" size={24} /><p>「{first.title}」</p><small>—— {first.meta}</small></div>)
    }

    if (id === 'birthdays') {
      return widget(module, { title: '生日记录', subtitle: '亲友生日与倒计时', icon: Cake }, <div className="birthday-list">{workspaceData.birthdays.map((item) => <div key={item.title}><span className={item.tone || ''}></span><p><strong>{item.title}</strong><small>{item.meta}</small></p></div>)}</div>)
    }

    if (id === 'period') {
      const p = workspaceData.period || {}
      return widget(module, { title: '生理期记录', subtitle: '周期预测与当前状态', icon: Drop }, <div className="period-card"><div><span>上次</span><strong>{p.lastPeriod || '-'}</strong></div><div><span>预计下次</span><strong>{p.predictedNext || '-'}</strong></div><div><span>当前</span><strong>{p.status || '-'}</strong></div></div>)
    }

    return null
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
          {['calendar', 'tasks', 'quick-note', 'goals'].filter((id) => activeModuleIds.has(id)).map((id) => {
            const item = findModule(id)
            const Icon = item.icon
            return <button type="button" key={id} onClick={() => editModule(id)}><Icon weight="duotone" /><span>{item.name}</span></button>
          })}
          <button type="button" onClick={() => setPanel('apps')}><ListDashes weight="duotone" /><span>全部</span></button>
          <button type="button" onClick={() => setPanel('market')}><SquaresFour weight="duotone" /><span>市场</span></button>
        </nav>
        <button className="rail-settings" type="button" onClick={() => setPanel('studio')} aria-label="打开定制"><GearSix weight="duotone" /></button>
      </aside>

      <main className="workbench">
        <header className="topbar">
          <div className="identity-block">
            <span className="avatar"><ProfileAvatar workspace={workspace} workspaceData={workspaceData} pack={pack} /></span>
            <div><strong>{workspace.name}</strong><small>{workspace.profile?.displayName} · {pack.name} · {isStandalone ? '本地离线版' : '可操作演示'}</small></div>
          </div>
          <div className="top-actions">
            <button className={`secondary-button ${editMode ? 'active-edit' : ''}`} type="button" onClick={() => setEditMode((value) => !value)}><SquaresFour weight="duotone" /> {editMode ? '完成编辑' : '编辑小组件'}</button>
            <button className="secondary-button" type="button" onClick={() => setPanel('studio')}><Palette weight="duotone" /> 换身份与主题</button>
            <button className="primary-button" type="button" onClick={downloadLocalWorkbench}><DownloadSimple weight="bold" /> 一键拥有</button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <h1>{greeting(now)}，{workspace.profile?.displayName}。<br />{pack.headline}</h1>
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

        <div className="widget-canvas-head">
          <div><p>我的首页</p><h2>{editMode ? '拖动卡片调整顺序，按钮可改尺寸或移到侧边栏' : '今天只看真正需要的内容'}</h2></div>
          <button className="secondary-button" type="button" onClick={() => setEditMode((value) => !value)}>{editMode ? <Check weight="bold" /> : <SquaresFour weight="duotone" />}{editMode ? '保存布局' : '编辑小组件'}</button>
        </div>
        {homeModules.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={homeModules.map((module) => module.id)} strategy={rectSortingStrategy}>
              <section className={`module-grid widget-canvas ${editMode ? 'is-editing' : ''}`} aria-label={`${pack.name}首页小组件`}>
                {homeModules.map(renderWidget)}
              </section>
            </SortableContext>
          </DndContext>
        ) : (
          <section className="empty-canvas"><SquaresFour weight="duotone" /><h2>首页还是空的</h2><p>从左侧“全部”或模块市场把常用组件放到首页。</p><button className="primary-button" type="button" onClick={() => setPanel('apps')}>选择小组件</button></section>
        )}

        {false && <section hidden className="module-grid" aria-label={`${pack.name}工作台模块`}>
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

          {activeModuleIds.has('assignments') && (
            <Card id="assignments" title="作业与 DDL" subtitle="重要截止日不再散落" icon={ListChecks} className="span-6">
              <div className="progress-list">{workspaceData.assignments.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('wellbeing') && (
            <Card id="wellbeing" title="身心状态" subtitle="学习之外，也照顾自己的节奏" icon={Repeat} className="span-6">
              <MetricTiles items={workspaceData.wellbeing} />
            </Card>
          )}

          {activeModuleIds.has('lesson-plans') && (
            <Card id="lesson-plans" title="备课台" subtitle="课题、课件、学情和反思" icon={BookOpenText} className="span-6">
              <div className="progress-list">{workspaceData.lessonPlans.map((item) => <ProgressRow item={item} key={item.title} />)}</div>
            </Card>
          )}

          {activeModuleIds.has('notices') && (
            <Card id="notices" title="公告与报名" subtitle="关键材料和时间节点" icon={NotePencil} className="span-6">
              <DetailList items={workspaceData.notices} />
            </Card>
          )}

          {activeModuleIds.has('inbox') && (
            <Card id="inbox" title="灵感／需求收件箱" subtitle="先收下来，再决定放到哪里" icon={StackSimple} className="span-6">
              <DetailList items={workspaceData.inbox} />
            </Card>
          )}

          {activeModuleIds.has('content-calendar') && (
            <Card id="content-calendar" title="发布日历" subtitle="平台、主题和发布时间" icon={CalendarBlank} className="span-6">
              <DetailList items={workspaceData.contentCalendar} />
            </Card>
          )}

          {activeModuleIds.has('meetings') && (
            <Card id="meetings" title="会议与沟通" subtitle="会前知道要谈什么，会后知道谁跟进" icon={UsersThree} className="span-6">
              <DetailList items={workspaceData.meetings} />
            </Card>
          )}

          {activeModuleIds.has('finance') && (
            <Card id="finance" title="收入与回款" subtitle="收入、发票和未完成的承诺" icon={ChartLineUp} className="span-6">
              <MetricTiles items={workspaceData.finance} />
            </Card>
          )}

          {activeModuleIds.has('decisions') && (
            <Card id="decisions" title="决策记录" subtitle="留下判断依据，也留下复查时间" icon={Target} className="span-6">
              <DetailList items={workspaceData.decisions} />
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
        </section>}

        <footer className="workbench-footer">
          <div><StackSimple weight="fill" /><span>OneBench</span></div>
          <p>你的数据默认留在本机。需要时再开启私有同步。</p>
          <button type="button" onClick={() => setPanel('help')}>使用帮助 <ArrowRight /></button>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="手机底部导航">
        <button className="active" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><House weight="fill" /><span>首页</span></button>
        <button type="button" onClick={() => editModule('calendar')}><CalendarBlank weight="duotone" /><span>日历</span></button>
        <button className="mobile-add" type="button" onClick={() => document.querySelector('.add-task input')?.focus()} aria-label="添加任务"><Plus weight="bold" /></button>
        <button type="button" onClick={() => setPanel('apps')}><ListDashes weight="duotone" /><span>应用</span></button>
        <button type="button" onClick={() => setPanel('help')}><GearSix weight="duotone" /><span>设置</span></button>
      </nav>

      {toast && <button className="toast" type="button" onClick={() => setToast('')}><CheckCircle weight="fill" /><span>{toast}</span><X /></button>}

      {panel && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null) }}>
          <section className="drawer" role="dialog" aria-modal="true" aria-label="工作台设置" tabIndex="-1" ref={drawerRef}>
            <header className="drawer-head">
              <div><p>ONEBENCH</p><h2>{panel === 'studio' ? '换成更像你的工作台' : panel === 'market' ? '模块与模板市场' : panel === 'apps' ? '我的全部应用' : panel === 'sync' ? '多端同步' : editorModuleId ? `编辑${findModule(editorModuleId)?.name || '模块'}` : '怎么使用'}</h2></div>
              <button type="button" onClick={() => setPanel(null)} aria-label="关闭"><X weight="bold" /></button>
            </header>

            {panel === 'apps' && (
              <div className="drawer-body">
                <div className="simple-callout"><SidebarSimple weight="duotone" /><div><strong>侧边栏是应用入口，首页是小组件画布</strong><p>放到侧边栏不会删除数据；需要每天看见的内容，再添加到首页。</p></div></div>
                <section><h3>已安装应用</h3><div className="app-library">{workspace.modules.filter((module) => findModule(module.id)?.category !== '系统').map((module) => { const item = findModule(module.id); const Icon = item.icon; return <article key={module.id}><button type="button" onClick={() => editModule(module.id)}><Icon weight="duotone" /><span><strong>{item.name}</strong><small>{item.description}</small></span><ArrowRight /></button><button className={module.placement === 'home' ? 'on-home' : ''} type="button" onClick={() => moveModule(module.id, module.placement === 'home' ? 'sidebar' : 'home')}>{module.placement === 'home' ? '移出首页' : '放到首页'}</button></article> })}</div></section>
                <button className="secondary-button wide-button" type="button" onClick={() => setPanel('market')}><SquaresFour weight="duotone" /> 去模块市场添加更多</button>
              </div>
            )}

            {editorModuleId && (
              <div className="drawer-body">
                <div className="seed-notice"><Sparkle weight="duotone" /><div><strong>这些内容是谁加的？</strong><p>职业包只在第一次提供示例，帮你快速上手。现在起每一条都属于你，可以修改、删除或新增。</p></div></div>
                <div className="module-editor-toolbar">
                  <button className="secondary-button" type="button" onClick={() => moveModule(editorModuleId, workspace.modules.find((module) => module.id === editorModuleId)?.placement === 'home' ? 'sidebar' : 'home')}>{workspace.modules.find((module) => module.id === editorModuleId)?.placement === 'home' ? <SidebarSimple /> : <SquaresFour />}{workspace.modules.find((module) => module.id === editorModuleId)?.placement === 'home' ? '只放侧边栏' : '添加到首页'}</button>
                  <button className="secondary-button" type="button" onClick={() => resizeModule(editorModuleId)}><ArrowsOutSimple /> 切换尺寸</button>
                </div>

                {editorModuleId === 'weather' && (
                  <section><h3>城市与天气缓存</h3><div className="weather-editor"><label>城市<input value={workspaceData.weather.city} onChange={(event) => updateData({ ...workspaceData, weather: { ...workspaceData.weather, city: event.target.value } })} placeholder="例如：杭州" /></label><button className="primary-button" type="button" onClick={() => refreshWeather()}><CloudSun /> 联网更新</button></div>{weatherStatus && <p className="sync-status">{weatherStatus}</p>}<p className="section-copy">更新使用 Open-Meteo；断网时仍显示最近一次缓存，不会影响其他模块。</p></section>
                )}

                {editorModuleId === 'quick-note' && (
                  <section><h3>随手记</h3><textarea className="prompt-box note-editor" value={workspaceData.quickNote} onChange={(event) => updateData({ ...workspaceData, quickNote: event.target.value })} placeholder="写下不想忘记的事" /></section>
                )}

                {editorModuleId === 'focus' && (
                  <section><h3>专注设置</h3><div className="editor-grid"><label>专注主题<input value={workspaceData.focus.subject} onChange={(event) => updateData({ ...workspaceData, focus: { ...workspaceData.focus, subject: event.target.value } })} /></label><label>分钟数<input type="number" min="1" max="180" value={workspaceData.focus.minutes} onChange={(event) => setFocusPreset(Number(event.target.value) || 25)} /></label></div></section>
                )}

                {editorModuleId === 'review' && (
                  <section><h3>今天的复盘</h3><div className="editor-grid one-column"><label>做得好的<input value={workspaceData.review.win} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, win: event.target.value } })} /></label><label>卡点<input value={workspaceData.review.blocker} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, blocker: event.target.value } })} /></label><label>明天第一步<input value={workspaceData.review.next} onChange={(event) => updateData({ ...workspaceData, review: { ...workspaceData.review, next: event.target.value } })} /></label></div></section>
                )}

                {editorModuleId === 'analytics' && (
                  <section><h3>本周每天投入</h3><div className="week-editor">{workspaceData.week.map((value, index) => <label key={weekLabels[index]}><span>{weekLabels[index]} · {value}%</span><input type="range" min="0" max="100" value={value} onChange={(event) => updateData({ ...workspaceData, week: workspaceData.week.map((item, itemIndex) => itemIndex === index ? Number(event.target.value) : item) })} /></label>)}</div></section>
                )}

                {editorModuleId === 'period' && (
                  <section><h3>周期记录</h3><div className="editor-grid"><label>上次来潮<input type="date" value={workspaceData.period?.lastPeriod || ''} onChange={(event) => updateData({ ...workspaceData, period: { ...workspaceData.period, lastPeriod: event.target.value } })} /></label><label>周期天数<input type="number" min="1" max="60" value={workspaceData.period?.cycleDays || 28} onChange={(event) => updateData({ ...workspaceData, period: { ...workspaceData.period, cycleDays: Number(event.target.value) || 28 } })} /></label></div><p className="section-copy">修改后会自动重新计算预计下次来潮日期。</p></section>
                )}

                {editorSpec && (
                  <section><div className="section-title-row"><div><h3>条目管理</h3><p>修改后会立即保存在当前设备。</p></div><button className="secondary-button compact-button" type="button" onClick={() => addArrayItem(editorSpec)}><Plus /> 新增一条</button></div><div className="entry-editor-list">{(workspaceData[editorSpec.key] || []).map((item, index) => <article key={item.id || `${editorSpec.key}-${index}`}><div className="editor-grid">{editorSpec.fields.map((field) => <label key={field.key}>{field.label}<input type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} max={field.type === 'number' && field.key === 'progress' ? 100 : undefined} value={field.type === 'date' ? String(item[field.key] || '').slice(0, 10) : (item[field.key] ?? '')} onChange={(event) => updateArrayItem(editorSpec, index, field.key, field.type === 'number' ? Number(event.target.value) : field.type === 'date' ? (event.target.value ? new Date(`${event.target.value}T12:00:00`).toISOString() : '') : event.target.value)} /></label>)}</div><button className="delete-entry" type="button" onClick={() => deleteArrayItem(editorSpec, index)}><Trash /> 删除</button></article>)}</div><button className="primary-button wide-button" type="button" onClick={() => addArrayItem(editorSpec)}><Plus /> 新增一条</button></section>
                )}
              </div>
            )}

            {panel === 'studio' && (
              <div className="drawer-body">
                <section>
                  <h3>1. 先让它像你</h3>
                  <div className="profile-editor">
                    <div className="profile-preview"><span className="avatar avatar-large"><ProfileAvatar workspace={workspace} workspaceData={workspaceData} pack={pack} large /></span><div><strong>{workspace.profile?.displayName}</strong><small>{workspace.name}</small></div></div>
                    <div className="profile-fields"><label>怎么称呼你<input value={workspace.profile?.displayName || ''} maxLength="24" onChange={(event) => updateProfile('displayName', event.target.value)} placeholder="例如：小鹿、小王老师" /></label><label>工作台名称<input value={workspace.name} maxLength="80" onChange={(event) => updateWorkspaceName(event.target.value)} /></label></div>
                    <div className="avatar-picker">{avatarPresets.map((item) => { const Icon = item.icon || pack.icon; return <button className={!workspaceData.profileImage && item.id === workspace.profile?.avatarId ? 'selected' : ''} type="button" key={item.id} onClick={() => chooseAvatar(item.id)}><Icon weight="duotone" /><span>{item.name}</span></button> })}<button className={workspaceData.profileImage ? 'selected' : ''} type="button" onClick={() => avatarInputRef.current?.click()}><ProfileAvatar workspace={workspace} workspaceData={workspaceData} pack={pack} /><span>上传照片</span></button><input ref={avatarInputRef} className="visually-hidden" type="file" accept="image/*" onChange={uploadAvatar} /></div>
                  </div>
                </section>
                <section><h3>2. 选择职业包（会一起更换主题和模块）</h3><div className="pack-grid">{packs.map((item) => { const Icon = item.icon; return <button className={item.id === pack.id ? 'selected' : ''} type="button" key={item.id} onClick={() => choosePack(item)}><Icon weight="duotone" /><span><strong>{item.name}</strong><small>{item.description}</small><i>{item.theme.name}</i></span></button> })}</div></section>
                <section><h3>3. 单独调整整体感觉</h3><div className="theme-grid">{themeCatalog.map((item) => <button className={item.id === theme.id ? 'selected' : ''} type="button" key={item.id} onClick={() => changeTheme(item)}><i style={{ background: item.accent }}></i><span><strong>{item.name}</strong><small>{item.description}</small></span>{item.id === theme.id && <Check weight="bold" />}</button>)}</div></section>
                <section><h3>4. 用一句话调整重点</h3><textarea className="prompt-box" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="例如：我是大学生，想管课程和作业；或 我是自由职业者，想管客户和现金流" />{interpreted && (interpreted.addedNames.length || interpreted.packName) && <p className="interpreted-hint"><Sparkle weight="duotone" />{interpreted.packName ? `将切换到「${interpreted.packName}」` : '将保持当前身份'}{interpreted.addedNames.length ? `，并加入：${interpreted.addedNames.join('、')}` : '，模块组合保持不变'}。</p>}<button className="primary-button wide-button" type="button" onClick={rebuildFromPrompt}><Sparkle weight="fill" /> 按这句话重新搭配</button></section>
              </div>
            )}

            {panel === 'market' && (
              <div className="drawer-body">
                <div className="market-toolbar"><p>{marketStatus}</p><button className="secondary-button" type="button" onClick={refreshMarket}><ArrowClockwise /> 联网检查更新</button></div>
                <section><h3>内置模块 · 离线可用</h3><div className="module-market">{moduleCatalog.filter((item) => item.category !== '系统').map((item) => { const Icon = item.icon; const enabled = activeModuleIds.has(item.id); return <button className={enabled ? 'enabled' : ''} type="button" key={item.id} onClick={() => persistWorkspace(toggleModule(workspace, item.id))}><Icon weight="duotone" /><span><strong>{item.name}</strong><small>{item.description}</small></span><i>{enabled ? '已添加' : '添加'}</i></button> })}</div></section>
                <section><div className="section-title-row"><div><h3>社区模板与模块</h3><p>职业包、布局、主题、模块组合和单模块分开投稿。</p></div><span>{marketEntries.length} 个条目</span></div><div className="community-list">{marketEntries.map((entry) => { const kindNames = { 'career-pack': '职业包', 'layout-template': '布局模板', 'theme-pack': '主题包', 'module-bundle': '模块组合', module: '单模块', 'template-pack': '模块组合' }; return <article key={`${entry.kind}-${entry.id}`}><div><span className="community-kind">{kindNames[entry.kind] || '社区作品'}</span><strong>{entry.name}</strong><small>{entry.description}</small><em>{entry.permissions?.length ? `权限：${entry.permissions.join('、')}` : '无需额外权限'}</em></div><aside><a href={`https://github.com/${entry.source.repository}/blob/${entry.source.ref}/${entry.source.path}`} target="_blank" rel="noreferrer">看源码</a><button type="button" onClick={() => installMarketEntry(entry)}>添加</button></aside></article> })}</div></section>
                <div className="ecosystem-callout"><StackSimple weight="duotone" /><div><strong>把你的工作台贡献给更多人</strong><p>职业模板、模块创意和连接器都通过 GitHub PR 进入公共目录；每次更新都可追溯、可回滚。</p><span><a href="https://github.com/diyiwuyan/onebench/blob/main/docs/CONTRIBUTING.md" target="_blank" rel="noreferrer">贡献模板</a><a href="https://github.com/diyiwuyan/onebench/blob/main/docs/MODULES.md" target="_blank" rel="noreferrer">贡献模块</a></span></div></div>
              </div>
            )}

            {panel === 'sync' && (
              <div className="drawer-body">
                <div className="simple-callout"><LockKey weight="duotone" /><div><strong>默认不需要配置</strong><p>只在这台电脑用，直接下载 HTML 即可。只有需要手机和多台电脑同步时，才开启下面的高级方案。</p></div></div>
                <div className="sync-levels"><article className="active"><span>1</span><div><strong>本机保存</strong><small>默认开启 · 不联网</small></div></article><article className={connection.owner && connection.repo ? 'active' : ''}><span>2</span><div><strong>配置同步</strong><small>主题、身份和模块</small></div></article><article className={connection.syncContent ? 'active' : ''}><span>3</span><div><strong>内容同步</strong><small>待办、记录和进度</small></div></article></div>
                <section><h3>加密迁移包 · 不需要账号</h3><p className="section-copy">适合换电脑或手动备份。文件包含工作台配置和个人内容，使用 AES-GCM 在本机加密。</p><div className="backup-row"><input type="password" value={backupPassphrase} onChange={(event) => setBackupPassphrase(event.target.value)} placeholder="设置至少 8 位口令" /><button className="secondary-button" type="button" onClick={downloadEncryptedBackup}><DownloadSimple /> 下载备份</button><button className="secondary-button" type="button" onClick={() => backupInputRef.current?.click()}><CloudArrowDown /> 恢复备份</button><input ref={backupInputRef} className="visually-hidden" type="file" accept="application/json" onChange={restoreEncryptedBackup} /></div>{backupStatus && <p className="sync-status">{backupStatus}</p>}</section>
                <section><div className="section-title-row"><div><h3>连接你自己的私有仓库</h3><p>{connection.lastSyncedAt ? `上次同步：${new Date(connection.lastSyncedAt).toLocaleString('zh-CN')}` : '尚未同步'}</p></div></div><div className="sync-fields"><label>GitHub 用户名<input value={connection.owner} onChange={(event) => changeConnection('owner', event.target.value)} placeholder="你的 GitHub 用户名" /></label><label>私有仓库名<input value={connection.repo} onChange={(event) => changeConnection('repo', event.target.value)} placeholder="my-onebench-data" /></label><label className="full-field">Fine-grained token<input type="password" value={connection.token} onChange={(event) => changeConnection('token', event.target.value)} placeholder="只授予该私有仓库 Contents 读写权限" /></label></div><label className="check-line"><input type="checkbox" checked={connection.syncContent} onChange={(event) => changeConnection('syncContent', event.target.checked)} />同时同步个人待办、记录、头像和进度（仅限私有仓库）</label><div className="sync-actions"><button className="primary-button" type="button" disabled={syncing} onClick={pushToGitHub}><CloudArrowUp /> 保存到云端</button><button className="secondary-button" type="button" disabled={syncing} onClick={pullFromGitHub}><CloudArrowDown /> 从云端恢复</button></div>{syncStatus && <p className="sync-status">{syncStatus}</p>}</section>
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
