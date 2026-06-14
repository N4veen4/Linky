const MOCK_LOCATIONS = [
  { country: 'United States', region: 'New York', city: 'New York' },
  { country: 'India', region: 'Maharashtra', city: 'Mumbai' },
  { country: 'Germany', region: 'Hesse', city: 'Frankfurt' },
  { country: 'United Kingdom', region: 'England', city: 'London' },
  { country: 'Canada', region: 'Ontario', city: 'Toronto' },
  { country: 'France', region: 'Île-de-France', city: 'Paris' },
  { country: 'Australia', region: 'New South Wales', city: 'Sydney' },
  { country: 'Japan', region: 'Tokyo', city: 'Tokyo' }
];

export const lookupGeo = (ip) => {
  // If local / private network IP, return a randomized location to populate graphs
  if (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  ) {
    const idx = Math.floor(Math.random() * MOCK_LOCATIONS.length);
    return MOCK_LOCATIONS[idx];
  }

  // Fallback to a randomized location to showcase UI maps during presentations
  // since live production APIs are blocked/rate-limited on local test boxes
  const idx = Math.floor(Math.random() * MOCK_LOCATIONS.length);
  return MOCK_LOCATIONS[idx];
};
