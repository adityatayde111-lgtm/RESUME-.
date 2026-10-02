/**
 * Vercel Serverless Function: /api/country
 * Proxies REST Countries API v5 to power Aditya's Global Remote Collaboration Explorer
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const query = (req.query?.q || 'canada').trim();
  const apiKey = process.env.RESTCOUNTRIES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'RESTCOUNTRIES_API_KEY environment variable not configured on server.',
      fallback: true
    });
  }

  try {
    const url = `https://api.restcountries.com/countries/v5?q=${encodeURIComponent(query)}&pretty=1`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `REST Countries API responded with status ${response.status}`,
        query
      });
    }

    const data = await response.json();
    const country = data?.data?.objects?.[0] || data?.objects?.[0] || data?.[0];

    if (!country) {
      return res.status(404).json({ error: 'Country not found', query });
    }

    // Extract cleanest representation
    const name = country.names?.common || country.names?.official || query;
    const official = country.names?.official || name;
    const capital = country.capitals?.[0]?.name || country.capital || 'N/A';
    const region = country.region || 'Global';
    const flagEmoji = country.flag?.emoji || '🌍';
    const flagSvg = country.flag?.url_svg || country.flag?.url_png || '';
    const currencies = country.currencies?.map(c => `${c.code} (${c.symbol || ''} ${c.name || ''})`).join(', ') || 'N/A';
    const timezones = country.timezones || ['UTC'];
    const population = country.population ? Number(country.population).toLocaleString() : 'N/A';

    // Calculate approximate time overlap with India (IST: UTC+5:30)
    let overlapSummary = '4-8 Hours Workday Overlap';
    const firstTz = timezones[0] || '';
    if (firstTz.includes('-')) {
      overlapSummary = '4-6 Hours Overlap (Morning/Evening Sync)';
    } else if (firstTz.includes('+')) {
      overlapSummary = '6-8 Hours Overlap (High Daily Sync)';
    }

    return res.status(200).json({
      name,
      official,
      capital,
      region,
      flagEmoji,
      flagSvg,
      currencies,
      timezones,
      population,
      overlapSummary,
      source: 'REST Countries API v5'
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Failed to fetch country intelligence',
      query
    });
  }
}
