var chalk = require("chalk");
var exec  = require("child_process").exec;
var cheerio = require('cheerio');
var notifier = require('node-notifier');

// wait for running server
setTimeout(runTest, 2000);

function runTest() {
    exec('curl http://localhost:3000/article', function(error, pageHtml, stderr) {
        console.log('pageHtml: '    + chalk.blue(pageHtml));
        console.log('stderr: '      + chalk.red (stderr));

        if (error !== null) {
            console.log('exec error: ' + error);
        }

        $ = cheerio.load(pageHtml);
        var rootText = $('#root').text();

        if (rootText === '[object Object]') {
            notification = {
                'title': 'Error!',
                'message': 'Isomorphic rendering is failed!'
            };
        } else {
            notification = {
                'title': 'Success!',
                'message': 'Page is rendered successfully!'
            };
        }

        notifier.notify(notification);

        // to stop server:
        exec('lsof -t -i tcp:3000 | xargs kill', function(error, stdout, stderr) {
            console.log(chalk.yellow('server stopped!'));
        });
    });
}