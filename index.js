require('dotenv').config();
const express = require('express');
const dns = require('node:dns');
const cors = require('cors');
const mongoose = require('mongoose');
const Shorturl = require('./models/shorturl');
const { IdGenerator } = require("custom-random-id");
const app = express();

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("open", () => console.log('Connected to the MongoDB database.'))
  .on("error", console.error.bind(console, "MongoDB connection error:"));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', async (req, res) => {
  const shorturl = await Shorturl.findOne({shortUrl: req.params.id});
  res.redirect(shorturl.originalUrl);
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const httpRegex = /(http(||s):\/\/)/g;
  const urlString = (httpRegex.test(url)) 
    ? new URL(url) : (!httpRegex.test(url)) 
    ? new URL('http://' + url) : url;
  
  await dns.lookup(urlString.host, async (err, add, fam) => {
    if (err) return res.json({ error: 'invalid url' });

    const ID = new IdGenerator("{{ string_5 }}");
    const generatedUrl = ID.getFinalExpression();
    const newUrl = new Shorturl({
      originalUrl: urlString.href,
      shortUrl: generatedUrl
    })
    const data = await newUrl.save();
    res.json({ original_url : data.originalUrl, short_url : data.shortUrl});
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
