// document.getElementById("save").addEventListener("click", async () => {
//     const time = Number(document.getElementById("inactivityTime").value);
//     const selector = document.getElementById("buttonSelector").value;
//     console.log(time,"time")
//     console.log(selector,"selector")
  
//     chrome.storage.sync.set({
//       inactivityTime: time,
//       buttonSelector: selector
//     });
  
//     alert("Settings saved!",selector);
//   });
  


document.addEventListener("DOMContentLoaded", () => {
    const timeInput = document.getElementById("inactivityTime");
    const buttonSelectorInput = document.getElementById("buttonSelector");
    const pickButton = document.getElementById("pickButton");
    const saveButton = document.getElementById("saveButton");
  
    // Load current values
    chrome.storage.sync.get(["inactivityTime", "buttonSelector"], (data) => {
      if (data.inactivityTime) timeInput.value = data.inactivityTime;
      if (data.buttonSelector) buttonSelectorInput.value = data.buttonSelector;
    });
  
    // Start picker
    pickButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startPicking" });
      });
    })
  
    // Save settings
    saveButton.addEventListener("click", () => {
      const inactivityTime = parseInt(timeInput.value);
      // First try to use the value from local if user picked a button
      chrome.storage.local.get("tempButtonSelector", (tempData) => {
        const finalSelector = tempData.tempButtonSelector || buttonSelectorInput.value;
        chrome.storage.sync.set(
          {
            inactivityTime,
            buttonSelector: finalSelector,
          },
          () => {
            alert("Settings saved.");
            chrome.storage.local.remove("tempButtonSelector");
          }
        );
      });
    });
  });
  