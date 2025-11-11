export async function handler(event, context) {
  try {
    const url = event.queryStringParameters.url;
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL parameter" }),
      };
    }

    // Use a public proxy to bypass CORS restrictions
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Proxy request failed: ${response.status}` }),
      };
    }

    const text = await response.text();
    return {
      statusCode: 200,
      body: text,
    };
  } catch (error) {
    console.error("FetchMail Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
