import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { url } = event.queryStringParameters;
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" }),
      };
    }

    console.log("Fetching:", url);

    // --- Primary request directly ---
    let response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Netlify Proxy)",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    // --- Fallback if blocked (1secmail returns HTML or fails) ---
    if (!response.ok || response.status >= 400) {
      console.warn("Primary fetch failed, trying fallback proxy...");
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl);
    }

    const text = await response.text();

    // --- Try to parse JSON, fallback to plain text ---
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.error("Proxy error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Proxy server error", details: err.message }),
    };
  }
};
