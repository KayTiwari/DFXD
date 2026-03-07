'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Search, Wheat, ShoppingCart, ArrowRight, CheckCircle, X } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  seller: { name: string; verified: boolean }
  createdAt: string
}

interface TermsModalProps {
  listing: Listing
  onClose: () => void
  onConfirm: (listingId: string) => void
}

function TermsModal({ listing, onClose, onConfirm }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    await onConfirm(listing.id)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-stone-900">Purchase Agreement</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600 mb-4 max-h-48 overflow-y-auto space-y-2">
          <p><strong>Dataset:</strong> {listing.title}</p>
          <p><strong>Price:</strong> ${listing.price.toFixed(2)} + 10% platform fee = ${(listing.price * 1.1).toFixed(2)}</p>
          <p className="pt-2 font-semibold text-stone-700">Terms of Use</p>
          <p>By purchasing this dataset you agree to: (1) use the data only for lawful purposes; (2) not resell or redistribute the raw data without written consent from the seller; (3) acknowledge that DataFarm acts as a marketplace and is not responsible for data accuracy; (4) accept that all sales are final after file delivery.</p>
        </div>
        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 accent-green-700" />
          <span className="text-sm text-stone-700">I have read and agree to the DataFarm Purchase Agreement and Terms of Use</span>
        </label>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-stone-300 text-stone-700 py-2 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
          <button
            onClick={handleBuy}
            disabled={!accepted || loading}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [filtered, setFiltered] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(data => { setListings(data); setFiltered(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSearch = (q: string) => {
    setSearch(q)
    setFiltered(!q ? listings : listings.filter(l =>
      l.title.toLowerCase().includes(q.toLowerCase()) ||
      l.description.toLowerCase().includes(q.toLowerCase())
    ))
  }

  const handleBuyClick = (listing: Listing) => {
    if (!session) { signIn(); return }
    setSelectedListing(listing)
  }

  const handleCheckout = async (listingId: string) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, termsAccepted: true })
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Checkout failed')
    }
    setSelectedListing(null)
  }

  const role = (session?.user as any)?.role

  return (
    <div className="min-h-screen bg-stone-50">
      {selectedListing && (
        <TermsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onConfirm={handleCheckout} />
      )}

      {/* Header */}
      <header className="bg-green-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">DataFarm</span>
          </a>
          <nav className="flex items-center gap-6">
            {session ? (
              <>
                {role === 'ADMIN' && <a href="/admin" className="text-sm bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg font-medium transition-colors">Admin</a>}
                {role === 'SELLER' && <a href="/seller" className="text-sm bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg transition-colors">My Listings</a>}
                {role !== 'SELLER' && role !== 'ADMIN' && (
                  <a href="/seller/register" className="text-sm text-green-200 hover:text-white">Sell Data</a>
                )}
                <a href="/buyer/orders" className="text-sm flex items-center gap-1 text-green-200 hover:text-white">
                  <ShoppingCart className="w-4 h-4" /> My Orders
                </a>
                <span className="text-sm text-green-300">{session.user?.name}</span>
                <button onClick={() => signOut()} className="text-sm text-green-300 hover:text-white">Sign Out</button>
              </>
            ) : (
              <>
                <a href="/seller/register" className="text-sm text-green-200 hover:text-white">Sell Data</a>
                <button onClick={() => signIn()} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign In
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Grow Your Insights</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Premium agricultural datasets from verified businesses. Fuel your research, models, and analytics with trusted field data.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search datasets, crops, regions..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-stone-900 border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Available Datasets</h2>
          <span className="text-sm text-stone-500">{filtered.length} datasets</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-stone-500">Loading harvest...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-500">No datasets found. Try a different search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-md hover:border-green-200 transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-lg font-bold text-green-700">${listing.price.toFixed(2)}</span>
                    <span className="text-xs text-stone-400">{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2 line-clamp-1">{listing.title}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-700">{listing.seller.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-stone-700">{listing.seller.name}</span>
                      {listing.seller.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <button
                      onClick={() => handleBuyClick(listing)}
                      className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Buy <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-green-900 text-green-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wheat className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">DataFarm</span>
          </div>
          <p className="text-sm">© 2026 DataFarm Marketplace. Premium Agricultural Data Exchange.</p>
        </div>
      </footer>
    </div>
  )
}
