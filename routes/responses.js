const { readJSON } = require('../jsonFile');
const { getBooru } = require("../helper");


// Helper to get nested value using dot notation
function getNestedValue(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
}

async function searchResponse(booruName, response) {
    const booruData = await getBooru(booruName);
    const responseSchema = booruData.api.search.response;
    let curatedData = [];

    if (booruData.api.search.response.type == "array") {
        curatedData = response.map(item => {
            const id = getNestedValue(item, responseSchema.id);
            return {
                id: id,
                md5: getNestedValue(item, responseSchema.md5),
                tag_string: Array.isArray(item[responseSchema.tag_string])
                    ? item[responseSchema.tag_string].join(" ")
                    : getNestedValue(item, responseSchema.tag_string),
                file_url: getNestedValue(item, responseSchema.file_url),
                large_file_url: getNestedValue(item, responseSchema.large_file_url),
                postLink: booruData.api.viewPost.replace("$ID$", id)
            };
        });
    } else {
        console.log("unknown data response type");
        console.log(typeof response);
        console.log(response);
    }

    return curatedData;
}

module.exports = { searchResponse }