'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function HomePage() {
  const { user, login, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Notebooks</h1>
      
      {user ? (
        <div className="text-center">
          <p className="text-xl mb-4">Welcome back, {user.name}!</p>
          <Link 
            href="/notebooks"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Your Notebooks
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl mb-6">Sign in to create and manage your notebooks</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  )
} 