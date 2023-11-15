const app = require('./src/app');

port = process.env['PORT'] || 4050;

app.listen(port, () => console.log(`Listening on port ${port}`));