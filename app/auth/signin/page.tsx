'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Wheat } from 'lucide-react'
import { Suspense } from 'react'

function SignInForm() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      isRegister: tab === 'register' ? 'true' : 'false',
      name,
      redirect: false,
      callbackUrl,
    })

    if (result?.ok) {
      router.push(callbackUrl)
    } else {
      setError(tab === 'register' ? 'Registration failed. Email may already be in use.' : 'Invalid email or password.')
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

        <div className="flex mb-6 bg-stone-100 rounded-lg p-1">
          <button onClick={() => setTab('login')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'login' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>Sign In</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'register' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>Create Account</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
            {loading ? (tab === 'register' ? 'Creating...' : 'Signing in...') : (tab === 'register' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            Want to sell data?{' '}
            <a href="/seller/register" className="text-green-700 font-medium hover:underline">Apply as a seller</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
