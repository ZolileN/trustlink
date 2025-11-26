export function useParams() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'verify' && segments[1]) {
    return { token: segments[1] };
  }

  if (segments[0] === 'results' && segments[1]) {
    return { token: segments[1] };
  }

  return {};
}

export function getRouteName(): 'home' | 'verify' | 'results' {
  const path = window.location.pathname;

  if (path.startsWith('/verify/')) {
    return 'verify';
  }

  if (path.startsWith('/results/')) {
    return 'results';
  }

  return 'home';
}
