const express = require('express');
const router = express.Router();

const { readJSON } = require('../jsonFile');
const { getBooru, getAllProjects, getProject, getAccounts, getAllBoorus } = require("../helper")
const path = require("path")
const collectionDir = path.join(__dirname, 'data', 'collection');

// Home: select a booru
router.get('/', async (req, res) => {
  let boorus = null;
  try {
    boorus = await getAllBoorus()

  } catch (err) {
    console.log(err)
    return res.status(404).render("404")
  }
  return res.render('home', { boorus });
});

router.get('/add-booru', (req, res) => {
  return res.render('add-booru');
});
router.get('/accounts', async (req, res) => {
  let accounts = null;
  let boorus = {};
  try {
    accounts = await getAccounts()
    boorus = await getAllBoorus()
  } catch (err) {
    console.error(err)
    return res.status(404).render("404")
  }

  return res.render('accounts', { boorus, accounts });
});
//see booru projectlist
router.get('/booru/:booru', async (req, res) => {
  try {
    const booruName = req.params.booru;
    const data = await getBooru(booruName)
    let projects = [];
    try {
      projects = await getAllProjects(booruName)
    } catch {
      projects = [];
    }

    return res.render('projects', { data, projects });
  } catch (err) {
    console.log(err)
    return res.status(404).render("404")
  }
});

//add project
router.get('/booru/:booru/add-project', (req, res) => {
});
//see project
router.get('/booru/:booru/:projectID', async (req, res) => {
  try {
    const { booru, projectID } = req.params;
    let project = await getProject(booru, projectID)
    if (!project) return res.status(404).render('404', { url: req.originalUrl });
    return res.render('projectInfo', { project });
  } catch (err) {
    console.err(err)
    return res.status(404).render("404")
  }
});
router.get('/booru/:booru/:projectID/:option', async (req, res, next) => {
  try {
    const { booru, projectID, option } = req.params;
    const project = await getProject(booru, projectID);

    const projectOptions = project.options[option]
    if (!project || !project.options || !project.options[option]) {
      return res.status(404).render('404');
    }
    return res.render('tagging', { projectOptions });
  } catch (err) {
    console.log(err)
  }
})
module.exports = router;    