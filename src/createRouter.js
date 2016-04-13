import fs from 'fs';
import _  from 'underscore';

import express from 'express';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';
import rootWire from 'essential-wire';

import isArticlePage    from './utils/isArticlePage';
import articlePageSpec  from './pages/article/page.spec';

import Logger from './utils/logger';

import { bootstrapTask, getRouteTask } from './utils/tasks/specTasks';
import { createTasks, createTask } from './utils/tasks';

let logger = new Logger({file: './log/info.log'});

function log(req, res) {
    console.log(req.url);
    setTimeout(() => {
        res.send(req.url);
    }, 1000);
}

function processRoute(req, res, route) {
    let routeSpec = route.routeSpec;
    let environment = {};

    logger.info('URL::::::', req.url, route.url);
    console.log(chalk.green('URL::::::', req.url, route.url));

    let tasks = [bootstrapTask, getRouteTask(routeSpec)];

    if(req.params && req.params.brand) {
        _.extend(environment, { carModel: {
            brand   : req.params.brand,
            year    : req.params.year,
            model   : req.params.model,
        } });
    }

    // TODO: unshift task with environment spec wiring
    if(route.url === '/404error') {
        const { query } = url.parse(req.url, true);
        _.extend(environment, { requestUrl: query.url });
    }

    tasks.unshift(createTask(environment));

    pipeline(tasks).then(
        (context) => {
            res.status(200).end(context.body.html);
        },
        (error) => {
            console.log(chalk.red("error:::::", error));
            res.status(500).end(error)
        }
    );
}

export default function createRouter(routes) {
    var router  = express.Router();

    _.each(routes, function(route) {
        router.get(route.url, function(req, res) {
            processRoute(req, res, route);
            // log(req, res);
        });
    })

    return router;
}