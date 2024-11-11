const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { loadAlgorithm, getCurrentTimeCode, encodeMessage } = require('./encrypter'); // Ensure the path is correct

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/encrypt', (req, res) => {
    const { message, username } = req.body;
    const algorithm = loadAlgorithm();
    const [timeCode, alphabetMapping] = getCurrentTimeCode(algorithm);
    const encodedMessage = encodeMessage(message, alphabetMapping);
    const filePath = path.join(__dirname, 'public', 'messages', `${username}.magic`);
    fs.writeFileSync(filePath, `${timeCode} ${encodedMessage}`);
    res.json({ timeCode, encodedMessage });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});