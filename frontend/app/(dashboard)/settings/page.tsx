'use client'

import { useState } from 'react'
import { Key, Users, Bell, CreditCard, Link as LinkIcon, Save } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-64 flex-shrink-0 pr-8 border-r border-border-light dark:border-border-dark">
        <nav className="space-y-2 sticky top-8">
          <a
            href="#api-keys"
            className="flex items-center gap-3 px-3 py-2 text-text-light dark:text-text-dark bg-primary/10 dark:bg-primary/20 rounded-lg"
          >
            <Key className="w-5 h-5 text-primary" />
            <p className="text-sm font-bold text-primary">API Keys</p>
          </a>
          <a
            href="#team"
            className="flex items-center gap-3 px-3 py-2 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <p className="text-sm font-medium">Team Members</p>
          </a>
          <a
            href="#notifications"
            className="flex items-center gap-3 px-3 py-2 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <p className="text-sm font-medium">Notifications</p>
          </a>
          <a
            href="#integrations"
            className="flex items-center gap-3 px-3 py-2 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <LinkIcon className="w-5 h-5" />
            <p className="text-sm font-medium">Integrations</p>
          </a>
          <a
            href="#billing"
            className="flex items-center gap-3 px-3 py-2 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <p className="text-sm font-medium">Billing</p>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-8 space-y-8">
        <div>
          <h1 className="text-4xl font-black">API Keys</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your API keys for integrating with external services.
          </p>
        </div>

        {/* Hugging Face API Key */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">Hugging Face API Key</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Required for AI-powered resume analysis and matching
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
              Active
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Hugging Face Settings
              </a>
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Pinecone API Key */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">Pinecone API Key</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Optional: For enhanced vector database capabilities
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold">
              Optional
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key
            </label>
            <input
              type="password"
              placeholder="pc_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">
              Environment
            </label>
            <input
              type="text"
              placeholder="us-east-1-aws"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Security Notice */}
        <div className="glass-card rounded-xl p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Security Notice</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Never share your API keys publicly. They provide full access to your account and can incur charges if misused. 
                Store them securely using environment variables in production.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
