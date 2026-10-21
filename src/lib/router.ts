import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'dashboard' }
  | { name: 'builder'; formId: string }
  | { name: 'responses'; formId: string }
  | { name: 'public'; slug: string }
  | { name: 'embed-demo'; formId: string }
  | { name: 'embed-standalone'; formId: string };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'dashboard') return { name: 'dashboard' };
  if (parts[0] === 'builder' && parts[1]) return { name: 'builder', formId: parts[1] };
  if (parts[0] === 'responses' && parts[1]) return { name: 'responses', formId: parts[1] };
  if (parts[0] === 'embed' && parts[1]) return { name: 'embed-demo', formId: parts[1] };
  if (parts[0] === 'widget' && parts[1]) return { name: 'embed-standalone', formId: parts[1] };
  if (parts[0] === 'f' && parts[1]) return { name: 'public', slug: parts[1] };

  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/';
    case 'dashboard': return '#/dashboard';
    case 'builder': return `#/builder/${route.formId}`;
    case 'responses': return `#/responses/${route.formId}`;
    case 'public': return `#/f/${route.slug}`;
    case 'embed-demo': return `#/embed/${route.formId}`;
    case 'embed-standalone': return `#/widget/${route.formId}`;
  }
}

export function navigate(route: Route) {
  window.location.hash = routeToHash(route);
  window.scrollTo({ top: 0 });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function useNavigate() {
  return useCallback((route: Route) => navigate(route), []);
}
