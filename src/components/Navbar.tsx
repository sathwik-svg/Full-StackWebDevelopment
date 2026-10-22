import { useEffect, useState } from 'react';
import { MessageCircle, Menu, X, Shield, Layers, ChevronDown, Check } from 'lucide-react';
import { useRoute, useNavigate, type Route } from '@/lib/router';
import { useAuth, type UserRole } from '@/lib/auth';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import { AdminSettingsModal } from './AdminSettingsModal';

export function Navbar() {
  const route = useRoute();
  const navigate = useNavigate();
  const { role, setRole, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setRoleDropdownOpen(false);
  }, [route]);

  const isLanding = route.name === 'home';

  function go(r: Route) {
    navigate(r);
  }

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    creator: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    viewer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled || !isLanding ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => go({ name: 'home' })} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs group-hover:scale-105 transition-transform">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-bold tracking-tight ${isLanding && !scrolled ? 'text-white' : 'text-slate-900'}`}>
                Formflow
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 font-mono">
                v2
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {isLanding && !scrolled ? (
              <>
                <a href="#features" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">Features</a>
                <a href="#how" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">How it works</a>
                <a href="#demo" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">Demo</a>
              </>
            ) : (
              <>
                <button
                  onClick={() => go({ name: 'dashboard' })}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    route.name === 'dashboard' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setTemplatesOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
                >
                  <Layers className="h-4 w-4 text-indigo-500" />
                  Templates
                </button>
                <button
                  onClick={() => setAdminSettingsOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
                >
                  <Shield className="h-4 w-4 text-slate-500" />
                  Security & Audit
                </button>
              </>
            )}

            {/* RBAC Role Selector Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition ${roleColors[role]}`}
                title="Switch User Role to test RBAC"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="capitalize">{role}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 text-xs z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch RBAC Role:
                  </div>
                  {(['admin', 'creator', 'viewer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="capitalize">
                        <span className="font-semibold text-slate-800">{r}</span>
                        <p className="text-[10px] text-slate-400">
                          {r === 'admin' ? 'Full delete & settings access' : r === 'creator' ? 'Create & edit forms' : 'Read-only view & CSV export'}
                        </p>
                      </div>
                      {role === r && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => go({ name: 'dashboard' })}
              className="ml-2 btn-primary text-xs py-2 px-3.5"
            >
              Open Dashboard
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`md:hidden p-2 rounded-lg ${isLanding && !scrolled ? 'text-white' : 'text-slate-700'}`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-5 py-4 space-y-2 animate-fade-in">
            <button
              onClick={() => go({ name: 'dashboard' })}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setTemplatesOpen(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Template Gallery
            </button>
            <button
              onClick={() => {
                setAdminSettingsOpen(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Security Audit & Logs
            </button>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <span className="text-xs text-slate-500">Active Role:</span>
              <div className="flex gap-1.5">
                {(['admin', 'creator', 'viewer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md capitalize ${
                      role === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <TemplateGalleryModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
      />
      <AdminSettingsModal
        isOpen={adminSettingsOpen}
        onClose={() => setAdminSettingsOpen(false)}
      />
    </>
  );
}

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">Formflow</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Build conversational forms and embed them anywhere with a chatbot widget.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-slate-900 transition">Features</a></li>
              <li><a href="#how" className="hover:text-slate-900 transition">How it works</a></li>
              <li><a href="#demo" className="hover:text-slate-900 transition">Live demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">App</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => navigate({ name: 'dashboard' })} className="hover:text-slate-900 transition">Dashboard</button></li>
              <li><button onClick={() => navigate({ name: 'dashboard' })} className="hover:text-slate-900 transition">Create a form</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Security & RBAC</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><span className="text-slate-600">Supabase Row-Level Security</span></li>
              <li><span className="text-slate-600">Admin, Creator & Viewer Roles</span></li>
              <li><span className="text-slate-400">Strict Webhook Sanitization</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Formflow. All rights reserved.</p>
          <p className="text-xs text-slate-400">Built with React, TypeScript & Supabase.</p>
        </div>
      </div>
    </footer>
  );
}
