'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Wheat, CheckCircle, XCircle, Package, AlertTriangle, Truck } from 'lucide-react'

type Tab = 'sellers' | 'listings' | 'orders' | 'disputes' | 'audit'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PAID: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    HELD: 'bg-orange-100 text-orange-700',
    DISPUTED: 'bg-red-100 text-red-700',
    OPEN: 'bg-red-100 text-red-700',
    RESOLVED: 'bg-green-100 text-green-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-stone-100 text-stone-600'}`}>{status}</span>
}

export default function Admin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('sellers')
  const [sellers, setSellers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [deliverUrls, setDeliverUrls] = useState<Record<string, string>>({})
  const [resolutions, setResolutions] = useState<Record<string, string>>({})

  useEffect(() => {
    if (session && (session.user as any).role !== 'ADMIN') router.push('/')
  }, [session, router])

  useEffect(() => {
    if (!session || (session.user as any).role !== 'ADMIN') return
    fetch('/api/admin/pending-sellers').then(r => r.json()).then(setSellers)
    fetch('/api/admin/pending-listings').then(r => r.json()).then(setListings)
    fetch('/api/admin/orders').then(r => r.json()).then(setOrders)
    fetch('/api/admin/disputes').then(r => r.json()).then(setDisputes)
    fetch('/api/admin/audit-log').then(r => r.json()).then(setAuditLogs)
  }, [session])

  const post = async (url: string, body: object) => {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  }

  const approveSeller = async (id: string) => {
    await post('/api/admin/approve-seller', { id })
    setSellers(s => s.filter(x => x.id !== id))
  }
  const rejectSeller = async (id: string) => {
    await post('/api/admin/reject-seller', { id })
    setSellers(s => s.filter(x => x.id !== id))
  }
  const approveListing = async (id: string) => {
    await post('/api/admin/approve-listing', { id })
    setListings(l => l.filter(x => x.id !== id))
  }
  const rejectListing = async (id: string) => {
    await post('/api/admin/reject-listing', { id })
    setListings(l => l.filter(x => x.id !== id))
  }
  const holdOrder = async (id: string) => {
    const res = await fetch('/api/admin/hold-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json()
    setOrders(o => o.map(x => x.id === id ? { ...x, status: data.newStatus } : x))
  }
  const deliverOrder = async (id: string) => {
    await post('/api/admin/deliver', { id, fileUrl: deliverUrls[id] })
    setOrders(o => o.map(x => x.id === id ? { ...x, status: 'DELIVERED' } : x))
  }
  const resolveDispute = async (id: string) => {
    await post('/api/admin/resolve-dispute', { id, resolution: resolutions[id] || 'Resolved by admin' })
    setDisputes(d => d.map(x => x.id === id ? { ...x, status: 'RESOLVED' } : x))
  }

  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Not authorized</div>
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'sellers', label: 'Pending Sellers', count: sellers.length },
    { key: 'listings', label: 'Pending Listings', count: listings.length },
    { key: 'orders', label: 'All Orders', count: orders.length },
    { key: 'disputes', label: 'Disputes', count: disputes.filter(d => d.status === 'OPEN').length },
    { key: 'audit', label: 'Audit Log', count: 0 },
  ]

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
        <span className="text-green-100">Admin Dashboard</span>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-green-700 text-white' : 'text-stone-600 hover:text-green-700'}`}
            >
              {t.label} {t.count > 0 && <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* SELLERS */}
        {tab === 'sellers' && (
          <div className="space-y-4">
            {sellers.length === 0 && <p className="text-stone-500 text-sm">No pending seller applications.</p>}
            {sellers.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-stone-900">{s.sellerProfile?.businessName}</div>
                    <div className="text-sm text-stone-500">{s.email} · {s.sellerProfile?.businessType}</div>
                    <div className="text-sm text-stone-600 mt-1">{s.sellerProfile?.description}</div>
                    <div className="text-xs text-stone-400 mt-1">
                      {s.sellerProfile?.address} · {s.sellerProfile?.phone}
                      {s.sellerProfile?.taxId && ` · TaxID: ${s.sellerProfile.taxId}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveSeller(s.id)} className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => rejectSeller(s.id)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div className="space-y-4">
            {listings.length === 0 && <p className="text-stone-500 text-sm">No pending listings.</p>}
            {listings.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-stone-900">{l.title}</div>
                    <div className="text-sm text-stone-500">${l.price} · License: {l.license}</div>
                    <div className="text-sm text-stone-600 mt-1">{l.description}</div>
                    {l.fileUrl && <div className="text-xs text-green-600 mt-1">File: {l.fileUrl}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveListing(l.id)} className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => rejectListing(l.id)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-stone-500 text-sm">No orders yet.</p>}
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900">{o.listing?.title || o.listingId}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-sm text-stone-500 mt-1">
                      ${o.amount.toFixed(2)} · Buyer: {o.buyer?.name || o.buyerId}
                      {o.deliveredAt && ` · Delivered: ${new Date(o.deliveredAt).toLocaleDateString()}`}
                    </div>
                    {o.fileUrl && <div className="text-xs text-green-600 mt-1">File: {o.fileUrl}</div>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => holdOrder(o.id)} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm">
                      <Package className="w-4 h-4" /> {o.status === 'HELD' ? 'Unhold' : 'Hold'}
                    </button>
                    <div className="flex gap-1">
                      <input
                        placeholder="File URL..."
                        value={deliverUrls[o.id] || ''}
                        onChange={e => setDeliverUrls(u => ({ ...u, [o.id]: e.target.value }))}
                        className="border border-stone-300 rounded px-2 py-1 text-xs w-40"
                      />
                      <button onClick={() => deliverOrder(o.id)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                        <Truck className="w-3 h-3" /> Deliver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DISPUTES */}
        {tab === 'disputes' && (
          <div className="space-y-4">
            {disputes.length === 0 && <p className="text-stone-500 text-sm">No disputes.</p>}
            {disputes.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-stone-900">{d.order?.listing?.title}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-sm text-stone-500 mt-1">Buyer: {d.order?.buyer?.name} · {new Date(d.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-stone-700 mt-1">Reason: {d.reason}</div>
                    {d.resolution && <div className="text-sm text-green-600 mt-1">Resolution: {d.resolution}</div>}
                  </div>
                  {d.status === 'OPEN' && (
                    <div className="flex gap-2 items-center ml-4">
                      <input
                        placeholder="Resolution..."
                        value={resolutions[d.id] || ''}
                        onChange={e => setResolutions(r => ({ ...r, [d.id]: e.target.value }))}
                        className="border border-stone-300 rounded px-2 py-1 text-xs w-40"
                      />
                      <button onClick={() => resolveDispute(d.id)} className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm">
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* AUDIT LOG */}
        {tab === 'audit' && (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {auditLogs.length === 0 ? (
              <p className="text-stone-500 text-sm p-5">No audit log entries.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Action</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Details</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{log.user?.name || log.userId}</td>
                      <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3 text-stone-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
