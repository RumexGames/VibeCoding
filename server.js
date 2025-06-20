const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); // Use: npm install node-fetch@2

const app = express();
const PORT = 3000;
const url = 'http://localhost:11434/api/chat'; // Ollama endpoint
//const url ="http://141.69.58.30:11434/v1/chat"

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Chat API proxy
app.post('/api/chat', async (req, res) => {

  try {
    const { messages, model = 'llama3.2' } = req.body;

    const ollamaRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false })
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      console.log(text);
      return res.status(ollamaRes.status).send(text);
    }

    const data = await ollamaRes.json();
    console.log(data);
    res.json({ content: data.message?.content || '' });

  } catch (e) {
    console.error(e);
    res.status(500).send('Serverfehler beim Aufruf von Ollama');
  }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile("./public/index.html");
  });

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
