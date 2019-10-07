const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');

const secrets = require('./config/secrets');

const app = express();
const port = secrets.AppPort || 3333;

app.use(express.static(path.join(process.cwd(), 'dist'), { maxAge: 604800000, lastModified: true }));

app.use('/api', proxy({
  target: secrets.ProxyTarget,
  pathRewrite: { '^/api': '/scapic-others' },
  secure: false,
  changeOrigin: true,
}));

app.listen(port, err => {
  if (err) throw err;

  console.log('\n\n\n ----------------=========----------------');
  console.log(`The application is up and running on '${port}' port`);
  console.log(' ----------------=========---------------- \n\n\n');
});
