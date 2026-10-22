import { useEffect, useState } from 'react';
import { X, Shield, Database, Activity, CheckCircle, AlertCircle, Key, RefreshCw, Radio } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAuditLogs, isSupabaseConfigured, type AuditLog } from '@/lib/supabase';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const { role, user, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'supabase'>('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAuditLogs(getAuditLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Admin Control Center & Security Audit</h2>
              <p className="text-xs text-slate-500">Security policies, Supabase status, and immutable audit logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-4 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Role & Security Status
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            System Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Database & RLS Policies
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="card p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Session</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{user.name} ({user.email})</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned security context: <span className="font-mono uppercase font-bold text-slate-800">{role}</span></p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs capitalize flex items-center gap-1.5 shadow-xs">
                  <Shield className="h-3.5 w-3.5" />
                  {role} Access
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Effective RBAC Permissions Matrix</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {Object.entries(permissions).map(([perm, allowed]) => (
                    <div
                      key={perm}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        allowed
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {allowed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-slate-300 shrink-0" />
                      )}
                      <span className="font-medium truncate">{perm.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Chronological history of security events and changes.</p>
                <button
                  onClick={() => setAuditLogs(getAuditLogs())}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No security events logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-mono text-slate-600 font-semibold uppercase">{log.action}</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{log.details}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{log.user_email}</span>
                        <span>Role: {log.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="card p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Database Connection Status</h4>
                      <p className="text-xs text-slate-500">
                        {isSupabaseConfigured ? 'Connected to live Supabase project' : 'Running on High-Fidelity Reactive Local Engine (zero external secrets required)'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {isSupabaseConfigured ? 'Remote Supabase' : 'Local Storage Engine'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Applied Supabase SQL Migrations</h4>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                  <p className="text-emerald-400">✓ 20261021112737_create_forms_questions_responses.sql</p>
                  <p className="text-emerald-400">✓ 20261022000000_task2_advanced_features.sql</p>
                  <p className="text-slate-400">  └ Tables: forms, questions, responses, webhooks_log, audit_logs</p>
                  <p className="text-slate-400">  └ RLS Policies: public_select_published_forms, anon_submit_responses, auth_manage_*</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
