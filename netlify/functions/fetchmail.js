// netlify/functions/fetchmail.js
export async function handler(event, context) {
  try {
    const url = event.queryStringParameters.url;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL parameter" }),
      };
    }

    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Request failed with ${response.status}` }),
      };
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else {
      const text = await response.text();
      return {
        statusCode: 200,
        body: text,
      };
    }
  } catch (error) {
    console.error("FetchMail Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
