import { RouterProvider, useRouter, AppLink } from './contexts/RouterContext';
import { SiteProvider } from './contexts/SiteContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ServicesPage } from './pages/ServicesPage';
import { PricesPage } from './pages/PricesPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

function AppRoutes() {
  const { currentPath } = useRouter();

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminPage />;
  }

  let page = <HomePage />;
  if (currentPath === '/sobre') page = <AboutPage />;
  else if (currentPath === '/portfolio') page = <PortfolioPage />;
  else if (currentPath === '/servicos') page = <ServicesPage />;
  else if (currentPath === '/precos') page = <PricesPage />;
  else if (currentPath === '/contato') page = <ContactPage />;
  else if (currentPath !== '/') {
    page = (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-24 text-center space-y-5">
        <p className="font-mono-tabular text-xs text-[#C9A45C]">404</p>
        <h1 className="font-display text-4xl font-medium text-[#F5F3EF]">
          Página não encontrada
        </h1>
        <p className="text-sm text-[#A19D95]">
          O endereço acessado não corresponde a nenhuma seção do estúdio.
        </p>
        <div>
          <AppLink
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-[#C9A45C] text-[#070709] text-xs font-semibold"
          >
            Voltar ao Início
          </AppLink>
        </div>
      </div>
    );
  }

  return <PublicLayout>{page}</PublicLayout>;
}

export default function App() {
  return (
    <RouterProvider>
      <SiteProvider>
        <AppRoutes />
      </SiteProvider>
    </RouterProvider>
  );
}
