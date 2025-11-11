// script.js - ProMail with Netlify Function Proxy
console.log("script.js connected");

const emailAddress = document.getElementById("email-address");
const copyBtn = document.getElementById("copy-btn");
const genBtn = document.getElementById("gen-btn");
const customName = document.getElementById("customName");
const messageList = document.getElementById("message-list");
const themeToggle = document.getElementById("theme-toggle");

let currentEmail = "";
let currentLogin = "";
let currentDomain = "";
let inboxTimer = null;

// ------------------ Create Inbox ------------------
async function createInbox() {
  clearInterval(inboxTimer);
  emailAddress.textContent = "Generating...";
  messageList.innerHTML = `<li class="p-3 text-gray-400 italic">Waiting for messages...</li>`;

  try {
    // Call our Netlify proxy function (no CORS issues)
    const url = `https://www.1secmail.com/api/v1/?action=genRandomMailbox`;
    const proxyUrl = `/.netlify/functions/fetchmail?url=${encodeURIComponent(url)}`;

    const res = await fetch(proxyUrl);
    const data = await res.json();

    if (!data || !data[0]) {
      throw new Error("Invalid response");
    }

    currentEmail = data[0];
    emailAddress.textContent = currentEmail;

    // Split email into login & domain
    const [login, domain] = currentEmail.split("@");
    currentLogin = login;
    currentDomain = domain;

    // Start fetching inbox messages
    await getMessages();
    inboxTimer = setInterval(getMessages, 15000);
  } catch (err) {
    console.error("Error generating email:", err);
    emailAddress.textContent = "Error generating email.";
  }
}

// ------------------ Get Messages ------------------
async function getMessages() {
  if (!currentLogin || !currentDomain) return;

  try {
    const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${currentLogin}&domain=${currentDomain}`;
    const proxyUrl = `/.netlify/functions/fetchMail?url=${encodeURIComponent(url)}`;

    const res = await fetch(proxyUrl);
    const mails = await res.json();

    if (!Array.isArray(mails) || mails.length === 0) {
      messageList.innerHTML = `<li class="p-3 text-gray-400 italic">No new messages</li>`;
      return;
    }

    messageList.innerHTML = "";
    mails.forEach((msg) => {
      const li = document.createElement("li");
      li.className = "p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
      li.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <strong class="block">${escapeHtml(msg.from || "unknown")}</strong>
            <span class="block text-sm text-gray-500">${escapeHtml(msg.subject || "(no subject)")}</span>
          </div>
          <div class="text-xs text-gray-400">${formatTimestamp(msg.date)}</div>
        </div>
      `;
      li.addEventListener("click", () => showMessage(msg.id));
      messageList.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}

// ------------------ Show single message ------------------
async function showMessage(id) {
  if (!currentLogin || !currentDomain) return;
  try {
    const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${currentLogin}&domain=${currentDomain}&id=${id}`;
    const proxyUrl = `/.netlify/functions/fetchMail?url=${encodeURIComponent(url)}`;

    const res = await fetch(proxyUrl);
    const msg = await res.json();

    if (!msg) return alert("Failed to load message");

    alert(`From: ${msg.from}\nSubject: ${msg.subject}\n\n${stripHtml(msg.textBody || msg.htmlBody || "(no content)")}`);
  } catch (err) {
    console.error("Error loading message:", err);
    alert("Error loading message.");
  }
}

// ------------------ Helpers ------------------
function formatTimestamp(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "");
}

// ------------------ UI events ------------------
copyBtn.addEventListener("click", () => {
  if (!currentEmail) return;
  navigator.clipboard.writeText(currentEmail).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  });
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}

if (genBtn) {
  genBtn.addEventListener("click", createInbox);
}

// Auto-start on load
createInbox();
