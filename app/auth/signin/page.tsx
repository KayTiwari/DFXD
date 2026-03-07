'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Wheat } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await signIn('credentials', { email, redirect: false })
    if (result?.ok) {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-green-100">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-800">DataFarm</span>
        </div>

        <h1 className="text-xl font-semibold text-stone-900 mb-1 text-center">Welcome back</h1>
        <p className="text-sm text-stone-500 mb-6 text-center">Sign in to your DataFarm account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            Want to sell data?{' '}
            <a href="/seller/register" className="text-green-700 font-medium hover:underline">
              Apply as a seller
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
