const mobileNumbersInput = document.getElementById("mobileNumbers");
const messageInput = document.getElementById("message");
const sendWhatsappButton = document.getElementById("send-whatsapp-now");
const successMessageDiv = document.getElementById("success-message");
const errorMessageDiv = document.getElementById("error-message");
const messageSendingLoaderDiv = document.getElementById(
  "message-sending-loader"
);
const sendingCountDiv = document.getElementById("sending-count");

const intervalForDelay = 10;
const delayBeforeNextMessage = 2000;

let sendingInProgress = false;
let totalMessagesToSent = 0;
let totalMessageSent = 0;

sendWhatsappButton.addEventListener("click", function () {
  if (sendingInProgress) {
    return;
  }

  successMessageDiv.innerText = "";
  errorMessageDiv.innerText = "";
  totalMessagesToSent = 0;
  totalMessageSent = 0;

  const mobileNumbers = mobileNumbersInput.value;
  const message = messageInput.value;

  const allOk = validateInputs(mobileNumbers);
  if (!allOk) {
    return;
  }

  sendMessage(mobileNumbers, message);
});

function processMessage(mobile, index, message, mobileNumbers) {
  console.log(`Processing item ${index}: ${mobile}`);

  const data = {
    mobile: `${mobile.replace("+", "").trim()}@c.us`,
    message: message,
  };
  ipcRenderer.send("send-whatsapp-text-message", JSON.stringify(data));

  totalMessageSent = totalMessageSent + 1;
  setSendngWhatsappLoaderDivContent();

  if (index % intervalForDelay === 0 && index !== 0) {
    setTimeout(() => {
      processNextMessage(index + 1, mobileNumbers, message);
    }, delayBeforeNextMessage);
  } else {
    processNextMessage(index + 1, mobileNumbers, message);
  }
}

function processNextMessage(index, mobileNumbers, message) {
  const numbersArray = mobileNumbers.split(",");

  if (index < numbersArray.length) {
    processMessage(numbersArray[index], index, message, mobileNumbers);
  } else {
    console.log("Finished processing all items.");

    sendingCountDiv.innerHTML = "";
    messageSendingLoaderDiv.innerText = "";
    successMessageDiv.innerText = "All the messages were sent successfully";
    sendingInProgress = false;
  }
}

function sendMessage(mobileNumbers, message) {
  console.log("sending messages");

  sendingInProgress = true;
  messageSendingLoaderDiv.innerText = "Sending...";

  const numbersArray = mobileNumbers.split(",");
  totalMessagesToSent = numbersArray.length;
  totalMessageSent = 0;

  processNextMessage(0, mobileNumbers, message);
}

function validateInputs(mobileNumbers) {
  if (mobileNumbers.length === 0) {
    errorMessageDiv.innerText = "Please enter atleast one WhatsApp number";
    return false;
  }

  const numbersArray = mobileNumbers.split(",");

  const mobileNumberPattern = /^\+\d{10,15}$/;

  for (const number of numbersArray) {
    if (!mobileNumberPattern.test(number.trim())) {
      errorMessageDiv.innerText =
        "You have entered WhatsApp number in wrong format, please enter valid WhatsApp numbers";
      return false;
    }
  }

  if (message.length === 0) {
    errorMessageDiv.innerText = "Please enter message";
    return false;
  }

  errorMessageDiv.innerText = "";

  return true;
}

function setSendngWhatsappLoaderDivContent() {
  sendingCountDiv.innerHTML = "";

  const spanTitle = document.createElement("span");
  spanTitle.innerText = "Total messages sent till now: ";

  const spanCount = document.createElement("span");
  spanCount.innerText = `${totalMessageSent}/${totalMessagesToSent}`;

  sendingCountDiv.appendChild(spanTitle);
  sendingCountDiv.appendChild(spanCount);
}
