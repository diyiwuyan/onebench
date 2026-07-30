import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowClockwise,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpenText,
  CalendarBlank,
  CheckCircle,
  CircleNotch,
  CloudArrowDown,
  CloudArrowUp,
  DeviceMobile,
  DownloadSimple,
  FileArrowUp,
  FloppyDisk,
  GithubLogo,
  GearSix,
  House,
  ListChecks,
  LockKey,
  MagnifyingGlass,
  Monitor,
  NotePencil,
  Plus,
  Sparkle,
  SquaresFour,
  StackSimple,
  Target,
} from '@phosphor-icons/react'
import { moduleCatalog, findModule } from './data/modules'
import { findPack, packs, packModuleIds } from './data/packs'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from './lib/backup'
import { pullWorkspaceDataFromGitHub, pullWorkspaceFromGitHub, pushWorkspaceDataToGitHub, pushWorkspaceToGitHub } from './lib/github'
import { exportDesktopHtml } from './lib/local-export'
import { loadWorkspaceData, saveWorkspaceData } from './lib/local-data'
import {
  GITHUB_STORAGE_KEY,
  createWorkspace,
  exportWorkspace,
  loadWorkspace,
  normalizeWorkspace,
  saveWorkspace,
  toggleModule,
} from './lib/workspace'
import './styles.css'

const days = [['一', '28'], ['二', '29'], ['三', '30'], ['四', '31'], ['五', '1'], ['六', '2'], ['日', '3']]
const themes = [
  { id: 'paper-plum', name: '纸感梅子', color: '#633d61' },
  { id: 'sage-paper', name: '鼠尾草纸', color: '#657c60' },
  { id: 'ink-blue', name: '墨蓝', color: '#506b88' },
]

const registryUrl = 'https://raw.githubusercontent.com/diyiwuyan/onebench/main/packages/community-registry/registry.json'

function readConnection() {
  try {
    return { dataPath: 'workspace-data.json', syncContent: false, ...JSON.parse(localStorage.getItem(GITHUB_STORAGE_KEY)) }
  } catch {
    return { owner: '', repo: '', branch: 'main', path: 'workspace.json', dataPath: 'workspace-data.json', syncContent: false, token: '' }
  }
}

function downloadFile(name, text, type = 'application/json') {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([text], { type }))
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

export function App() {
  const restoredWorkspace = useMemo(loadWorkspace, [])
  const [selectedId, setSelectedId] = useState(restoredWorkspace?.sourcePack || 'university')
  const [prompt, setPrompt] = useState(restoredWorkspace?.intent || findPack('university').prompt)
  const [workspace, setWorkspace] = useState(restoredWorkspace)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(Boolean(restoredWorkspace))
  const [showAllPacks, setShowAllPacks] = useState(false)
  const [connection, setConnection] = useState(readConnection)
  const [syncStatus, setSyncStatus] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncConflict, setSyncConflict] = useState(false)
  const [workspaceData, setWorkspaceData] = useState(() => restoredWorkspace ? loadWorkspaceData(restoredWorkspace) : null)
  const [newTask, setNewTask] = useState('')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [backupPassphrase, setBackupPassphrase] = useState('')
  const [now, setNow] = useState(new Date())
  const [marketEntries, setMarketEntries] = useState([])
  const [marketStatus, setMarketStatus] = useState('公共模块目录尚未连接')
  const importInput = useRef(null)
  const encryptedImportInput = useRef(null)

  const selected = useMemo(() => findPack(selectedId), [selectedId])
  const activeWorkspace = workspace ?? createWorkspace({ packId: selectedId, prompt })
  const activeModuleIds = activeWorkspace.modules.map((module) => module.id)
  const previewModules = activeModuleIds.slice(0, 6).map(findModule).filter(Boolean)

  useEffect(() => {
    if (!import.meta.env.ONEBENCH_EXTENSION && 'serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  useEffect(() => {
    if (workspace) setWorkspaceData(loadWorkspaceData(workspace))
  }, [workspace?.id])

  function persist(next) {
    const saved = saveWorkspace(next)
    setWorkspace(saved)
    setIsGenerated(true)
    return saved
  }

  function selectPack(pack) {
    setSelectedId(pack.id)
    setPrompt(pack.prompt)
    setIsGenerated(false)
  }

  function generateWorkbench() {
    if (!prompt.trim()) return
    setIsGenerating(true)
    window.setTimeout(() => {
      persist(createWorkspace({ packId: selectedId, prompt }))
      setIsGenerating(false)
    }, 550)
  }

  function updateWorkspace(next) {
    persist(next)
  }

  function updateWorkspaceData(next) {
    if (!workspace) return
    setWorkspaceData(saveWorkspaceData(workspace, next))
  }

  function downloadLocalWorkbench() {
    const data = workspaceData || loadWorkspaceData(activeWorkspace)
    downloadFile(`${activeWorkspace.name}.html`, exportDesktopHtml(activeWorkspace, data), 'text/html;charset=utf-8')
    setSyncStatus('已下载本地 HTML。把文件移到桌面后双击即可打开。')
  }

  async function refreshModuleMarket() {
    setMarketStatus('正在联网更新公共模块目录…')
    try {
      const response = await fetch(registryUrl)
      if (!response.ok) throw new Error(`目录更新失败（${response.status}）`)
      const registry = await response.json()
      const entries = [...(registry.templates || []), ...(registry.modules || [])]
      setMarketEntries(entries)
      setMarketStatus(`已联网更新：${entries.length} 个公共条目`)
    } catch (error) {
      setMarketStatus(error.message || '当前无法连接公共模块目录。')
    }
  }

  function installMarketEntry(entry) {
    const required = Array.isArray(entry.requires) ? entry.requires.filter((id) => findModule(id)) : []
    if (!required.length) {
      setMarketStatus('该条目需要先由智能体审阅并合入源码，不能在浏览器中直接执行远程代码。')
      return
    }
    const ids = new Set([...activeModuleIds, ...required])
    updateWorkspace({ ...activeWorkspace, modules: [...ids].map((id) => ({ id, enabled: true })) })
    setMarketStatus(`已添加「${entry.name}」需要的 ${required.length} 个模块。`)
  }

  function addTask(event) {
    event.preventDefault()
    if (!newTask.trim() || !workspaceData) return
    updateWorkspaceData({ ...workspaceData, tasks: [...workspaceData.tasks, { id: crypto.randomUUID(), title: newTask.trim(), done: false }] })
    setNewTask('')
  }

  function toggleTask(taskId) {
    if (!workspaceData) return
    updateWorkspaceData({ ...workspaceData, tasks: workspaceData.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) })
  }

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  function changeTheme(theme) {
    updateWorkspace({ ...activeWorkspace, theme: { ...activeWorkspace.theme, id: theme.id, name: theme.name, accent: theme.color } })
  }

  function updateConnection(field, value) {
    const next = { ...connection, [field]: value }
    saveConnection(next)
  }

  function saveConnection(next) {
    setConnection(next)
    localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(next))
  }

  async function pushToGitHub(force = false) {
    if (!connection.owner || !connection.repo || !connection.token) {
      setSyncStatus('请先填写 GitHub 用户名、仓库名和 Fine-grained token。')
      return
    }
    setIsSyncing(true)
    setSyncConflict(false)
    setSyncStatus('正在推送配置…')
    try {
      const sha = await pushWorkspaceToGitHub(connection, activeWorkspace, { lastSha: connection.lastSha, force })
      if (connection.syncContent && workspaceData) await pushWorkspaceDataToGitHub(connection, workspaceData)
      saveConnection({ ...connection, lastSha: sha || connection.lastSha })
      setSyncStatus(connection.syncContent ? '已推送工作台配置和加密前的个人内容文件。请只连接自己的私有仓库。' : '已推送 workspace.json；个人待办数据仍只保存在本机。')
    } catch (error) {
      setSyncConflict(error.code === 'SYNC_CONFLICT')
      setSyncStatus(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function pullFromGitHub() {
    if (!connection.owner || !connection.repo || !connection.token) {
      setSyncStatus('请先填写 GitHub 用户名、仓库名和 Fine-grained token。')
      return
    }
    setIsSyncing(true)
    setSyncStatus('正在拉取配置…')
    try {
      const remote = await pullWorkspaceFromGitHub(connection)
      const next = normalizeWorkspace(remote.workspace)
      setSelectedId(next.sourcePack)
      setPrompt(next.intent)
      persist(next)
      if (connection.syncContent) {
        const remoteData = await pullWorkspaceDataFromGitHub(connection)
        if (remoteData?.data) setWorkspaceData(saveWorkspaceData(next, remoteData.data))
      }
      saveConnection({ ...connection, lastSha: remote.sha })
      setSyncConflict(false)
      setSyncStatus('已从 GitHub 恢复配置。')
    } catch (error) {
      setSyncStatus(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function importWorkspace(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const next = normalizeWorkspace(JSON.parse(await file.text()))
      setSelectedId(next.sourcePack)
      setPrompt(next.intent)
      persist(next)
      setSyncStatus('已导入本地配置。')
    } catch (error) {
      setSyncStatus(error.message)
    } finally {
      event.target.value = ''
    }
  }

  async function exportEncryptedBackup() {
    try {
      const encrypted = await encryptWorkspaceBackup(activeWorkspace, backupPassphrase)
      downloadFile('workspace.encrypted.json', JSON.stringify(encrypted, null, 2))
      setSyncStatus('已导出 AES-GCM 加密备份。请妥善保存口令。')
    } catch (error) {
      setSyncStatus(error.message)
    }
  }

  async function importEncryptedBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const next = normalizeWorkspace(await decryptWorkspaceBackup(JSON.parse(await file.text()), backupPassphrase))
      setSelectedId(next.sourcePack)
      setPrompt(next.intent)
      persist(next)
      setSyncStatus('已从加密备份恢复配置。')
    } catch (error) {
      setSyncStatus(error.message)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="dashboard-shell">
      <aside className="rail" aria-label="工作台导航"><a className="rail-logo" href="#home"><StackSimple weight="fill" /></a><nav><a className="is-active" href="#home"><House weight="fill" /><span>主页</span></a><a href="#market"><SquaresFour weight="fill" /><span>模块市场</span></a><a href="#sync"><GithubLogo weight="fill" /><span>同步</span></a><a href="#help"><GearSix weight="fill" /><span>设置</span></a></nav><button type="button" onClick={downloadLocalWorkbench} title="下载本地 HTML"><DownloadSimple weight="bold" /></button></aside>
      <section className="dashboard" id="home">
        <header className="dashboard-top"><div className="identity"><span className="avatar">我</span><div><strong>{selected.name}</strong><small>{isGenerated ? '本地已保存' : '选择身份后即可开始'}</small></div></div><div className="top-actions"><button type="button" onClick={downloadLocalWorkbench}><Monitor weight="bold" /> 下载本地版</button><a href="#sync"><CloudArrowUp weight="bold" /> 多端同步</a></div></header>
        <section className="clock-area"><time>{now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</time><p>{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} · {activeWorkspace.name}</p><label className="quick-search"><MagnifyingGlass weight="bold" /><input value={prompt} onChange={(event) => { setPrompt(event.target.value); setIsGenerated(false) }} placeholder="一句话修改你的工作台" /><button type="button" onClick={generateWorkbench}>{isGenerating ? <CircleNotch className="spin" /> : <Sparkle weight="fill" />}{isGenerated ? '更新' : '生成'}</button></label></section>
        <section className="identity-strip" aria-label="身份模板">{packs.map((pack) => { const PackIcon = pack.icon; return <button key={pack.id} type="button" className={pack.id === selectedId ? 'selected' : ''} onClick={() => selectPack(pack)}><PackIcon weight="fill" /><span>{pack.name}</span></button> })}</section>
        <section className="dashboard-grid" aria-label="我的工作台">
          <article className="dash-card schedule-card"><div className="card-title"><span><CalendarBlank weight="fill" /> 今天的节奏</span><small>{selected.name} 默认模块</small></div><div className="week-row">{days.map(([weekday, date]) => <span key={date} className={date === '30' ? 'today' : ''}><b>{weekday}</b>{date}</span>)}</div><p>{selected.description}</p><div className="module-pills">{previewModules.slice(0, 4).map((module) => <span key={module.id}>{module.name}</span>)}</div></article>
          <article className="dash-card task-card"><div className="card-title"><span><CheckCircle weight="fill" /> 待办事项</span><small>{workspaceData ? `${workspaceData.tasks.filter((task) => task.done).length}/${workspaceData.tasks.length}` : '本地版'}</small></div>{workspaceData ? <><div className="task-list">{workspaceData.tasks.map((task) => <label key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span>{task.title}</span></label>)}</div><form onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="添加一件要做的事" /><button type="submit" aria-label="添加待办"><Plus weight="bold" /></button></form></> : <button className="activate" type="button" onClick={generateWorkbench}>启用这个身份包</button>}</article>
          <article className="dash-card note-card"><div className="card-title"><span><NotePencil weight="fill" /> 备忘录</span><small>默认本地保存</small></div>{workspaceData ? <textarea value={workspaceData.quickNote} onChange={(event) => updateWorkspaceData({ ...workspaceData, quickNote: event.target.value })} placeholder="记下一点灵感、会议纪要或今天的复盘…" /> : <p>生成后，这里就是你的随手记；不会上传到任何平台。</p>}</article>
          <article className="dash-card focus-card"><div className="card-title"><span><Target weight="fill" /> 今日焦点</span><small>本地优先</small></div><strong>{activeWorkspace.intent}</strong><p>身份包已经配好公共模块和场景模块，还可以去模块市场继续加。</p><a href="#market">打开模块市场 <ArrowRight weight="bold" /></a></article>
          <article className="dash-card local-card"><div className="card-title"><span><Monitor weight="fill" /> 电脑上直接用</span><small>默认方式</small></div><p>下载一个本地 HTML，放到桌面后双击打开；任务和笔记只保存在这台电脑。</p><button type="button" onClick={downloadLocalWorkbench}><DownloadSimple weight="bold" /> 下载我的本地工作台</button></article>
          <article className="dash-card mobile-card"><div className="card-title"><span><DeviceMobile weight="fill" /> 手机与浏览器</span><small>可选升级</small></div><p>手机：打开网页后选择“添加到主屏幕”。浏览器：构建扩展并加载后，每个新标签页都是工作台。</p><a href="#help">查看使用方式 <ArrowRight weight="bold" /></a></article>
        </section>

        <section className="market" id="market"><div className="section-head"><div><p>模块市场</p><h2>先配好，再随时添加</h2></div><button type="button" onClick={refreshModuleMarket}><ArrowClockwise weight="bold" /> 联网更新目录</button></div><div className="market-grid">{moduleCatalog.map((module) => { const ModuleIcon = module.icon; const enabled = activeModuleIds.includes(module.id); return <button type="button" className={enabled ? 'enabled' : ''} key={module.id} onClick={() => updateWorkspace(toggleModule(activeWorkspace, module.id))}><ModuleIcon weight={enabled ? 'fill' : 'regular'} /><span><strong>{module.name}</strong><small>{module.description}</small></span><i>{enabled ? '已装入' : '添加'}</i></button> })}</div><p className="market-status">{marketStatus}</p>{marketEntries.length > 0 && <div className="community-list">{marketEntries.map((entry) => <article key={entry.id}><div><strong>{entry.name}</strong><small>{entry.description}</small></div><button type="button" onClick={() => installMarketEntry(entry)}>{entry.kind === 'template-pack' ? '添加组合' : '查看更新规则'}</button></article>)}</div>}</section>

        <section className="advanced" id="sync"><div className="section-head"><div><p>高级能力</p><h2>需要时，再打开多端同步</h2></div></div><div className="advanced-grid"><article className="advanced-card sync-card"><div className="card-title"><span><GithubLogo weight="fill" /> 私有仓库同步</span><small>需联网</small></div><p>推荐用自己的私有仓库保存配置；勾选后，待办与备忘录也会同步到该私有仓库，手机和另一台电脑可拉取。</p><div className="sync-fields"><label>GitHub 用户名<input value={connection.owner} onChange={(event) => updateConnection('owner', event.target.value)} placeholder="octocat" /></label><label>私有仓库名<input value={connection.repo} onChange={(event) => updateConnection('repo', event.target.value)} placeholder="my-private-workbench" /></label><label>分支<input value={connection.branch} onChange={(event) => updateConnection('branch', event.target.value)} placeholder="main" /></label><label>内容文件<input value={connection.dataPath} onChange={(event) => updateConnection('dataPath', event.target.value)} placeholder="workspace-data.json" /></label><label className="token-field"><LockKey weight="fill" /> Fine-grained token<input type="password" value={connection.token} onChange={(event) => updateConnection('token', event.target.value)} placeholder="仅授予这个私有仓库 Contents 读写" /></label></div><label className="content-sync"><input type="checkbox" checked={connection.syncContent} onChange={(event) => updateConnection('syncContent', event.target.checked)} /> 同步待办和备忘录内容（仅限自己的私有仓库）</label><div className="sync-actions"><button type="button" onClick={pullFromGitHub} disabled={isSyncing}><CloudArrowDown weight="bold" /> 拉取</button><button type="button" className="primary-sync" onClick={() => pushToGitHub()} disabled={isSyncing}>{isSyncing ? <CircleNotch className="spin" /> : <CloudArrowUp weight="bold" />} 推送</button></div>{syncConflict && <div className="conflict-actions"><strong>检测到另一台设备的更新</strong><button type="button" onClick={pullFromGitHub}>采用远端</button><button type="button" onClick={() => pushToGitHub(true)}>覆盖远端</button></div>}{syncStatus && <p className="sync-status">{syncStatus}</p>}</article>
          <article className="advanced-card" id="help"><div className="card-title"><span><Monitor weight="fill" /> 本地、手机和插件</span><small>怎么用</small></div><ol><li><strong>本地电脑：</strong>下载 HTML，移到桌面，双击打开；Windows 可右键“创建快捷方式”。</li><li><strong>手机：</strong>需要多端时，让智能体发布线上版；Safari／Chrome 菜单选择“添加到主屏幕”。</li><li><strong>浏览器启示页：</strong>在自己的仓库执行 <code>npm run build:extension</code>，打开 <code>chrome://extensions</code>，开启开发者模式，加载 <code>dist/extension</code>。</li></ol><div className="export-actions"><button type="button" onClick={() => downloadFile('workspace.json', exportWorkspace(activeWorkspace))}><FloppyDisk weight="bold" /> 导出配置</button><button type="button" onClick={() => importInput.current?.click()}><FileArrowUp weight="bold" /> 导入配置</button></div><input ref={importInput} type="file" accept="application/json" onChange={importWorkspace} hidden /><div className="backup-crypto"><input type="password" value={backupPassphrase} onChange={(event) => setBackupPassphrase(event.target.value)} placeholder="备份口令" /><button type="button" onClick={exportEncryptedBackup}>加密导出</button><button type="button" onClick={() => encryptedImportInput.current?.click()}>加密恢复</button></div><input ref={encryptedImportInput} type="file" accept="application/json" onChange={importEncryptedBackup} hidden /></article></div></section>
      </section>
    </main>
  )
}
