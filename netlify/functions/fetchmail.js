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

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Netlify Function)",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn("Non-JSON response:", text.substring(0, 200));
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Invalid response from target server" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Proxy error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Proxy server error", details: err.message }),
    };
  }
};
