'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Wheat, Plus, Package, MessageSquare, BarChart2, Pencil, Trash2 } from 'lucide-react'

type Tab = 'listings' | 'create' | 'orders' | 'analytics'

const CATEGORIES = ['Crop Data', 'Soil & Weather', 'Livestock', 'Market Prices', 'Satellite Imagery', 'Pesticide & Fertilizer', 'General']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700', PAID: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700', HELD: 'bg-orange-100 text-orange-700', DISPUTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-stone-100 text-stone-600'}`}>{status}</span>
}

export default function Seller() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('listings')
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'General', fileUrl: '', sampleUrl: '', license: 'Commercial', schema: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [openThread, setOpenThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [msgText, setMsgText] = useState<Record<string, string>>({})

  useEffect(() => {
    if (session && (session.user as any).role !== 'SELLER') router.push('/')
  }, [session, router])

  useEffect(() => {
    if (!session || (session.user as any).role !== 'SELLER') return
    fetch('/api/seller/listings').then(r => r.json()).then(setListings)
    fetch('/api/seller/orders').then(r => r.json()).then(setOrders)
  }, [session])

  useEffect(() => {
    if (tab === 'analytics' && !analytics && session && (session.user as any).role === 'SELLER') {
      fetch('/api/seller/analytics').then(r => r.json()).then(setAnalytics)
    }
  }, [tab, analytics, session])

  const loadMessages = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/messages`)
    setMessages(m => ({ ...m, [orderId]: [] }))
    const data = await res.json()
    setMessages(m => ({ ...m, [orderId]: data }))
    setOpenThread(orderId)
  }

  const sendMessage = async (orderId: string) => {
    const content = msgText[orderId]
    if (!content?.trim()) return
    await fetch(`/api/orders/${orderId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    setMsgText(t => ({ ...t, [orderId]: '' }))
    loadMessages(orderId)
  }

  const saveListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const body = JSON.stringify({ ...form, price: parseFloat(form.price) })
    const res = editingId
      ? await fetch(`/api/seller/listings/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body })
      : await fetch('/api/seller/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (res.ok) {
      const listing = await res.json()
      setListings(l => editingId ? l.map(x => x.id === editingId ? listing : x) : [listing, ...l])
      setForm({ title: '', description: '', price: '', category: 'General', fileUrl: '', sampleUrl: '', license: 'Commercial', schema: '' })
      setEditingId(null)
      setTab('listings')
    }
    setLoading(false)
  }

  const startEdit = (l: any) => {
    setForm({ title: l.title, description: l.description, price: String(l.price), category: l.category || 'General', fileUrl: l.fileUrl || '', sampleUrl: l.sampleUrl || '', license: l.license, schema: l.schema || '' })
    setEditingId(l.id)
    setTab('create')
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    const res = await fetch(`/api/seller/listings/${id}`, { method: 'DELETE' })
    if (res.ok) setListings(l => l.filter(x => x.id !== id))
  }

  if (!session || (session.user as any).role !== 'SELLER') {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Not authorized</div>
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Wheat className="w-5 h-5 text-white" /></div>
          <span className="font-bold">DataFarm</span>
        </a>
        <span className="text-green-300">›</span>
        <span className="text-green-100">Seller Dashboard</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2 flex-wrap">
          {([
            { key: 'listings' as Tab, label: 'My Listings', icon: Package },
            { key: 'create' as Tab, label: 'Create Listing', icon: Plus },
            { key: 'orders' as Tab, label: 'Orders', icon: MessageSquare },
            { key: 'analytics' as Tab, label: 'Analytics', icon: BarChart2 },
          ]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab === key ? 'bg-green-700 text-white' : 'text-stone-600 hover:text-green-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* MY LISTINGS */}
        {tab === 'listings' && (
          <div className="space-y-3">
            {listings.length === 0 && <p className="text-stone-500 text-sm">No listings yet. <button className="text-green-700 underline" onClick={() => setTab('create')}>Create one</button>.</p>}
            {listings.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-stone-200 p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-stone-900">{l.title}</div>
                  <div className="text-sm text-stone-500">${l.price} · {l.license} · <span className="text-green-700">{l.category}</span></div>
                  {l.fileUrl && <div className="text-xs text-stone-400 mt-0.5 truncate max-w-sm">{l.fileUrl}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.status} />
                  <button onClick={() => startEdit(l)} className="p-1.5 text-stone-400 hover:text-green-700 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteListing(l.id)} className="p-1.5 text-stone-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE LISTING */}
        {tab === 'create' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-2xl">
            <h2 className="font-bold text-stone-900 mb-4">{editingId ? 'Edit Listing' : 'New Dataset Listing'}</h2>
            <form onSubmit={saveListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Iowa Corn Yield Dataset 2024"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price (USD) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="99.00"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} resize-none
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Dataset URL *</label>
                <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} required placeholder="https://..."
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Sample URL (public preview)</label>
                <input value={form.sampleUrl} onChange={e => setForm(f => ({ ...f, sampleUrl: e.target.value }))} placeholder="https://..."
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">License *</label>
                <select value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Commercial</option><option>Research Only</option><option>Non-Commercial</option><option>Open</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data Schema (JSON)</label>
                <textarea value={form.schema} onChange={e => setForm(f => ({ ...f, schema: e.target.value }))} rows={2} placeholder='{"field":"type"}'
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Submit for Review'}
              </button>
            </form>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-stone-500 text-sm">No orders yet.</p>}
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-stone-900">{o.listing?.title}</div>
                    <div className="text-sm text-stone-500">Buyer: {o.buyer?.name} ({o.buyer?.email}) · ${o.amount.toFixed(2)}</div>
                    <div className="flex items-center gap-2 mt-1"><StatusBadge status={o.status} /></div>
                  </div>
                  <button onClick={() => openThread === o.id ? setOpenThread(null) : loadMessages(o.id)}
                    className="flex items-center gap-1 text-green-700 hover:text-green-800 text-sm border border-green-200 px-3 py-1.5 rounded-lg">
                    <MessageSquare className="w-4 h-4" /> {openThread === o.id ? 'Close' : 'Message'}
                  </button>
                </div>
                {openThread === o.id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                      {(messages[o.id] || []).length === 0 && <p className="text-xs text-stone-400">No messages yet.</p>}
                      {(messages[o.id] || []).map((m: any) => (
                        <div key={m.id} className="text-sm"><span className="font-medium text-stone-700">{m.from.name}: </span><span className="text-stone-600">{m.content}</span></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={msgText[o.id] || ''} onChange={e => setMsgText(t => ({ ...t, [o.id]: e.target.value }))}
                        placeholder="Type a message..." className="flex-1 border border-stone-300 rounded px-3 py-1.5 text-sm" />
                      <button onClick={() => sendMessage(o.id)} className="bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-800">Send</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div>
            {!analytics ? <p className="text-stone-400 text-sm">Loading analytics...</p> : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
                    <div className="text-3xl font-bold text-green-700">${analytics.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-stone-500 mt-1">Total Revenue</div>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</div>
                    <div className="text-sm text-stone-500 mt-1">Completed Orders</div>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
                    <div className="text-3xl font-bold text-amber-600">{analytics.pendingOrders}</div>
                    <div className="text-sm text-stone-500 mt-1">Pending Orders</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <h3 className="font-semibold text-stone-900 mb-4">Listings Performance</h3>
                  <div className="space-y-3">
                    {analytics.listings.map((l: any) => (
                      <div key={l.id} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-stone-900">{l.title}</div>
                          <div className="text-xs text-stone-400">${l.price} · {l._count.orders} orders · {l._count.reviews} reviews</div>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                    ))}
                  </div>
                </div>

                {Object.keys(analytics.monthlyRevenue).length > 0 && (
                  <div className="bg-white rounded-xl border border-stone-200 p-5">
                    <h3 className="font-semibold text-stone-900 mb-4">Revenue by Month</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.monthlyRevenue).map(([month, rev]: any) => (
                        <div key={month} className="flex justify-between text-sm">
                          <span className="text-stone-600">{month}</span>
                          <span className="font-medium text-green-700">${rev.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
