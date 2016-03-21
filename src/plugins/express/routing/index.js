import fs from 'fs';
import _  from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';
import rootWire from 'essential-wire';

import isArticlePage from '../../../utils/isArticlePage';

import { bootstrapTask, getRouteTask } from '../../../utils/tasks/specTasks';

function isMatch(bounds, item) {
    if(_.isArray(bounds)) {
        return _.indexOf(bounds, item) != -1;
    } else if(_.isRegExp(bounds)) {
        return item.match(bounds)
    }
}

function routeMiddleware(resolver, facet, wire) {
    const target = facet.target;

    const routes = facet.options.routes;

    routes.forEach(route => {
        target.get(route.url, function (req, res) {
            let routeSpec = route.routeSpec;
            let environment = {};

            let tasks = [bootstrapTask, getRouteTask(routeSpec)];

            // TODO: unshift task with environment spec wiring
            if(route.url === '/404error') {
                const requestUrlTask = () => {
                    const { query } = url.parse(req.url, true);
                    return rootWire(_.extend(environment, { requestUrl: query.url }));
                }
                tasks.unshift(requestUrlTask);
            }

            pipeline(tasks).then(
                (context) => {
                    console.log(chalk.green("context:::::", JSON.stringify(context.body)));
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

    wire(facet.options).then(({
        fragments,
        articlePage
    }) => {
        let fragmentKeys = _.keys(fragments);

        target.get('*', function (req, res, next) {
            let requestUrl = req.url;
            const requestUrlArr = requestUrl.split('/');
            // remove 0 blank element
            requestUrlArr.shift();

            let _isArticlePage = isArticlePage(requestUrlArr, fragments[0].bounds, fragments[1].bounds, fragments[2].bounds);

            if(_isArticlePage) {

                var articleId = requestUrl.match(/([^\/]+)(?=\.\w+$)/)[0];

                let tasks = [bootstrapTask];

                const articleTask = () => {
                    return articlePage({
                        articleId: articleId
                    });
                }

                tasks.push(articleTask);

                pipeline(tasks).then(
                    (context) => {
                        console.log(chalk.green("context:::::articleId::", context.articleId));
                        res.status(200).end(context.body.html);
                    },
                    (error) => {
                        console.log(chalk.red("error:::::", error));
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

function cssAssets(resolver, facet, wire) {
    const target = facet.target;
    const main = facet.options.main;

    target.get("/css/global.css", function (req, res) {
        let result = fs.readFileSync(main);
        res.status(200).end(result);
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
            cssAssets: {
                'initialize:after': cssAssets
            }
        }
    }
}