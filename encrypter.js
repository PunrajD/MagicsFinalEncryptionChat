const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

function loadAlgorithm() {
    const filePath = path.join(__dirname, 'algorithm.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getCurrentTimeCode(algorithm) {
    const currentTime = DateTime.local().toFormat('HH:mm:ss');
    const availableTimes = Object.keys(algorithm);
    const currentTimeObj = DateTime.fromFormat(currentTime, 'HH:mm:ss');

    const nearestTime = availableTimes.reduce((prev, curr) => {
        const prevDiff = Math.abs(currentTimeObj.diff(DateTime.fromFormat(prev, 'HH:mm:ss')).milliseconds);
        const currDiff = Math.abs(currentTimeObj.diff(DateTime.fromFormat(curr, 'HH:mm:ss')).milliseconds);
        return currDiff < prevDiff ? curr : prev;
    });

    const timeData = algorithm[nearestTime];
    const timeCode = timeData["time_code"];
    const alphabetMapping = timeData["A"];
    return [timeCode, alphabetMapping];
}

function encodeMessage(message, alphabetMapping) {
    return message.toLowerCase().split('').map(char => alphabetMapping[char] || char).join('');
}

module.exports = { loadAlgorithm, getCurrentTimeCode, encodeMessage };