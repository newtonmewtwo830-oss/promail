// netlify/functions/fetchMail.js
export async function handler(event) {
  try {
    const url = new URL(event.queryStringParameters.url);

    // Only allow safe domains
    const allowedHosts = ["www.1secmail.com", "api.mail.tm"];
    if (!allowedHosts.includes(url.hostname)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Domain not allowed" }),
      };
    }

    // Fetch from external API
    const response = await fetch(url.href);
    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
