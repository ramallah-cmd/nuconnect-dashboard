// api/airtable.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { baseId, tableName, apiToken, method = 'GET', recordId, body } = req.body || req.query;

  if (!baseId || !tableName || !apiToken) {
    return res.status(400).json({ 
      error: 'Missing required parameters: baseId, tableName, apiToken' 
    });
  }

  try {
    const url = recordId 
      ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`
      : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || 'Airtable API error',
        details: data
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}
