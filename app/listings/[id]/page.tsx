'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Wheat, Star, CheckCircle, X, ArrowLeft, Download, ExternalLink } from 'lucide-react'

interface Listing {
  id: string; title: string; description: string; price: number; category: string
  sampleUrl: string | null; schema: string | null; license: string
  seller: { name: string; verified: boolean; sellerProfile: { businessName: string; businessType: string } | null }
  reviews: { id: string; rating: number; comment: string | null; createdAt: string; user: { name: string } }[]
  _count: { orders: number; reviews: number }
}

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 cursor-pointer transition-colors ${i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
          onMouseEnter={() => onRate && setHover(i)} onMouseLeave={() => onRate && setHover(0)} onClick={() => onRate?.(i)} />
      ))}
    </div>
  )
}

function TermsModal({ listing, onClose, onConfirm }: { listing: Listing; onClose: () => void; onConfirm: () => void }) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const handle = async () => { setLoading(true); await onConfirm(); setLoading(false) }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-stone-900">Purchase Agreement</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600 mb-4 max-h-48 overflow-y-auto space-y-2">
          <p><strong>Dataset:</strong> {listing.title}</p>
          <p><strong>License:</strong> {listing.license}</p>
          <p><strong>Price:</strong> ${listing.price.toFixed(2)} + 10% fee = ${(listing.price * 1.1).toFixed(2)}</p>
          <p className="pt-2 font-semibold text-stone-700">Terms of Use</p>
          <p>By purchasing you agree to use the data only for lawful purposes, not resell or redistribute raw data without consent, and accept that all sales are final after delivery.</p>
        </div>
        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 accent-green-700" />
          <span className="text-sm text-stone-700">I agree to the DataFarm Purchase Agreement</span>
        </label>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-stone-300 text-stone-700 py-2 rounded-lg text-sm">Cancel</button>
          <button onClick={handle} disabled={!accepted || loading}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(d => { setListing(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id, termsAccepted: true })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.error || 'Checkout failed')
    setShowTerms(false)
  }

  const submitReview = async () => {
    if (!reviewRating) { setReviewError('Please select a rating'); return }
    setSubmittingReview(true)
    setReviewError('')
    const res = await fetch(`/api/listings/${id}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
    })
    if (res.ok) {
      const review = await res.json()
      setListing(l => l ? { ...l, reviews: [review, ...l.reviews] } : l)
      setReviewRating(0); setReviewComment('')
    } else {
      const d = await res.json()
      setReviewError(d.error || 'Failed to submit review')
    }
    setSubmittingReview(false)
  }

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Loading...</div>
  if (!listing) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Listing not found.</div>

  const avgRating = listing.reviews.length ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length : 0

  return (
    <div className="min-h-screen bg-stone-50">
      {showTerms && <TermsModal listing={listing} onClose={() => setShowTerms(false)} onConfirm={handleCheckout} />}

      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Wheat className="w-5 h-5 text-white" /></div>
          <span className="font-bold">DataFarm</span>
        </a>
        <span className="text-green-300">›</span>
        <span className="text-green-200 text-sm truncate max-w-xs">{listing.title}</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{listing.category}</span>
                  <h1 className="text-2xl font-bold text-stone-900 mt-2">{listing.title}</h1>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed">{listing.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                <span>License: <strong className="text-stone-700">{listing.license}</strong></span>
                <span>{listing._count.orders} purchases</span>
                {listing._count.reviews > 0 && (
                  <span className="flex items-center gap-1"><StarRating rating={Math.round(avgRating)} /> {avgRating.toFixed(1)} ({listing._count.reviews})</span>
                )}
              </div>
            </div>

            {/* Sample / Schema */}
            {(listing.sampleUrl || listing.schema) && (
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h2 className="font-bold text-stone-900 mb-4">Dataset Preview</h2>
                {listing.sampleUrl && (
                  <a href={listing.sampleUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 border border-green-200 px-4 py-2 rounded-lg text-sm mb-4">
                    <Download className="w-4 h-4" /> Download Sample
                  </a>
                )}
                {listing.schema && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">Data Schema</p>
                    <pre className="bg-stone-50 rounded-lg p-4 text-xs text-stone-700 overflow-x-auto border border-stone-200">
                      {(() => { try { return JSON.stringify(JSON.parse(listing.schema), null, 2) } catch { return listing.schema } })()}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-900 mb-4">Reviews ({listing.reviews.length})</h2>

              {session && (
                <div className="mb-6 pb-6 border-b border-stone-100">
                  <p className="text-sm font-medium text-stone-700 mb-2">Leave a review</p>
                  <StarRating rating={reviewRating} onRate={setReviewRating} />
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} placeholder="Share your experience..."
                    className="w-full mt-2 border border-stone-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
                  {reviewError && <p className="text-red-600 text-xs mt-1">{reviewError}</p>}
                  <button onClick={submitReview} disabled={submittingReview || !reviewRating}
                    className="mt-2 bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <p className="text-xs text-stone-400 mt-1">Only available after purchasing</p>
                </div>
              )}

              {listing.reviews.length === 0 ? (
                <p className="text-stone-400 text-sm">No reviews yet.</p>
              ) : listing.reviews.map(r => (
                <div key={r.id} className="mb-4 pb-4 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={r.rating} />
                    <span className="text-sm font-medium text-stone-700">{r.user.name}</span>
                    <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-sm text-stone-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-6">
              <div className="text-3xl font-bold text-green-700 mb-1">${listing.price.toFixed(2)}</div>
              <div className="text-xs text-stone-400 mb-4">+10% platform fee at checkout</div>

              <button
                onClick={() => session ? setShowTerms(true) : signIn()}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 rounded-xl transition-colors">
                {session ? 'Buy Dataset' : 'Sign In to Purchase'}
              </button>

              {listing.sampleUrl && (
                <a href={listing.sampleUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full mt-2 flex items-center justify-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 py-2 rounded-xl text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" /> Preview Sample
                </a>
              )}

              <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                    {listing.seller.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-stone-900">{listing.seller.name}</span>
                      {listing.seller.verified && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                    </div>
                    {listing.seller.sellerProfile && (
                      <div className="text-xs text-stone-400">{listing.seller.sellerProfile.businessType}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
