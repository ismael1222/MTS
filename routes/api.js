const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../jsonFile');
const { getBooru, getAllProjects, getProject, getAccount } = require("../helper");
const { searchResponse } = require("./responses")
const axios = require("axios");

function interpolate(str, vars) {
    return str.replace(/\$([^$]+)\$/g, (match, varName) => {
        return vars[varName] !== undefined ? vars[varName] : match;
    });
}

router.post("/saveCredentials", async (req, res) => {
    try {
        const { username, key, booru } = req.body;
        if (!username || !key || !booru) {
            return res.status(400).json({ error: "Missing fields" });
        }
        let data = await readJSON("/accounts.json") || {};
        data[booru].username = username;
        data[booru].key = key;
        writeJSON("/accounts.json", data);
        res.status(200).send({ data: "Successful" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

router.get("/fetch", async (req, res) => {
    const { many, shift, booru, project, option } = req.query;
    if (many === undefined || shift === undefined || booru === undefined || project === undefined || option === undefined) {
        return res.status(400).send('400: Missing query parameter');
    }
    const limit = many;
    const page = shift;

    // ---- Variables from the query string (for $VAR$ substitution) ----
    const variables = { ...req.query }; // includes many, shift, booru, project, option, and any other params

    const projectData = await getProject(booru, project);
    const optionData = projectData.options[option];
    const booruData = await getBooru(booru);
    const apiBase = booruData.api.base;
    const searchStructure = booruData.api.search;
    const accountData = await getAccount(booru);
    let cookieHeader;
    const headers = {};
    if (accountData.special?.cookies) {
        cookieHeader = Object.entries(accountData.special.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }
    if (cookieHeader) {
        headers.Cookie = cookieHeader;
    }
    if (accountData.special?.UA) {
        headers["user-agent"] = accountData.special.UA;
    }
    // ---- Interpolate the base URL ----
    const baseUrl = interpolate(searchStructure.base, variables);
    let url = `${apiBase}/${baseUrl}`;
    // ---- Interpolate urlValues ----
    const additionalParams = {};
    if (searchStructure.urlValues) {
        for (const [key, rawValue] of Object.entries(searchStructure.urlValues)) {
            const finalValue = typeof rawValue === 'string'
                ? interpolate(rawValue, variables)
                : rawValue;
            additionalParams[key] = finalValue;
        }
    }

    const finalParams = {
        limit,
        page,
        tags: optionData.OptSearchParams,
        login: accountData.username,
        api_key: accountData.key,
        ...additionalParams,
    };
    try {
        const response = await axios({
            method: searchStructure.method,
            url,
            params: finalParams,
            headers
        });
        const foundPosts = response.data;
        //BETTER CUSTOM HANDLE
        const curatedData = await searchResponse(booru, foundPosts)
        res.send(curatedData);
    } catch (error) {
        console.error(`Fetch failed for ${booru}/${project}:`, error.message);
        console.error(error)
        res.status(502).send("Failed to fetch posts");
    }
});

router.get("/getmedia", async (req, res) => {
    const { booru, url } = req.query;
    if (!url || !booru) {
        return res.status(400).send('Missing booru or url parameters');
    }
    const booruData = await getBooru(booru);
    if (!booruData) return res.status(400).send('Invalid booru');
    let targetHostname;
    try {
        targetHostname = new URL(url).hostname;
    } catch (e) {
        return res.status(400).send('Invalid URL format');
    }
    const accountData = await getAccount(booru);
    let cookieHeader;
    if (accountData.special?.cookies) {
        cookieHeader = Object.entries(accountData.special.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }
    let headers = {};
    if (accountData.special?.UA) {
        headers["User-Agent"] = accountData.special.UA;
    }
    if (cookieHeader) headers.Cookie = cookieHeader;
    const rangeHeader = req.headers.range;
    if (rangeHeader) headers.Range = rangeHeader;
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: headers,
            responseType: 'stream',
            timeout: 120000
        });
        res.status(response.status);
        const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
        forwardHeaders.forEach(header => {
            if (response.headers[header]) {
                res.setHeader(header, response.headers[header]);
            }
        });
        res.setHeader('Cache-Control', 'public, max-age=86400');
        response.data.pipe(res);
    } catch (error) {
        console.error(`Media proxy failed for ${url}:`, error.message);
        if (error.response?.status === 403) {
            res.status(403).send('Cloudflare cookie expired. Please re-save credentials.');
        } else {
            res.status(500).send('Failed to fetch media');
        }
    }
});

// Helper: recursively build payload from config, interpolating strings
function buildPayload(obj, vars) {
    if (typeof obj === 'string') {
        return interpolate(obj, vars);
    } else if (Array.isArray(obj)) {
        return obj.map(item => buildPayload(item, vars));
    } else if (obj && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = buildPayload(value, vars);
        }
        return result;
    } else {
        return obj; // numbers, booleans, null, etc.
    }
}

router.post("/update", async (req, res) => {
    const { booru, add, old, postID } = req.body;
    // Variables for interpolation (request body fields)
    const variables = { ...req.body };

    const booruData = await getBooru(booru);
    if (!booruData) return res.status(400).send('Invalid booru');

    const accountData = await getAccount(booru);
    let cookieHeader;
    if (accountData.special?.cookies) {
        cookieHeader = Object.entries(accountData.special.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    const apiBase = booruData.api.base;
    const updateStructure = booruData.api.updateTags;

    // ---- Interpolate the update URL base ----
    if (!updateStructure.base) {
        return res.status(400).send('Missing update base URL in configuration');
    }
    const baseUrl = interpolate(updateStructure.base, variables);
    const url = `${apiBase}/${baseUrl}`;

    // ---- Compute the final tag string ----
    let finalTagString;
    if (updateStructure.type == "all") {
        const oldTokens = old.trim().split(/\s+/).filter(Boolean);
        const addTokens = add.trim().split(/\s+/).filter(Boolean);
        const negated = new Set();
        const positive = [];
        for (const token of addTokens) {
            if (token.startsWith('-')) {
                negated.add(token.slice(1));
            } else {
                positive.push(token);
            }
        }
        const keptOld = oldTokens.filter(t => !negated.has(t));
        finalTagString = keptOld.concat(positive).join(' ');
    } else if (updateStructure.type == "diff") {
        finalTagString = add; // just use the added tags as-is
    } else {
        console.error("Missing update format type");
        return res.status(400).send(400);
    }

    // ---- Add the computed tags to variables ----
    variables.TAG_STRING = finalTagString;

    // ---- Build the request payload ----
    let payload;
    if (updateStructure.bodyValues) {
        // Use the flexible bodyValues structure
        payload = buildPayload(updateStructure.bodyValues, variables);
        // For "diff" type, we might also need to handle an empty field (if specified in bodyValues, it's already there)
        // No extra wrapping – payload is the entire request body.
    } else {
        // Fallback to old method (using requiredDataKey)
        const postPayload = {
            [updateStructure.requiredDataKey]: finalTagString
        };
        // Also handle emptyValue for "diff" if present
        if (updateStructure.type === "diff" && updateStructure.emptyValue) {
            postPayload[updateStructure.emptyValue] = "";
        }
        payload = { post: postPayload }; // wrap with "post"
    }

    // ---- Headers ----
    const headers = {};
    if (cookieHeader) headers.Cookie = cookieHeader;
    if (accountData.special?.UA) {
        headers["user-agent"] = accountData.special.UA;
    }
    const additionalParams = {};
    if (updateStructure.urlValues) {
        for (const [key, rawValue] of Object.entries(updateStructure.urlValues)) {
            const finalValue = typeof rawValue === 'string'
                ? interpolate(rawValue, variables)
                : rawValue;
            additionalParams[key] = finalValue;
        }
    }
    const finalParams = {
        login: accountData.username,
        api_key: accountData.key,
        ...additionalParams
    }

    try {
        const response = await axios({
            method: updateStructure.method,
            url: url,
            params: finalParams,
            headers: headers,
            timeout: 120000,
            data: payload // direct, no extra wrapping when using bodyValues
        });
        res.status(response.status);
        res.send(response.data);
    } catch (error) {
        console.error(`Failed URL: ${url}:`, error.message);
        console.error(error);
        if (error.response?.status === 403) {
            res.status(403).send('Cloudflare cookie expired. Please re-save credentials.');
        } else {
            res.status(500).send('Failed to update post');
        }
    }
});

module.exports = router;