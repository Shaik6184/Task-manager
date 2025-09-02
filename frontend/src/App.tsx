import { useEffect, useState } from 'react'
import './App.css'
import { createTask, deleteTask, fetchTasks, login, register, toggleTask, updateTask } from './api'
import type { Task } from './api'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM')
  const authed = Boolean(token)

  async function handleLogin() {
    if (!email || !password) return alert('Enter email and password')
    setLoading(true)
    try {
      const { token } = await login(email, password)
      localStorage.setItem('token', token)
      setToken(token)
      await loadTasks()
    } catch (e: any) {
      alert(e?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  async function handleRegister() {
    if (!email || !password) return alert('Enter email and password')
    setLoading(true)
    try {
      const { token } = await register(email, password, name)
      localStorage.setItem('token', token)
      setToken(token)
      await loadTasks()
    } catch (e: any) {
      alert(e?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  async function loadTasks() {
    try {
      const { tasks } = await fetchTasks()
      setTasks(tasks)
    } catch { setTasks([]) }
  }

  async function handleCreate() {
    if (!title.trim()) return
    const { task } = await createTask(title, description, priority)
    setTasks([task, ...tasks])
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setShowModal(false)
  }

  async function handleToggle(id: string) {
    const { task } = await toggleTask(id)
    setTasks(tasks.map(t => t.id === id ? task : t))
  }

  async function handleDelete(id: string) {
    await deleteTask(id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  async function handleUpdate(id: string) {
    const newTitle = prompt('New title?')
    if (!newTitle) return
    const { task } = await updateTask(id, { title: newTitle })
    setTasks(tasks.map(t => t.id === id ? task : t))
  }

  useEffect(() => { if (authed) loadTasks() }, [authed])

  if (!authed) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand big">TaskFlow</div>
          <p className="subtitle">Welcome back! Sign in or create an account.</p>
          <input placeholder="Name (register)" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="auth-actions">
            <button className="btn" disabled={loading} onClick={handleLogin}>Login</button>
            <button className="btn ghost" disabled={loading} onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    )
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    (t.description ?? '').toLowerCase().includes(query.toLowerCase())
  )
  const pending = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  return (
    <div className="site">
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">TaskFlow</div>
          <div className="nav-actions">
            <button className="btn" onClick={() => setShowModal(true)}>+ Add Task</button>
            <button className="btn ghost" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="main">
        <div className="container">
          <div className="hero">
            <h1>Organize your life, one task at a time</h1>
            <p className="subtitle">Search, track progress, and stay productive.</p>
          </div>

          <div className="search-wrap">
            <input className="search" placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          <div className="stats-grid">
            <div className="stat-card shadow"><div className="stat-num">{tasks.length}</div><div>Total Tasks</div></div>
            <div className="stat-card shadow"><div className="stat-num warn">{pending.length}</div><div>Pending</div></div>
            <div className="stat-card shadow"><div className="stat-num ok">{completed.length}</div><div>Completed</div></div>
          </div>

          <div className="section-grid">
            <section>
              <h3><span className="dot warn"/> Pending Tasks ({pending.length})</h3>
              {pending.length === 0 ? (
                <div className="empty shadow"><div className="circle"/>No pending tasks. Great job staying on top of things!</div>
              ) : pending.map(t => (
                <div key={t.id} className="task shadow">
                  <input type="checkbox" checked={t.completed} onChange={() => handleToggle(t.id)} />
                  <div className="task-main">
                    <b>{t.title}</b>
                    <div className="muted">{t.description}</div>
                  </div>
                  <div className="task-actions">
                    <button className="btn ghost" onClick={() => handleUpdate(t.id)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </section>
            <section>
              <h3><span className="dot ok"/> Completed Tasks ({completed.length})</h3>
              {completed.length === 0 ? (
                <div className="empty shadow"><div className="circle check"/>No completed tasks yet. Time to get productive!</div>
              ) : completed.map(t => (
                <div key={t.id} className="task shadow">
                  <input type="checkbox" checked={t.completed} onChange={() => handleToggle(t.id)} />
                  <div className="task-main">
                    <b>{t.title}</b>
                    <div className="muted">{t.description}</div>
                  </div>
                  <div className="task-actions">
                    <button className="btn ghost" onClick={() => handleUpdate(t.id)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} TaskFlow</div>
      </footer>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Task</h3>
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="select-wrap">
              <label>Priority</label>
              <div className="select">
                <select value={priority} onChange={e => setPriority(e.target.value as any)}>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" disabled={!title.trim()} onClick={handleCreate}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
