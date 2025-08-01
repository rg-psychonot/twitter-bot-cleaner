export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, accessToken } = req.body;

  console.log('Debug - Endpoint:', endpoint);
  console.log('Debug - Access token exists:', !!accessToken);
  console.log('Debug - Access token length:', accessToken?.length);

  if (!endpoint || !accessToken) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const url = `https://api.twitter.com/2${endpoint}`;
    console.log('Debug - Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Debug - Twitter response status:', response.status);
    console.log('Debug - Twitter response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Debug - Twitter response data:', data);

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