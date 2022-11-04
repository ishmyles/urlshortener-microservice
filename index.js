require('dotenv').config();
const express = require('express');
const dns = require('node:dns');
const cors = require('cors');
const app = express();

const mockDB = {};
let currNum = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', function(req, res) {
  res.redirect(mockDB[req.params.id]);
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const httpRegex = /(http(||s):\/\/)/g;
  const urlString = (httpRegex.test(url)) 
    ? new URL(url) : (!httpRegex.test(url)) ? new URL('http://' + url) : url;
  
  await dns.lookup(urlString.host, (err, add, fam) => {
    if (err) return res.json({ error: 'invalid url' });

    mockDB[currNum] = urlString.href;
    currNum++;
    console.log(mockDB)
    res.json({ original_url : mockDB[currNum - 1], short_url : currNum - 1});
  });

  /* 
  //Alternate solution just using REGEX
  const httpRegex = /(http(||s):\/\/)/g;
  
  if (httpRegex.test(req.body.url) === false) return res.json({ error: 'invalid url' });

    mockDB[currNum] = req.body.url
    currNum++;
    console.log(mockDB)
    res.json({ original_url : mockDB[currNum - 1], short_url : currNum - 1});*/
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
