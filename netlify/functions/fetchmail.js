// ------------------ Create Inbox ------------------
async function createInbox(custom = "") {
  emailAddress.textContent = "Generating...";
  messageList.innerHTML = `<li class="p-3 text-gray-400 italic">Waiting for messages...</li>`;

  const randomName =
    custom && custom.trim() !== ""
      ? custom.trim()
      : Math.random().toString(36).substring(2, 10);

  try {
    // ✅ use reliable open CORS proxy
    const corsProxy = "https://api.allorigins.win/raw?url=";
    const apiUrl = `https://www.1secmail.com/api/v1/?action=genRandomMailbox`;
    const fullUrl = `${corsProxy}${encodeURIComponent(apiUrl)}`;

    const res = await fetch(fullUrl);
    const data = await res.json();

    if (!Array.isArray(data) || !data[0]) {
      throw new Error("Invalid response");
    }

    address = data[0];
    emailAddress.textContent = address;
    console.log("Generated address:", address);
  } catch (err) {
    console.error("Error generating email:", err);
    emailAddress.textContent = "Error generating email.";
  }
}
