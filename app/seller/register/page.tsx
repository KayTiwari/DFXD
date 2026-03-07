'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Wheat, CheckCircle } from 'lucide-react'

export default function SellerRegister() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [form, setForm] = useState({
    businessName: '', businessType: '', taxId: '', address: '',
    phone: '', website: '', description: ''
  })

  if (status === 'loading') return null
  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full border border-green-100">
          <Wheat className="w-10 h-10 text-green-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-900 mb-2">Sign in to Apply</h1>
          <p className="text-stone-500 text-sm mb-6">You need to be signed in to apply as a seller.</p>
          <button onClick={() => signIn()} className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full border border-green-100">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-900 mb-2">Application Submitted!</h1>
          <p className="text-stone-500 text-sm mb-6">
            Your business verification is under review. You'll be able to list datasets once an admin approves your account.
          </p>
          <a href="/" className="w-full block bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 text-center">
            Back to Marketplace
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) { setError('You must accept the seller terms.'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(true)
    } else {
      setError(data.error || 'Registration failed')
    }
    setLoading(false)
  }

  const field = (key: keyof typeof form, label: string, required = true, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}{required && ' *'}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required={required}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-green-800">DataFarm</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Seller Application</h1>
          <p className="text-stone-500 text-sm mb-6">Complete business verification to start selling datasets on DataFarm.</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('businessName', 'Business Name')}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Business Type *</label>
              <select
                value={form.businessType}
                onChange={e => setForm({ ...form, businessType: e.target.value })}
                required
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select type...</option>
                <option>Farm / Agricultural Producer</option>
                <option>Research Institution</option>
                <option>Data Analytics Company</option>
                <option>Government / NGO</option>
                <option>Other</option>
              </select>
            </div>
            {field('taxId', 'Tax ID / Business Registration Number', false)}
            {field('address', 'Business Address')}
            {field('phone', 'Phone Number', true, 'tel')}
            {field('website', 'Website', false, 'url')}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Business Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                placeholder="Describe your business and the types of data you plan to sell..."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 text-xs text-stone-600 max-h-32 overflow-y-auto">
              <p className="font-semibold text-stone-800 mb-1">DataFarm Seller Terms</p>
              <p>By applying as a seller you agree to: (1) provide accurate business information; (2) only list data you have the rights to sell; (3) ensure all datasets are legal, accurate, and as described; (4) not engage in fraud, spam, or misrepresentation; (5) pay a 10% platform fee on all successful sales; (6) comply with applicable data protection laws (GDPR, CCPA, etc.).</p>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-0.5 accent-green-700" />
              <span className="text-sm text-stone-700">I agree to the DataFarm Seller Terms and confirm all submitted information is accurate.</span>
            </label>

            <button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
