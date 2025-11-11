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
    const response = await fetch(url);
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (err) {
    console.error("Fetch error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
