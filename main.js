const quotes = [
"Also Try Bloxcraft UBG!",
  "zane say NO.",
  "HI BRAYLENNN!",
  "No, really, don't get up.",
  "Whatever",
  "Etc.",
  "sup bby boy.",
  "monkeh",
  "HELP",
  "green fn?",
  "roblox is ass.",
  "no gooning in class to jjk jayden.",
  "batman.",
];

function displayRandomQuote() {
const quoteElement = document.getElementById("test");
const q = quotes[Math.floor(Math.random() * quotes.length)];

// Instantly hide the current text
quoteElement.style.opacity = "0";
quoteElement.style.animation = "none";

// Force browser to recognize the reset
void quoteElement.offsetWidth;

// Update text and restart fade animation
quoteElement.innerHTML = q;
quoteElement.style.animation = "fadeIn 1.2s ease forwards";
}

