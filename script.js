// ProMail – Production Version (Netlify Ready)
console.log("script.js connected");

// No proxy needed in production HTTPS environment
const proxy = "/.netlify/functions/fetchmail?url=";

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

// ------------------ Generate new email ------------------
async function createInbox(custom = "") {
  clearInterval(inboxTimer);
  emailAddress.textContent = "Generating...";
  messageList.innerHTML =
    `<li class="p-3 text-gray-400 italic">Waiting for messages...</li>`;

  try {
    let address = "";

    if (custom.trim() !== "") {
      // Fetch available domains
      const url = "https://www.1secmail.com/api/v1/?action=getDomainList";
      const domainsRes = await fetch(url);
      const domains = await domainsRes.json();
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      address = `${custom.trim()}@${randomDomain}`;
    } else {
      // Generate random mailbox
      const url = "https://www.1secmail.com/api/v1/?action=genRandomMailbox";
      const res = await fetch(url);
      const data = await res.json();
      address = data[0];
    }

    currentEmail = address;
    const parts = address.split("@");
    currentLogin = parts[0];
    currentDomain = parts[1];

    emailAddress.textContent = currentEmail;

    // Start polling inbox
    await getMessages();
    inboxTimer = setInterval(getMessages, 15000);

  } catch (err) {
    console.error("Error creating inbox:", err);
    emailAddress.textContent = "Error generating email.";
  }
}

// ------------------ Fetch inbox ------------------
async function getMessages() {
  if (!currentLogin || !currentDomain) return;

  try {
    const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${currentLogin}&domain=${currentDomain}`;
    const res = await fetch(url);
    const mails = await res.json();

    messageList.innerHTML = "";
    if (!mails.length) {
      messageList.innerHTML = `<li class="p-3 text-gray-400 italic">No new messages</li>`;
      return;
    }

    mails.forEach((msg) => {
      const li = document.createElement("li");
      li.className = "p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
      li.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <strong class="block">${msg.from}</strong>
            <span class="block text-sm text-gray-500">${msg.subject}</span>
          </div>
          <div class="text-xs text-gray-400">${msg.date}</div>
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
  try {
    const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${currentLogin}&domain=${currentDomain}&id=${id}`;
    const res = await fetch(url);
    const data = await res.json();

    alert(
      `From: ${data.from}\nSubject: ${data.subject}\nDate: ${data.date}\n\n${stripHtml(data.body)}`
    );
  } catch (err) {
    console.error("Error loading message:", err);
    alert("Error loading message.");
  }
}

// ------------------ Helpers ------------------
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "");
}

// ------------------ UI Events ------------------
copyBtn.addEventListener("click", () => {
  if (!currentEmail) return;
  navigator.clipboard.writeText(currentEmail);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

genBtn.addEventListener("click", () => {
  createInbox(customName.value);
});

// auto-start
createInbox();
