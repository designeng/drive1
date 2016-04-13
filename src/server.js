import express from 'express';
import routes from './routes';
import createRouter from './createRouter';

import findRemoveSync from'find-remove';
findRemoveSync('./log', {extensions: ['.log']});

let app = express();

app.use('/', createRouter(routes));

// static pages
app.use(express.static('./public'));

var port = process.env.PORT || 3000;
app.set('port', port);

app.listen(port, err => {
    if (err) {
        console.error(err);
        return;
    }
    console.info("==> 🌎  Express app listening at http://localhost:%s", port);
});