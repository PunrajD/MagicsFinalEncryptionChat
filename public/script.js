document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const dropZone = document.getElementById('dropZone');
    const outputElement = document.getElementById('output');

    let username = 'Anonymous';

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            username = data.ip;
        })
        .catch(error => console.error('Error fetching IP:', error));

    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            const response = await fetch('/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, username })
            });
            const { timeCode, encodedMessage } = await response.json();
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = `${username}: ${messageText}`;
            messagesContainer.appendChild(messageElement);
            messageInput.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    dropZone.addEventListener('drop', handleFileDrop);
});

async function handleFileDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.magic')) {
        alert("Please drop a valid .magic file");
        return;
    }

    const fileText = await file.text();
    const [encodedTime, ...rest] = fileText.trim().split(" ");
    const encodedText = rest.join(" ");

    const algorithm = await fetch("algorithm.json").then(res => res.json());

    const matchingTimeEntry = Object.entries(algorithm).find(
        ([_, data]) => data["time_code"] === encodedTime
    );

    if (!matchingTimeEntry) {
        outputElement.textContent = "Invalid timestamp or time code in .magic file.";
        return;
    }

    const [time, data] = matchingTimeEntry;
    const alphabetMapping = data["A"];
    const sampleLength = Object.values(alphabetMapping)[0].length;

    let decodedText = '';
    let i = 0;
    while (i < encodedText.length) {
        const charGroup = encodedText.slice(i, i + sampleLength);
        
        const decodedChar = Object.entries(alphabetMapping).find(
            ([_, mappedChars]) => mappedChars === charGroup
        );

        if (decodedChar) {
            decodedText += decodedChar[0];
            i += sampleLength;
        } else {
            decodedText += encodedText[i];
            i += 1;
        }
    }

    outputElement.textContent = `${time} - ${decodedText}`;
    outputElement.style.height = "auto";
    outputElement.style.height = `${outputElement.scrollHeight}px`;
}