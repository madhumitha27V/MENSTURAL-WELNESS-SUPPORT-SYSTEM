require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { chat } = require('./controllers/chatController');

const app = express();
app.use(bodyParser.json());
app.post('/test-chat', async (req, res) => {
  req.user = { id: 1 };
  return chat(req, res);
});

const server = app.listen(0, async () => {
  const port = server.address().port;
  try {
    const response = await axios.post(`http://localhost:${port}/test-chat`, { message: 'Play Believer' });
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  } finally {
    server.close();
  }
});
