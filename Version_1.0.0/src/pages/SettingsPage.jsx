import { Cloud, Database, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { supabaseConfigStatus } from '../lib/supabase'
import { testSupabaseConnection } from '../services/fleetService'

export default function SettingsPage() {
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState(null)

  const runConnectionTest = useCallback(async () => {
    setTesting(true)
    const result = await testSupabaseConnection()
    setConnectionResult(result)
    setTesting(false)
  }, [])

  useEffect(() => {
    if (!supabaseConfigStatus.isConfigured) return
    let active = true
    testSupabaseConnection().then((result) => {
      if (active) setConnectionResult(result)
    })
    return () => {
      active = false
    }
  }, [])

  const badgeStatus = connectionResult?.tablesReady
    ? 'Active'
    : connectionResult?.connected
      ? 'Scheduled'
      : supabaseConfigStatus.isConfigured
        ? 'Idle'
        : 'Out of Service'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Backend integration health check and deployment configuration status."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Supabase Integration
                </h3>
                <p className="text-xs text-zinc-400">
                  Configured via Vite environment variables
                </p>
              </div>
            </div>
            <StatusBadge status={badgeStatus} />
          </div>

          <dl className="mt-5 space-y-3 border-t border-white/8 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="font-mono text-xs text-zinc-400">
                VITE_SUPABASE_URL
              </dt>
              <dd className="text-xs font-semibold text-zinc-200">
                {supabaseConfigStatus.hasUrl ? 'Detected' : 'Not set'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-mono text-xs text-zinc-400">
                VITE_SUPABASE_PUBLISHABLE_KEY
              </dt>
              <dd className="text-xs font-semibold text-zinc-200">
                {supabaseConfigStatus.hasApiKey ? 'Detected' : 'Not set'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-zinc-400">Connection Check</dt>
              <dd className="text-xs font-semibold text-lime-300">
                {connectionResult
                  ? connectionResult.tablesReady
                    ? 'Connected & Tables Ready'
                    : connectionResult.connected
                      ? 'Connected (Schema Needed)'
                      : 'Connection Error'
                  : 'Not tested yet'}
              </dd>
            </div>
          </dl>

          {connectionResult && (
            <p
              className={`mt-4 rounded-xl border p-3 text-xs ${
                connectionResult.tablesReady
                  ? 'border-lime-400/25 bg-lime-400/10 text-lime-200'
                  : connectionResult.connected
                    ? 'border-amber-400/25 bg-amber-400/10 text-amber-200'
                    : 'border-rose-500/25 bg-rose-500/10 text-rose-200'
              }`}
            >
              {connectionResult.message}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              Schema file:{' '}
              <code className="font-mono font-semibold text-zinc-300">
                supabase/schema.sql
              </code>
            </span>
            <button
              type="button"
              onClick={runConnectionTest}
              disabled={testing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`}
              />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cloudflare Pages Readiness
              </h3>
              <p className="text-xs text-zinc-400">
                Prepared for future static SPA deployment
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3 border-t border-white/8 pt-4 text-xs text-zinc-400">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
              <span>
                Build command:{' '}
                <code className="font-mono font-semibold text-zinc-200">
                  npm run build
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
              <span>
                Build output directory:{' '}
                <code className="font-mono font-semibold text-zinc-200">
                  dist
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
              <span>
                SPA route fallback configured in{' '}
                <code className="font-mono font-semibold text-zinc-200">
                  public/_redirects
                </code>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
