const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const saudiAirlines = require('./data/saudi_airlines.json');
const globalTerms = require('./data/global_terms.json');
const gacaRegulations = require('./data/gaca_regulations.json');
const montrealConvention = require('./data/montreal_convention.json');

// 1. Identify airline from flight number
app.get('/airline', (req, res) => {
    const flight = req.query.flight;
    if (!flight) return res.status(400).json({ error: 'Missing flight query param (e.g. ?flight=SV108)' });

    const code = flight.match(/[a-zA-Z]+/)[0].toUpperCase();

    // Merge both datasets
    const allAirlines = [...saudiAirlines, ...globalTerms];

    const airline = allAirlines.find(a => a.iata.toUpperCase() === code);
    if (!airline) return res.status(404).json({ error: 'Airline not found' });

    res.json(airline);
});

// 2. Get GACA regulations
app.get('/regulations/gaca', (req, res) => {
  const rawKeyword = req.query.keyword;
  if (!rawKeyword) return res.status(400).json({ error: 'Missing keyword' });

  const keywords = rawKeyword.toLowerCase().split(',').map(k => k.trim());

  const matches = gacaRegulations.filter(r =>
    keywords.some(kw =>
      r.keyword.toLowerCase().includes(kw) ||
      r.summary.toLowerCase().includes(kw)
    )
  );

  if (matches.length === 0) {
    return res.status(404).json({ error: 'No matching GACA regulation found' });
  }

  res.json(matches);
});

// 3. Get Montreal Convention rule
app.get('/regulations/montreal', (req, res) => {
  const { article, keyword } = req.query;

  if (article) {
    const rule = montrealConvention.find(r =>
      r.article.toLowerCase().includes(article.toLowerCase())
    );
    if (!rule) return res.status(404).json({ error: 'Article not found in Montreal Convention' });
    return res.json(rule);
  }

  if (keyword) {
    const keywords = keyword.toLowerCase().split(',').map(k => k.trim());

    const matches = montrealConvention.filter(r =>
      keywords.some(kw =>
        r.keyword?.toLowerCase().includes(kw) ||
        r.summary?.toLowerCase().includes(kw) ||
        r.article?.toLowerCase().includes(kw)
      )
    );

    if (matches.length === 0) {
      return res.status(404).json({ error: 'Keyword not found in Montreal Convention' });
    }

    return res.json(matches);
  }

  res.status(400).json({ error: 'Provide either article or keyword query param' });
});

// 4. Fetch airline terms
app.get('/terms', (req, res) => {
    const airline = req.query.airline?.toLowerCase();
    if (!airline) return res.status(400).json({ error: 'Missing airline name' });

    const match = globalTerms.find(a => a.name.toLowerCase() === airline);
    if (!match) return res.status(404).json({ error: 'Airline not found or terms not available' });

    res.json(match);
});

// 5. Root route for health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Air Dispute API is running' });
});

app.listen(port, () => {
    console.log(`Air Dispute API running on port ${port}`);
});
