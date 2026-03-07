'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Wheat, Plus, Package, MessageSquare } from 'lucide-react'

type Tab = 'listings' | 'create' | 'orders'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PAID: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    HELD: 'bg-orange-100 text-orange-700',
    DISPUTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-stone-100 text-stone-600'}`}>{status}</span>
}

export default function Seller() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('listings')
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', description: '', price: '', fileUrl: '', sampleUrl: '', license: 'Commercial', schema: '' })
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

  const loadMessages = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/messages`)
    const data = await res.json()
    setMessages(m => ({ ...m, [orderId]: data }))
    setOpenThread(orderId)
  }

  const sendMessage = async (orderId: string) => {
    const content = msgText[orderId]
    if (!content?.trim()) return
    await fetch(`/api/orders/${orderId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
    })
    setMsgText(t => ({ ...t, [orderId]: '' }))
    loadMessages(orderId)
  }

  const createListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/seller/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) })
    })
    if (res.ok) {
      const newListing = await res.json()
      setListings(l => [newListing, ...l])
      setForm({ title: '', description: '', price: '', fileUrl: '', sampleUrl: '', license: 'Commercial', schema: '' })
      setTab('listings')
    }
    setLoading(false)
  }

  if (!session || (session.user as any).role !== 'SELLER') {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Not authorized</div>
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">DataFarm</span>
        </a>
        <span className="text-green-300">›</span>
        <span className="text-green-100">Seller Dashboard</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2">
          {([
            { key: 'listings' as Tab, label: 'My Listings', icon: Package },
            { key: 'create' as Tab, label: 'Create Listing', icon: Plus },
            { key: 'orders' as Tab, label: 'Orders', icon: MessageSquare },
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
                  <div className="text-sm text-stone-500">${l.price} · {l.license}</div>
                  {l.fileUrl && <div className="text-xs text-green-600 mt-0.5">File: {l.fileUrl}</div>}
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        )}

        {/* CREATE LISTING */}
        {tab === 'create' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-2xl">
            <h2 className="font-bold text-stone-900 mb-4">New Dataset Listing</h2>
            <form onSubmit={createListing} className="space-y-4">
              {[
                { key: 'title', label: 'Title *', placeholder: 'e.g. Iowa Corn Yield Dataset 2024' },
                { key: 'price', label: 'Price (USD) *', placeholder: '99.00', type: 'number' },
                { key: 'fileUrl', label: 'File URL *', placeholder: 'https://...' },
                { key: 'sampleUrl', label: 'Sample URL', placeholder: 'https://...' },
              ].map(({ key, label, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required={!['sampleUrl'].includes(key)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">License *</label>
                <select value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Commercial</option>
                  <option>Research Only</option>
                  <option>Non-Commercial</option>
                  <option>Open</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data Schema (JSON, optional)</label>
                <textarea value={form.schema} onChange={e => setForm(f => ({ ...f, schema: e.target.value }))} rows={2} placeholder='{"field": "type"}'
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit for Review'}
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
                    <div className="text-sm text-stone-500">Buyer: {o.buyer?.name} · ${o.amount.toFixed(2)}</div>
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
                        <div key={m.id} className="text-sm">
                          <span className="font-medium text-stone-700">{m.from.name}: </span>
                          <span className="text-stone-600">{m.content}</span>
                        </div>
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
      </div>
    </div>
  )
}
