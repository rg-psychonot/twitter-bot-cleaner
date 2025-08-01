export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirect_uri, code_verifier } = req.body;

  if (!code || !redirect_uri || !code_verifier) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const clientId = process.env.REACT_APP_TWITTER_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_TWITTER_CLIENT_SECRET;
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      res.status(200).json(tokenData);
    } else {
      console.error('Twitter token exchange failed:', tokenResponse.status, tokenData);
      res.status(tokenResponse.status).json(tokenData);
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 