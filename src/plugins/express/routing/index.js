import fs from 'fs';
import _  from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';
import rootWire from 'essential-wire';

import isArticlePage    from '../../../utils/isArticlePage';
import articlePageSpec  from '../../../pages/article/page.spec';
import brands           from '../../../config/brands';

import Logger from '../../../utils/logger';

import { bootstrapTask, getRouteTask } from '../../../utils/tasks/specTasks';
import { createTasks, createTask } from '../../../utils/tasks';

function routeMiddleware(resolver, facet, wire) {
    const target    = facet.target;
    const routes    = facet.options.routes;
    const logfile   = facet.options.logfile;

    let logger = new Logger({file: logfile});

    routes.forEach(route => {
        target.get(route.url, function (req, res) {
            let routeSpec = route.routeSpec;
            let environment = {};

            logger.info('URL:', route.url);

            let tasks = [bootstrapTask, getRouteTask(routeSpec)];

            if(req.params && req.params.brand && !req.params.year && !req.params.model) {
                _.extend(environment, { brand: {
                    id: req.params.brand,
                    name: _.find(brands, {id: req.params.brand})['name']
                } });
            } else if(req.params && req.params.brand && req.params.year && req.params.model) {
                _.extend(environment, { carModel: {
                    brand   : req.params.brand,
                    year    : req.params.year,
                    model   : req.params.model,
                } });
            }

            if(route.url === '/404error') {
                const { query } = url.parse(req.url, true);
                _.extend(environment, { requestUrl: query.url });
            }

            tasks.unshift(createTask(environment));

            pipeline(tasks).then(
                (context) => {
                    // console.log(chalk.green("context:::::", JSON.stringify(context.body)));
                    res.status(200).end(context.body.html);
                },
                (error) => {
                    console.log(chalk.red("error:::::", error));
                    res.status(500).end(error)
                }
            );
        });

        resolver.resolve(target);
    });
}

function articlePageMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const logfile = facet.options.logfile;

    wire(facet.options).then(({
        fragments
    }) => {
        let fragmentKeys = _.keys(fragments);

        let logger = new Logger({file: logfile});

        target.get('*', function (req, res, next) {
            let requestUrl = req.url;
            const requestUrlArr = requestUrl.split('/');
            // remove zero blank element
            requestUrlArr.shift();

            if(isArticlePage(requestUrlArr, fragments[0].bounds, fragments[1].bounds, fragments[2].bounds)) {

                var articleId = requestUrl.match(/([^\/]+)(?=\.\w+$)/)[0];

                logger.info('Article Id:', articleId, ',' , req.url);

                let tasks = [bootstrapTask, getRouteTask(articlePageSpec)];

                const articleTask = () => {
                    return rootWire({ articleId });
                }
                tasks.unshift(articleTask);

                pipeline(tasks).then(
                    (context) => {
                        // logger.info('Article HTML:', context.body.html);
                        res.status(200).end(context.body.html);
                    },
                    (error) => {
                        res.status(500).end(error)
                    }
                );
            }
        });
    })

    resolver.resolve(target);
}

function routeNotFoundMiddleware(resolver, facet, wire) {
    const target = facet.target;

    target.get("/*", function (req, res) {
        console.log(chalk.red("NOT FOUND:::", req.url));
        res.redirect('/404error?url=' + req.url);
    });

    resolver.resolve(target);
}

export default function routeMiddlewarePlugin(options) {
    return {
        facets: {
            routeMiddleware: {
                'initialize:before': routeMiddleware
            },
            articlePageMiddleware: {
                'initialize:before': articlePageMiddleware
            },
            routeNotFoundMiddleware: {
                'initialize:after': routeNotFoundMiddleware
            },
        }
    }
}