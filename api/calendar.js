
// Diresto Properties — iCal Proxy
// Deploy to Vercel for free at vercel.com
// This file goes in /api/calendar.js

const FEEDS = {
  p1: {
    name: 'Modern 2BR/2BA Retreat – Birmingham',
    airbnb: 'https://www.airbnb.com/calendar/ical/1629116377953605272.ics?t=71d5920e4685465cb6e8d84c95d84105',
    vrbo:   'https://www.vrbo.com/icalendar/ac628191dbe74944994dcbdf0af07998.ics?nonTentative'
  },
  p2: {
    name: 'Cozy 2BR Near UAB – Birmingham',
    airbnb: 'https://www.airbnb.com/calendar/ical/1532108571853292438.ics?t=8b8a434965bc4ce59e9f924ed20cd400',
    vrbo:   'https://www.vrbo.com/icalendar/12f9d4474c004e03bdae47a60b69a01e.ics?nonTentative'
  },
  p3: {
    name: 'Desert Escape – Joshua Tree',
    airbnb: 'https://www.airbnb.com/calendar/ical/1539525220766103448.ics?t=4e0970985bf141f3923aeec773dbb40a',
    vrbo:   'https://www.vrbo.com/icalendar/01aa0c08dbe044d6bb638ac172a961c0.ics?nonTentative'
  }
};

export default async function handler(req, res) {
  // Allow requests from your Wix site and any origin (for iframe)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const prop = req.query.prop || 'p1';
  const feed = FEEDS[prop];

  if (!feed) {
    res.status(400).json({ error: 'Invalid property. Use p1, p2, or p3.' });
    return;
  }

  try {
    const [airbnbRes, vrboRes] = await Promise.all([
      fetch(feed.airbnb).then(r => r.ok ? r.text() : '').catch(() => ''),
      fetch(feed.vrbo).then(r => r.ok ? r.text() : '').catch(() => '')
    ]);

    // Cache for 15 minutes
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json({
      property: feed.name,
      airbnb: airbnbRes,
      vrbo: vrboRes,
      synced: new Date().toISOString()
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendars', details: err.message });
  }
}
