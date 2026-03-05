import { useEffect, useState } from 'react';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerVerification } from './pages/SellerVerification';
import { VerificationResults } from './pages/VerificationResults';
import { getRouteName } from './pages/router';

function App() {
  const [currentRoute, setCurrentRoute] = useState(getRouteName());

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getRouteName());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (currentRoute === 'verify') {
    return <SellerVerification />;
  }

  if (currentRoute === 'results') {
    return <VerificationResults />;
  }

  return <BuyerDashboard />;
}

export default App;
