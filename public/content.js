// console.log("content.js loaded");

// let timeoutId;
// let inactivityTime = 10; // seconds (default)
// let buttonSelector = "";

// // Function to handle inactivity
// function startInactivityTimer() {
//   // Clear the old timer if any
//   clearTimeout(timeoutId);

//   // Set a new timer
//   timeoutId = setTimeout(() => {
//     const btn = document.querySelector(buttonSelector);
//     if (btn) {
//       btn.click();
//       console.log("Clicked the button due to 10 seconds of inactivity.");
//     } else {
//       console.log("Button not found.");
//     }
//   }, inactivityTime * 1000);
// }

// // Initialize and start monitoring
// function initInactivityMonitor() {
//   console.log("Initializing inactivity monitor...");

//   // Reset timer on user interaction
//   ["mousemove", "keydown", "scroll", "click"].forEach((eventName) => {
//     window.addEventListener(eventName, startInactivityTimer);
//   });

//   // Start the initial timer
//   startInactivityTimer();
// }

// // Get config values from chrome.storage
// chrome.storage.sync.get(["inactivityTime", "buttonSelector"], (data) => {
//   if (data.inactivityTime && data.buttonSelector) {
//     console.log("Settings loaded from storage:", data);
//     inactivityTime = data.inactivityTime;
//     buttonSelector = data.buttonSelector;
//     initInactivityMonitor();
//   } else {
//     console.log("Inactivity time or selector not set yet.");
//   }
// });


let timeoutId;
let inactivityTime = 10; // 10 seconds of inactivity (adjust as needed)
let buttonSelector = "";

// Util: Unique selector
function getUniqueSelector(el) {
  if (el.id) return `#${el.id}`;
  let path = [], parent;
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.className) {
      const classes = el.className.trim().split(/\s+/).join('.');
      selector += '.' + classes;
    }
    parent = el.parentNode;
    if (parent) {
      const siblings = Array.from(parent.children).filter(e => e.nodeName === el.nodeName);
      if (siblings.length > 1) {
        selector += `:nth-of-type(${1 + siblings.indexOf(el)})`;
      }
    }
    path.unshift(selector);
    el = parent;
  }
  return path.join(' > ');
}

// Reset inactivity timer
function resetTimer() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    const btn = document.querySelector(buttonSelector);
    if (btn) {
      btn.click();
      console.log("Clicked the button due to inactivity.");

      // Re-trigger the click after the same idle time (repeat the action)
      resetTimer();  // Recurse and click again in 10 seconds
    } else {
      console.log("Button not found.");
    }
  }, inactivityTime * 1000); // Click every 10 seconds
}

// Attach listeners
function initInactivityMonitor() {
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);
  window.addEventListener("scroll", resetTimer);
  resetTimer(); // Start counting immediately
}

// Listen from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startPicking") {
    console.log("User started picking a button");
    document.body.style.cursor = "crosshair";

    const highlight = (e) => {
      e.target.style.outline = "2px solid red";
    };
    const unhighlight = (e) => {
      e.target.style.outline = "";
    };
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener("mouseover", highlight);
      document.removeEventListener("mouseout", unhighlight);
      document.removeEventListener("click", handleClick, true);
      document.body.style.cursor = "";

      const button = e.target.closest("button, [role='button'], .btn");
      if (button) {
        const selector = getUniqueSelector(button);
        // Store temporarily, don't save yet
        chrome.storage.local.set({ tempButtonSelector: selector }, () => {
          alert(`Button selected. Please go back to popup and click Save Settings.`);
        });
      } else {
        alert("Please select a valid button.");
      }
    };

    document.addEventListener("mouseover", highlight);
    document.addEventListener("mouseout", unhighlight);
    document.addEventListener("click", handleClick, true);
  }
});

// Load settings and start
chrome.storage.sync.get(["inactivityTime", "buttonSelector"], (data) => {
  if (data.inactivityTime) inactivityTime = data.inactivityTime;
  if (data.buttonSelector) buttonSelector = data.buttonSelector;
  if (inactivityTime && buttonSelector) {
    initInactivityMonitor();
  } else {
    console.log("Inactivity settings incomplete.");
  }
});
