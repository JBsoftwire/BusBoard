const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World!'));
// app.get('/goodbye', (req, res) => res.send('Goodbye World!'));

app.get('/board/:postcode', (req, res) => res.send(req.params.postcode))

app.listen(3000, () => console.log('Example app listening on port 3000!'));