const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

async function getSpotifyToken() {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  );
  return response.data.access_token;
}

app.get('/search', async (req, res) => {
  const { q, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'El parámetro q es requerido' });
  }

  try {
    const token = await getSpotifyToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q,
        type: 'track',
        limit: 10,
        offset: Number(offset),
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar en Spotify' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});