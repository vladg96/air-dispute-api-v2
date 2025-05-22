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
    const airline = [...saudiAirlines].find(a => a.iata === code);
    if (!airline) return res.status(404).json({ error: 'Airline not found' });

    res.json(airline);
});

// 2. Get GACA regulations
app.get('/regulations/gaca', (req, res) => {
    const keyword = req.query.keyword?.toLowerCase();
    if (!keyword) return res.status(400).json({ error: 'Missing keyword' });

    const match = gacaRegulations.find(r => r.keyword.toLowerCase() === keyword);
    if (!match) return res.status(404).json({ error: 'No matching GACA regulation found' });

    res.json(match);
});

// 3. Get Montreal Convention rule
app.get('/regulations/montreal', (req, res) => {
    const article = req.query.article;
    if (!article) return res.status(400).json({ error: 'Missing article' });

    const rule = montrealConvention.find(r => r.article === article);
    if (!rule) return res.status(404).json({ error: 'Article not found in Montreal Convention' });

    res.json(rule);
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
