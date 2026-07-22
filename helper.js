const fs = require('fs').promises
const path = require("path")
const { readJSON, writeJSON } = require('./jsonFile');


const collectionDir = path.join(__dirname, 'data', 'collection/');
async function getBooru(name) {
    if (!name) throw new Error('Booru name is required');
    const booruData = await readJSON(`/collection/${name}.json`)
    return booruData ?? null
}
//booru.listAll
async function getAllBoorus() {
    const boorus = {}
    try {
        const files = await fs.readdir(collectionDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const key = path.basename(file, '.json');
            const content = await fs.readFile(path.join(collectionDir, file), 'utf8');
            boorus[key] = JSON.parse(content);
        }
    } catch (err) {
        console.error('Failed to load collection files:', err);
    }
    return boorus ?? null
}
//booru.allProjects
async function getAllProjects(name) {
    if (!name) throw new Error('Booru name is required to search for all its projects');
    const allProjects = await readJSON(name + '/projects.json')
    return allProjects ?? null
}
//booru.project
async function getProject(booru, project) {
    if (!booru || !project) throw new Error('Both booru and project name are required');
    const allProjects = await getAllProjects(booru)
    if (!allProjects) throw new Error("Booru's projects not found")
    const returnValue = allProjects.find(p => p.name === project)
    return returnValue ?? null
}
//account.oneBooru
async function getAccount(booru) {
    if (!booru) throw new Error('Booru name is required');
    let allAccounts;
    try {
        allAccounts = await readJSON('accounts.json');
    } catch (err) {
        if (err.code === 'ENOENT') {
            try {
                await fs.copyFile('accounts.example.json', 'accounts.json');
                allAccounts = await readJSON('accounts.json');
            } catch (copyErr) {
                if (copyErr.code === 'ENOENT') {
                    throw new Error('accounts.example.json not found, cannot create accounts.json');
                }
                throw copyErr;
            }
        } else {
            throw err;
        }
    }




    // If the booru account doesn't exist, create a default one with empty fields
    if (!allAccounts[booru]) {
        allAccounts[booru] = {
            username: "",
            key: "",
            special: {
                UA: ""
            }
        };
        // Write the updated accounts back to the file
        await writeJSON("accounts.json", allAccounts)
        // await fs.writeFile('accounts.json', JSON.stringify(allAccounts, null, 4));
    }

    return allAccounts[booru];








}
//account.allBoorus
async function getAccounts() {
    return await readJSON("accounts.json");
}

module.exports = { getBooru, getAccount, getProject, getAccounts, getAllProjects, getAllBoorus }