const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, 'data');

async function readJSON(filePath, specific) {
    const fullPath = path.join(dataDir, filePath);
    const raw = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(raw);
}

async function writeJSON(filePath, data) {
    const fullPath = path.join(dataDir, filePath);
    const tmpPath = fullPath + '.tmp';
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, fullPath);
}

module.exports = { readJSON, writeJSON };