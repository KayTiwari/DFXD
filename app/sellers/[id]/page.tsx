'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Wheat, CheckCircle, Building2, Globe, Package } from 'lucide-react'

export default function SellerProfile() {
  const params = useParams()
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/sellers/${params.id}`)
      .then(r => r.json())
      .then(data => { setSeller(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        Loading...
      </div>
    )
  }

  if (!seller || seller.error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        Seller not found.
      </div>
    )
  }

  const profile = seller.sellerProfile

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
        <span className="text-green-100">Seller Profile</span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Seller card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-green-700">{seller.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{profile.businessName || seller.name}</h1>
                {(seller.verified || profile.verified) && (
                  <CheckCircle className="w-5 h-5 text-green-600" title="Verified seller" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-stone-500 flex-wrap">
                {profile.businessType && (
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{profile.businessType}</span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-700 hover:underline">
                    <Globe className="w-4 h-4" />{profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1"><Package className="w-4 h-4" />{seller.listings.length} listing{seller.listings.length !== 1 ? 's' : ''}</span>
                <span>Member since {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              {profile.description && (
                <p className="mt-3 text-stone-600 text-sm">{profile.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <h2 className="text-lg font-bold text-stone-900 mb-4">Available Datasets</h2>
        {seller.listings.length === 0 ? (
          <p className="text-stone-500 text-sm">No approved listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seller.listings.map((l: any) => (
              <a key={l.id} href={`/listings/${l.id}`}
                className="bg-white rounded-xl border border-stone-200 hover:border-green-300 hover:shadow-sm transition-all p-5 block">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{l.category}</span>
                  <span className="font-bold text-green-700">${l.price.toFixed(2)}</span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">{l.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 mb-3">{l.description}</p>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>{l.license}</span>
                  {l._count.orders > 0 && <span>{l._count.orders} sold</span>}
                  {l._count.reviews > 0 && <span>{l._count.reviews} review{l._count.reviews !== 1 ? 's' : ''}</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
