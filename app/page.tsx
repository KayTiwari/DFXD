'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, Wheat, ShoppingCart, CheckCircle, SlidersHorizontal, X, Shield, BarChart3, Database, ArrowRight, ChevronLeft, ChevronRight, Zap, Globe, Users } from 'lucide-react'

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
  const [stats, setStats] = useState<{ listings: number; sellers: number; transactions: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [license, setLicense] = useState('Any')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [carouselIdx, setCarouselIdx] = useState(0)

  const VALUE_CARDS = [
    { icon: Shield, color: 'bg-green-100', iconColor: 'text-green-700', title: 'Verified Sellers', desc: 'Every seller undergoes business verification and admin review before listing datasets on the marketplace.' },
    { icon: Database, color: 'bg-amber-100', iconColor: 'text-amber-600', title: 'Quality Data', desc: 'Preview samples, view data schemas, and read buyer reviews before purchasing. Every listing is admin-approved.' },
    { icon: BarChart3, color: 'bg-blue-100', iconColor: 'text-blue-600', title: 'Secure Transactions', desc: 'Stripe-powered payments with dispute protection. Files delivered only after confirmed payment.' },
    { icon: Zap, color: 'bg-purple-100', iconColor: 'text-purple-600', title: 'Instant Delivery', desc: 'Datasets are delivered automatically after payment. No waiting — access your purchased data immediately.' },
    { icon: Globe, color: 'bg-teal-100', iconColor: 'text-teal-600', title: 'Global Reach', desc: 'Connect with agricultural data producers worldwide. From local farms to international research institutions.' },
    { icon: Users, color: 'bg-rose-100', iconColor: 'text-rose-600', title: 'Community Reviews', desc: 'Read honest reviews from verified buyers. Rate and review datasets to help the community find quality data.' },
  ]

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCarouselIdx(i => (i + 1) % VALUE_CARDS.length), 4000)
    return () => clearInterval(timer)
  }, [VALUE_CARDS.length])

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
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 border border-green-400 rounded-full animate-circle-1" />
          <div className="absolute bottom-10 right-20 w-60 h-60 border border-green-400 rounded-full animate-circle-2" />
          <div className="absolute top-20 right-40 w-20 h-20 border border-amber-400 rounded-full animate-circle-3" />
          <div className="absolute bottom-32 left-1/3 w-32 h-32 border border-green-300 rounded-full animate-circle-2" />
          <div className="absolute top-1/2 right-10 w-24 h-24 border border-amber-300 rounded-full animate-circle-1" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/50 border border-green-500/30 rounded-full px-4 py-1.5 text-sm text-green-200 mb-6">
            <Wheat className="w-4 h-4 text-amber-400" />
            The #1 Agricultural Data Marketplace
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight">Grow Your Insights with<br /><span className="text-amber-400">Premium Farm Data</span></h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">Access verified agricultural datasets from trusted businesses. Power your research, models, and analytics with field-tested data.</p>
          <div className="max-w-2xl mx-auto relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input type="text" placeholder="Search datasets, crops, regions..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-stone-900 border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xl text-lg" />
          </div>
          {!session && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <a href="/auth/signin" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg">
                Get Started Free
              </a>
              <a href="/seller/register" className="border border-green-400/40 hover:border-green-300 text-green-100 px-6 py-3 rounded-xl transition-colors">
                Start Selling
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-700">{stats.listings}+</div>
                <div className="text-sm text-stone-500 mt-1">Verified Datasets</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700">{stats.sellers}+</div>
                <div className="text-sm text-stone-500 mt-1">Trusted Sellers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700">{stats.transactions}+</div>
                <div className="text-sm text-stone-500 mt-1">Transactions Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Value Proposition Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900">Why DataFarm?</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto">A secure, transparent marketplace built for the agricultural data economy.</p>
        </div>

        <div className="relative">
          {/* Navigation arrows */}
          <button onClick={() => setCarouselIdx(i => (i - 1 + VALUE_CARDS.length) % VALUE_CARDS.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-stone-200 flex items-center justify-center text-stone-500 hover:text-green-700 hover:border-green-300 transition-colors hidden md:flex">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCarouselIdx(i => (i + 1) % VALUE_CARDS.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-stone-200 flex items-center justify-center text-stone-500 hover:text-green-700 hover:border-green-300 transition-colors hidden md:flex">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel track */}
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${carouselIdx * (100 / 3)}%)` }}>
              {/* Render all cards + duplicates for seamless loop */}
              {[...VALUE_CARDS, ...VALUE_CARDS.slice(0, 3)].map((card, i) => {
                const Icon = card.icon
                return (
                  <div key={i} className="w-full md:w-1/3 flex-shrink-0 px-3">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center hover:shadow-md transition-shadow h-full">
                      <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-7 h-7 ${card.iconColor}`} />
                      </div>
                      <h3 className="font-bold text-stone-900 text-lg mb-2">{card.title}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {VALUE_CARDS.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === carouselIdx % VALUE_CARDS.length ? 'bg-green-700' : 'bg-stone-300 hover:bg-stone-400'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace Section */}
      <div className="bg-stone-100/50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900">Browse Datasets</h2>
            <span className="text-sm text-stone-500">{listings.length} dataset{listings.length !== 1 ? 's' : ''}</span>
          </div>

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

        {/* Listings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-16 text-stone-500">Loading harvest...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Database className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No datasets match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <a key={listing.id} href={`/listings/${listing.id}`}
                  className="bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-green-200 hover:-translate-y-0.5 transition-all overflow-hidden block group">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{listing.category}</span>
                      <span className="text-lg font-bold text-green-700">${listing.price.toFixed(2)}</span>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors">{listing.title}</h3>
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
      </div>

      {/* CTA Section */}
      {!session && (
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to access premium agricultural data?</h2>
            <p className="text-green-100 mb-8 max-w-lg mx-auto">Join DataFarm today. Browse verified datasets, connect with sellers, and power your agricultural insights.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="/auth/signin" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-green-950 text-green-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Wheat className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-bold text-white">DataFarm</span>
              </div>
              <p className="text-sm text-green-500 leading-relaxed">The trusted marketplace for agricultural data. Connecting data producers with researchers, analysts, and agribusinesses.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">Browse Datasets</a></li>
                <li><a href="/auth/signin" className="hover:text-white transition-colors">Create Account</a></li>
                <li><a href="/buyer/orders" className="hover:text-white transition-colors">My Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/seller/register" className="hover:text-white transition-colors">Apply as Seller</a></li>
                <li><a href="/seller" className="hover:text-white transition-colors">Seller Dashboard</a></li>
                <li><a href="/seller" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-green-500">Stripe Secure Payments</span></li>
                <li><span className="text-green-500">Admin-Verified Listings</span></li>
                <li><span className="text-green-500">Dispute Protection</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800 pt-6 text-center text-sm text-green-600">
            © 2026 DataFarm. Premium Agricultural Data Exchange. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
