var express = require('express');
var path = require('path');
var trip = require('./data/trip.json');

module.exports.createServer = () => {
  const app = express();

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.get('/api/trip', (req, res) => res.json(trip));

  // UI: serve the Vite build output
  app.get('/sw.js', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, '..', 'dist', 'sw.js'));
  });
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });

  app.set('port', parseInt(process.env.PORT || '3001', 10));
  return app;
};

module.exports.default = async () => module.exports.createServer();
