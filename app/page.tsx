'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, Wheat, ShoppingCart, CheckCircle, SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = ['All', 'Crop Data', 'Soil & Weather', 'Livestock', 'Market Prices', 'Satellite Imagery', 'Pesticide & Fertilizer', 'General']
const LICENSES = ['Any', 'Commercial', 'Research Only', 'Non-Commercial', 'Open']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

interface Listing {
  id: string; title: string; description: string; price: number; category: string; license: string
  seller: { name: string; verified: boolean }
  createdAt: string
  _count?: { orders: number; reviews: number }
}

export default function Home() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [license, setLicense] = useState('Any')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'All') params.set('category', category)
    if (license !== 'Any') params.set('license', license)
    if (sort !== 'newest') params.set('sort', sort)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    fetch(`/api/listings?${params}`)
      .then(r => r.json())
      .then(data => { setListings(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, category, license, sort, minPrice, maxPrice])

  useEffect(() => {
    const t = setTimeout(fetchListings, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchListings, search])

  const clearFilters = () => {
    setCategory('All'); setLicense('Any'); setSort('newest'); setMinPrice(''); setMaxPrice('')
  }
  const hasActiveFilters = category !== 'All' || license !== 'Any' || sort !== 'newest' || minPrice || maxPrice

  const role = (session?.user as any)?.role

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Wheat className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold">DataFarm</span>
          </a>
          <nav className="flex items-center gap-6">
            {session ? (
              <>
                {role === 'ADMIN' && <a href="/admin" className="text-sm bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg font-medium">Admin</a>}
                {role === 'SELLER' && <a href="/seller" className="text-sm bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg">My Listings</a>}
                {role !== 'SELLER' && role !== 'ADMIN' && <a href="/seller/register" className="text-sm text-green-200 hover:text-white">Sell Data</a>}
                <a href="/buyer/orders" className="text-sm flex items-center gap-1 text-green-200 hover:text-white"><ShoppingCart className="w-4 h-4" /> My Orders</a>
                <span className="text-sm text-green-300">{session.user?.name}</span>
                <button onClick={() => signOut()} className="text-sm text-green-300 hover:text-white">Sign Out</button>
              </>
            ) : (
              <>
                <a href="/seller/register" className="text-sm text-green-200 hover:text-white">Sell Data</a>
                <a href="/auth/signin" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Sign In</a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Grow Your Insights</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">Premium agricultural datasets from verified businesses. Fuel research, models, and analytics with trusted field data.</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input type="text" placeholder="Search datasets, crops, regions..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-stone-900 border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-green-700 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-green-300'}`}>
              {c}
            </button>
          ))}
          <button onClick={() => setShowFilters(f => !f)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${showFilters || hasActiveFilters ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200 hover:border-green-300'}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters {hasActiveFilters && '•'}
          </button>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">License</label>
              <select value={license} onChange={e => setLicense(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {LICENSES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Min Price ($)</label>
              <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0"
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Max Price ($)</label>
              <input type="number" placeholder="∞" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0"
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-2">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Available Datasets</h2>
          <span className="text-sm text-stone-500">{listings.length} dataset{listings.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-stone-500">Loading harvest...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-stone-500">No datasets match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <a key={listing.id} href={`/listings/${listing.id}`}
                className="bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-md hover:border-green-200 transition-all overflow-hidden block">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{listing.category}</span>
                    <span className="text-lg font-bold text-green-700">${listing.price.toFixed(2)}</span>
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
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      {listing._count && listing._count.orders > 0 && <span>{listing._count.orders} sold</span>}
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-green-900 text-green-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><Wheat className="w-4 h-4 text-amber-400" /><span className="font-semibold text-white">DataFarm</span></div>
          <p className="text-sm">© 2026 DataFarm Marketplace. Premium Agricultural Data Exchange.</p>
        </div>
      </footer>
    </div>
  )
}
