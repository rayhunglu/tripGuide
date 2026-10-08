#!/usr/bin/env node

// Local / long-running entry point (`npm start`). On Vercel api/index.js is used instead.
const app = require('./app').default;

app().then((app) => {
  const port = app.get('port');
  app.listen(port, () => console.log('Listening on port ' + port));
});
