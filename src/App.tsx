import { useRoute } from '@/lib/router';
import { Navbar, Footer } from '@/components/Navbar';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FormBuilderPage } from '@/pages/FormBuilderPage';
import { ResponsesPage } from '@/pages/ResponsesPage';
import { PublicFormPage } from '@/pages/PublicFormPage';
import { EmbedDemoPage } from '@/pages/EmbedDemoPage';

function App() {
  const route = useRoute();

  const showChrome = route.name !== 'public';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {showChrome && <Navbar />}
      <main>
        {route.name === 'home' && <LandingPage />}
        {route.name === 'dashboard' && <DashboardPage />}
        {route.name === 'builder' && <FormBuilderPage formId={route.formId} />}
        {route.name === 'responses' && <ResponsesPage formId={route.formId} />}
        {route.name === 'public' && <PublicFormPage slug={route.slug} />}
        {route.name === 'embed-demo' && <EmbedDemoPage formId={route.formId} />}
      </main>
      {showChrome && <Footer />}
    </div>
  );
}

export default App;
