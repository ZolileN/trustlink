import { useEffect, useState } from 'react';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerVerification } from './pages/SellerVerification';
import { VerificationResults } from './pages/VerificationResults';
import { getRouteName } from './pages/router';

declare global {
  interface Window {
    clarity?: (command: string, ...args: unknown[]) => void;
  }
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(getRouteName());

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getRouteName());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    if (window.clarity) {
      // Track SPA "page" changes in Microsoft Clarity
      window.clarity('set', 'page', currentRoute);
      window.clarity('track', 'page_view');
    }
  }, [currentRoute]);

  if (currentRoute === 'verify') {
    return <SellerVerification />;
  }

  if (currentRoute === 'results') {
    return <VerificationResults />;
  }

  return <BuyerDashboard />;
}

export default App;
