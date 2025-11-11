export default async (req, res) => {
  const url = new URL(req.url).searchParams.get("url");
  const response = await fetch(url);
  const data = await response.text();
  res.setHeader("Access-Control-Allow-Origin", "*");
  return new Response(data);
};
