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
  ListChecks,
  LockKey,
  NotePencil,
  Plus,
  Sparkle,
  StackSimple,
  Target,
} from '@phosphor-icons/react'
import { moduleCatalog, findModule } from './data/modules'
import { findPack, packs, packModuleIds } from './data/packs'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from './lib/backup'
import { pullWorkspaceFromGitHub, pushWorkspaceToGitHub } from './lib/github'
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
import phonePreview from './assets/exam-phone-preview.png'
import './styles.css'

const days = [['一', '28'], ['二', '29'], ['三', '30'], ['四', '31'], ['五', '1'], ['六', '2'], ['日', '3']]
const themes = [
  { id: 'paper-plum', name: '纸感梅子', color: '#633d61' },
  { id: 'sage-paper', name: '鼠尾草纸', color: '#657c60' },
  { id: 'ink-blue', name: '墨蓝', color: '#506b88' },
]

function readConnection() {
  try {
    return JSON.parse(localStorage.getItem(GITHUB_STORAGE_KEY)) ?? { owner: '', repo: '', branch: 'main', path: 'workspace.json', token: '' }
  } catch {
    return { owner: '', repo: '', branch: 'main', path: 'workspace.json', token: '' }
  }
}

function downloadFile(name, text) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

export function App() {
  const restoredWorkspace = useMemo(loadWorkspace, [])
  const [selectedId, setSelectedId] = useState(restoredWorkspace?.sourcePack || 'postgraduate-exam')
  const [prompt, setPrompt] = useState(restoredWorkspace?.intent || findPack('postgraduate-exam').prompt)
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
  const importInput = useRef(null)
  const encryptedImportInput = useRef(null)

  const selected = useMemo(() => findPack(selectedId), [selectedId])
  const activeWorkspace = workspace ?? createWorkspace({ packId: selectedId, prompt })
  const activeModuleIds = activeWorkspace.modules.map((module) => module.id)
  const previewModules = activeModuleIds.slice(0, 3).map(findModule).filter(Boolean)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined)
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
      saveConnection({ ...connection, lastSha: sha || connection.lastSha })
      setSyncStatus('已推送 workspace.json；个人待办数据未上传。')
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
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#create" aria-label="一句工作台首页">
          <span className="brand-mark"><StackSimple weight="fill" /></span><strong>一句工作台</strong>
        </a>
        <nav aria-label="主导航">
          <a href="#create">灵感</a><a href="#packs">模板</a><a href="#workbench">我的工作台</a>
        </nav>
        <a className="avatar" href="#workbench" aria-label="打开工作台">我</a>
      </header>

      <section className="hero" id="create">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkle weight="fill" /> 从一句话开始</p>
          <h1>今天，想让什么变得更轻松？</h1>
          <p className="intro">描述你的身份、目标和习惯。我们会把它整理成一套可以长期使用的个人工作台。</p>
          <label className="prompt-box" htmlFor="workbench-prompt">
            <span>告诉我你的需求</span>
            <textarea id="workbench-prompt" value={prompt} maxLength={200} onChange={(event) => { setPrompt(event.target.value); setIsGenerated(false) }} />
            <small>{prompt.length}/200</small>
          </label>
          <div className="actions-row">
            <div className="scenario-row" aria-label="选择场景">
              {packs.slice(0, 3).map((pack) => {
                const PackIcon = pack.icon
                return <button className={`scenario-chip${pack.id === selectedId ? ' is-active' : ''}`} key={pack.id} type="button" onClick={() => selectPack(pack)}><PackIcon weight={pack.id === selectedId ? 'fill' : 'regular'} />{pack.name}</button>
              })}
              <button className="more-packs" type="button" onClick={() => setShowAllPacks((value) => !value)}>{showAllPacks ? '收起场景' : '+ 5 个场景'}</button>
            </div>
            <button className="generate-button" type="button" onClick={generateWorkbench} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? <CircleNotch className="spin" /> : <Sparkle weight="fill" />}{isGenerating ? '正在整理你的工作台…' : '先帮我搭一个'}{!isGenerating && <ArrowRight weight="bold" />}
            </button>
          </div>
          {showAllPacks && <div className="pack-picker" id="packs">{packs.slice(3).map((pack) => { const PackIcon = pack.icon; return <button type="button" key={pack.id} onClick={() => { selectPack(pack); setShowAllPacks(false) }}><PackIcon weight="fill" /><span>{pack.name}</span><small>{pack.description}</small></button> })}</div>}
          {isGenerated && <p className="success-note"><CheckCircle weight="fill" /> 已生成并保存到这台设备，可继续调整模块与风格。</p>}
        </div>

        <section className={`plan-card${isGenerated ? ' is-generated' : ''}`} aria-label="生成的工作台预览">
          <div className="plan-card-head"><div><p>{selected.name} · 可编辑工作台</p><h2>{activeWorkspace.name}</h2></div><span className="date-pill">本地优先 · 已保存</span></div>
          <div className="plan-card-body"><div className="plan-card-content">
            <div className="week-strip" aria-label="本周计划">{days.map(([weekday, date]) => <div className={date === '30' ? 'is-today' : ''} key={date}><span>{weekday}</span><strong>{date}</strong></div>)}</div>
            <div className="focus-area"><div className="section-label"><Target weight="fill" /> 已装入的核心模块</div>{previewModules.map((module) => { const ModuleIcon = module.icon; return <div className="focus-row" key={module.id}><ModuleIcon weight="fill" /><strong>{module.name}</strong><small>{module.description}</small></div> })}</div>
            <div className="plan-progress"><div><span><CheckCircle weight="fill" /> 工作台配置</span><strong>{activeModuleIds.length} 个模块已启用</strong></div><span className="progress-track"><i style={{ width: `${Math.min(100, activeModuleIds.length * 12)}%` }} /></span></div>
            <a className="plan-link" href="#workbench"><GearSix weight="bold" /> 打开我的工作台 <ArrowRight weight="bold" /></a>
          </div><img className="phone-preview" src={phonePreview} alt="手机端工作台预览" /></div>
        </section>
      </section>

      <section className="template-strip" aria-label="场景模板"><div><BookOpenText weight="fill" /><span>不是从空白开始</span></div><p>每个场景包都复用同一套模块、主题与同步协议；社区只需贡献配置，不必复制整套应用。</p><ul><li><CalendarBlank weight="bold" /> 日历待办</li><li><ListChecks weight="bold" /> 模块注册</li><li><GithubLogo weight="fill" /> GitHub 配置同步</li></ul></section>

      <section className="workbench" id="workbench" aria-labelledby="workbench-title">
        <div className="workbench-heading"><div><p>今天的工作台</p><h2 id="workbench-title">{workspace ? workspace.name : '先生成你的工作台'}</h2></div><a href="#studio"><GearSix weight="bold" /> 调整模块与同步</a></div>
        {workspace && workspaceData ? <div className="workbench-grid">
          <section className="daily-card tasks-card"><div className="card-title"><div><CheckCircle weight="fill" /><h3>今日待办</h3></div><span>{workspaceData.tasks.filter((task) => task.done).length}/{workspaceData.tasks.length}</span></div><div className="task-list">{workspaceData.tasks.map((task) => <label key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span>{task.title}</span></label>)}</div><form onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="添加一件要做的事" /><button type="submit" aria-label="添加待办"><Plus weight="bold" /></button></form></section>
          <section className="daily-card note-card"><div className="card-title"><div><NotePencil weight="fill" /><h3>快速记录</h3></div><span>本地保存</span></div><textarea value={workspaceData.quickNote} onChange={(event) => updateWorkspaceData({ ...workspaceData, quickNote: event.target.value })} placeholder="记下一点灵感、会议纪要或今天的复盘…" /></section>
          <section className="daily-card module-card"><div className="card-title"><div><StackSimple weight="fill" /><h3>今天可用</h3></div></div><div className="daily-modules">{activeModuleIds.map(findModule).filter(Boolean).slice(0, 6).map((module) => { const ModuleIcon = module.icon; return <span key={module.id}><ModuleIcon weight="fill" />{module.name}</span> })}</div></section>
          <section className="daily-card install-card"><div className="card-title"><div><DeviceMobile weight="fill" /><h3>电脑与手机都能用</h3></div></div><p>数据默认留在设备；用 GitHub 恢复工作台配置。手机可通过浏览器“添加到主屏幕”。</p>{installPrompt ? <button type="button" onClick={installApp}><DownloadSimple weight="bold" /> 安装为应用</button> : <span className="install-hint">iPhone：Safari 分享菜单 → 添加到主屏幕</span>}</section>
        </div> : <div className="empty-workbench"><Sparkle weight="fill" /><p>从上面选择一个场景，输入一句需求后即可创建。</p><a href="#create">去创建 <ArrowUp weight="bold" /></a></div>}
      </section>

      <section className="studio" id="studio" aria-labelledby="studio-title">
        <div className="studio-intro"><p>Phase 0 + 1 · 开源基础版</p><h2 id="studio-title">把工作台变成你自己的</h2><span>配置存于本地浏览器；同步时只上传工作台结构和设置。</span></div>
        <div className="studio-grid">
          <section className="studio-card modules-card"><div className="card-title"><div><Plus weight="bold" /><h3>模块管理</h3></div><span>{activeModuleIds.length} / {moduleCatalog.length}</span></div><div className="module-list">{moduleCatalog.map((module) => { const ModuleIcon = module.icon; const enabled = activeModuleIds.includes(module.id); return <button type="button" className={enabled ? 'enabled' : ''} key={module.id} onClick={() => updateWorkspace(toggleModule(activeWorkspace, module.id))}><ModuleIcon weight={enabled ? 'fill' : 'regular'} /><span><strong>{module.name}</strong><small>{module.description}</small></span><i>{enabled ? '已启用' : '添加'}</i></button> })}</div></section>

          <section className="studio-card theme-card"><div className="card-title"><div><Sparkle weight="fill" /><h3>主题与布局</h3></div></div><div className="theme-list">{themes.map((theme) => <button key={theme.id} type="button" onClick={() => changeTheme(theme)} className={activeWorkspace.theme.id === theme.id ? 'selected' : ''}><i style={{ background: theme.color }} /><span>{theme.name}</span>{activeWorkspace.theme.id === theme.id && <CheckCircle weight="fill" />}</button>)}</div><p className="muted">当前主题会写入 `workspace.json`，模板贡献者可提供自己的主题令牌。</p></section>

          <section className="studio-card sync-card"><div className="card-title"><div><GithubLogo weight="fill" /><h3>GitHub 配置同步</h3></div><span className="local-tag">可选</span></div><p className="muted">仅同步工作台配置，不上传待办、笔记或日历数据。</p><div className="sync-fields"><label>GitHub 用户名<input value={connection.owner} onChange={(event) => updateConnection('owner', event.target.value)} placeholder="octocat" /></label><label>仓库名<input value={connection.repo} onChange={(event) => updateConnection('repo', event.target.value)} placeholder="my-workbench" /></label><label>分支<input value={connection.branch} onChange={(event) => updateConnection('branch', event.target.value)} placeholder="main" /></label><label>配置路径<input value={connection.path} onChange={(event) => updateConnection('path', event.target.value)} placeholder="workspace.json" /></label><label className="token-field"><LockKey weight="fill" /> Fine-grained token<input type="password" value={connection.token} onChange={(event) => updateConnection('token', event.target.value)} placeholder="Contents: Read and write" /></label></div><div className="sync-actions"><button type="button" onClick={pullFromGitHub} disabled={isSyncing}><CloudArrowDown weight="bold" /> 拉取配置</button><button type="button" className="primary-sync" onClick={() => pushToGitHub()} disabled={isSyncing}>{isSyncing ? <CircleNotch className="spin" /> : <CloudArrowUp weight="bold" />} 推送配置</button></div>{syncConflict && <div className="conflict-actions"><strong>检测到另一台设备的更新</strong><button type="button" onClick={pullFromGitHub}>采用远端</button><button type="button" onClick={() => pushToGitHub(true)}>覆盖远端</button></div>}{syncStatus && <p className="sync-status">{syncStatus}</p>}</section>

          <section className="studio-card export-card"><div className="card-title"><div><FloppyDisk weight="fill" /><h3>备份与恢复</h3></div></div><p className="muted">标准 JSON 配置可在任意一句工作台实例中恢复。需要带走配置时，可用本地口令生成 AES-GCM 加密文件。</p><div className="export-actions"><button type="button" onClick={() => downloadFile('workspace.json', exportWorkspace(activeWorkspace))}><DownloadSimple weight="bold" /> 导出 workspace.json</button><button type="button" onClick={() => importInput.current?.click()}><FileArrowUp weight="bold" /> 导入配置</button><input ref={importInput} type="file" accept="application/json" onChange={importWorkspace} hidden /></div><div className="backup-crypto"><input type="password" value={backupPassphrase} onChange={(event) => setBackupPassphrase(event.target.value)} placeholder="至少 8 位备份口令" /><button type="button" onClick={exportEncryptedBackup}>导出加密备份</button><button type="button" onClick={() => encryptedImportInput.current?.click()}>恢复加密备份</button><input ref={encryptedImportInput} type="file" accept="application/json" onChange={importEncryptedBackup} hidden /></div></section>
        </div>
      </section>
    </main>
  )
}
