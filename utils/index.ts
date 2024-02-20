export async function getRampToken() {
  const endpoint = `${process.env.RAMP_API_URL}/token`;

  const clientId = process.env.RAMP_CLIENT_ID;
  const clientSecret = process.env.RAMP_SECRET_ID;

  const headers = {
    Accept: 'application/json',
    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const requestBody = {
    grant_type: 'client_credentials',
    scope: 'cards:read transactions:read',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: new URLSearchParams(requestBody),
  });

  const tokenRes: any = await response.json();
  return tokenRes.access_token;
}
