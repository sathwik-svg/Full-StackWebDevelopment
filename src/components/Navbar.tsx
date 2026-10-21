import { useEffect, useState } from 'react';
import { MessageCircle, Menu, X } from 'lucide-react';
import { useRoute, useNavigate, type Route } from '@/lib/router';

export function Navbar() {
  const route = useRoute();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  const isLanding = route.name === 'home';

  function go(r: Route) {
    navigate(r);
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || !isLanding ? 'bg-white/90 backdrop-blur-md border-b border-slate-200' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <button onClick={() => go({ name: 'home' })} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className={`text-lg font-bold ${isLanding && !scrolled ? 'text-white' : 'text-slate-900'}`}>Formflow</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {isLanding && !scrolled && (
            <>
              <a href="#features" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">Features</a>
              <a href="#how" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">How it works</a>
              <a href="#demo" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition">Demo</a>
            </>
          )}
          {(!isLanding || scrolled) && (
            <>
              <a href="#features" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#how" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">How it works</a>
              <a href="#demo" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">Demo</a>
            </>
          )}
          <button onClick={() => go({ name: 'dashboard' })} className="ml-2 btn-primary">Open dashboard</button>
        </nav>

        <button onClick={() => setMenuOpen((v) => !v)} className={`md:hidden p-2 rounded-lg ${isLanding && !scrolled ? 'text-white' : 'text-slate-700'}`} aria-label="Menu">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-5 py-3 space-y-1 animate-fade-in">
          {isLanding && (
            <>
              <a href="#features" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
              <a href="#how" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">How it works</a>
              <a href="#demo" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Demo</a>
            </>
          )}
          <button onClick={() => go({ name: 'dashboard' })} className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-900">Open dashboard</button>
        </div>
      )}
    </header>
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
            <p className="text-sm text-slate-500 leading-relaxed">Build conversational forms and embed them anywhere with a chatbot widget.</p>
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
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="mailto:hello@formflow.app" className="hover:text-slate-900 transition">hello@formflow.app</a></li>
              <li><span className="text-slate-400">Mon–Fri, 9am–5pm</span></li>
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
