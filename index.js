const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3009;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pagesRouter);
app.use('/api', apiRouter);

app.use((req, res) => {
    res.status(404).render('404', { url: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
const src = path.join(__dirname, 'data/accounts.example.json');
const dest = path.join(__dirname, 'data/accounts.json');
if (!fs.existsSync(dest)) {
    try {
        fs.copyFileSync(src, dest);
        console.log('Copied example');
    } catch (err) {
        console.error('Couldnt copy example file: ', err.message);
        process.exit(1);
    }
}
app.listen(PORT, () => {
    console.log(`MTS running at http://localhost:${PORT}`);
});
