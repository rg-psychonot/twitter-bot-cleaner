export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, accessToken } = req.body;

  if (!endpoint || !accessToken) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch(`https://api.twitter.com/2${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      console.error('Twitter API error:', response.status, data);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Twitter API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 