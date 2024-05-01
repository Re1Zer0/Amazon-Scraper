// server.js
const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/scrape', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }
    try {
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' }
        });
        const dom = new JSDOM(data);
        const products = Array.from(dom.window.document.querySelectorAll('.s-result-item')).map(item => ({
            title: item.querySelector('h2 a span')?.textContent,
            rating: item.querySelector('.a-icon-alt')?.textContent,
            reviewCount: item.querySelector('.a-size-small .a-size-base')?.textContent,
            imageUrl: item.querySelector('.s-image')?.src
        })).filter(product => product.title && product.rating && product.reviewCount && product.imageUrl);

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
