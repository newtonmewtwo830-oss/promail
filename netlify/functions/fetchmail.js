// netlify/functions/fetchMail.js
export async function handler(event) {
  const target = event.queryStringParameters.url;

  if (!target) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing URL parameter" }),
    };
  }

  try {
    // ✅ Allow public temp mail APIs
    const allowedHosts = ["www.1secmail.com", "api.mail.tm"];
    const parsed = new URL(target);

    if (!allowedHosts.includes(parsed.hostname)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Domain not allowed" }),
      };
    }

    // ✅ Fetch the data
    const response = await fetch(target, {
      headers: { "User-Agent": "ProMail-Netlify-Proxy" },
    });

    const text = await response.text();

    // ✅ Return the result safely with CORS enabled
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: text,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
