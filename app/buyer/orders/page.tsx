'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Wheat, Download, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PAID: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    HELD: 'bg-orange-100 text-orange-700',
    DISPUTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-stone-100 text-stone-600'}`}>{status}</span>
}

export default function BuyerOrders() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [openThread, setOpenThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [msgText, setMsgText] = useState<Record<string, string>>({})
  const [disputeReason, setDisputeReason] = useState<Record<string, string>>({})
  const [openDispute, setOpenDispute] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetch('/api/buyer/orders').then(r => r.json()).then(setOrders)
    }
  }, [session])

  const loadMessages = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/messages`)
    const data = await res.json()
    setMessages(m => ({ ...m, [orderId]: data }))
    setOpenThread(openThread === orderId ? null : orderId)
  }

  const sendMessage = async (orderId: string) => {
    const content = msgText[orderId]
    if (!content?.trim()) return
    await fetch(`/api/orders/${orderId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
    })
    setMsgText(t => ({ ...t, [orderId]: '' }))
    const res = await fetch(`/api/orders/${orderId}/messages`)
    const data = await res.json()
    setMessages(m => ({ ...m, [orderId]: data }))
  }

  const openDisputeForm = (orderId: string) => {
    setOpenDispute(openDispute === orderId ? null : orderId)
  }

  const submitDispute = async (orderId: string) => {
    const reason = disputeReason[orderId]
    if (!reason?.trim()) return
    await fetch(`/api/orders/${orderId}/dispute`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason })
    })
    setDisputeReason(r => ({ ...r, [orderId]: '' }))
    setOpenDispute(null)
    const res = await fetch('/api/buyer/orders')
    const data = await res.json()
    setOrders(data)
  }

  if (status === 'loading') return null
  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm border border-green-100 shadow-lg">
          <Wheat className="w-10 h-10 text-green-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Sign in to view orders</h1>
          <button onClick={() => signIn()} className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 mt-4">Sign In</button>
        </div>
      </div>
    )
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
        <span className="text-green-100">My Orders</span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            No orders yet. <a href="/" className="text-green-700 underline">Browse the marketplace</a>.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => {
              const hasOpenDispute = o.disputes?.some((d: any) => d.status === 'OPEN')
              const canDispute = ['PAID', 'DELIVERED'].includes(o.status) && !hasOpenDispute
              const canDownload = ['PAID', 'DELIVERED'].includes(o.status) && o.fileUrl

              return (
                <div key={o.id} className="bg-white rounded-xl border border-stone-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{o.listing?.title}</span>
                        <StatusBadge status={o.status} />
                        {o.termsAccepted && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" /> Terms accepted
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-stone-500 mt-1">
                        Seller: {o.listing?.seller?.name} · ${o.amount.toFixed(2)}
                        {o.platformFee && ` (incl. $${o.platformFee.toFixed(2)} platform fee)`}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</div>
                      {hasOpenDispute && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertTriangle className="w-3 h-3" /> Dispute open
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {canDownload && (
                        <a href={o.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => loadMessages(o.id)}
                          className="flex items-center gap-1 text-green-700 border border-green-200 hover:bg-green-50 px-2 py-1.5 rounded-lg text-sm">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {canDispute && (
                          <button onClick={() => openDisputeForm(o.id)}
                            className="flex items-center gap-1 text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1.5 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dispute form */}
                  {openDispute === o.id && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Open a Dispute</p>
                      <textarea
                        value={disputeReason[o.id] || ''}
                        onChange={e => setDisputeReason(r => ({ ...r, [o.id]: e.target.value }))}
                        placeholder="Describe the issue..."
                        rows={2}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setOpenDispute(null)} className="flex-1 border border-stone-300 text-stone-600 py-1.5 rounded-lg text-sm">Cancel</button>
                        <button onClick={() => submitDispute(o.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-sm font-medium">Submit Dispute</button>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {openThread === o.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                        {(messages[o.id] || []).length === 0 && <p className="text-xs text-stone-400">No messages yet. Start the conversation.</p>}
                        {(messages[o.id] || []).map((m: any) => (
                          <div key={m.id} className="text-sm">
                            <span className="font-medium text-stone-700">{m.from.name}: </span>
                            <span className="text-stone-600">{m.content}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={msgText[o.id] || ''}
                          onChange={e => setMsgText(t => ({ ...t, [o.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && sendMessage(o.id)}
                          placeholder="Type a message..."
                          className="flex-1 border border-stone-300 rounded px-3 py-1.5 text-sm"
                        />
                        <button onClick={() => sendMessage(o.id)} className="bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-800">Send</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
