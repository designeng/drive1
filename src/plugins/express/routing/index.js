import fs from 'fs';
import _  from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';
import rootWire from 'essential-wire';

import bootstrapSpec from '../../../bootstrap.spec';

function routeMiddleware(resolver, facet, wire) {
    const target = facet.target;

    const bootstrapTask = () => {
        return rootWire(bootstrapSpec);
    }

    const routes = facet.options.routes;

    routes.forEach(route => {
        target.get(route.url, function (req, res) {
            let routeSpec = route.routeSpec;
            let environment = {};

            const routeTask = (context) => {
                return context.wire(routeSpec)
            }

            let tasks = [bootstrapTask, routeTask];

            // TODO: unshift task with environment spec wiring
            if(route.url === '/404error') {
                const { query } = url.parse(req.url, true);
                _.extend(environment, { requestUrl: query.url });
            }

            pipeline(tasks).then(
                (context) => {
                    console.log(chalk.green("context:::::", context));
                    res.status(200).end(_.result(context, 'page'));
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

function routeNotFoundMiddleware(resolver, facet, wire) {
    const target = facet.target;

    target.get("/*", function (req, res) {
        console.log(chalk.red("NOT FOUND:::", req.url));
        // res.redirect('/404error?url=' + req.url);
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
            routeNotFoundMiddleware: {
                'initialize:after': routeNotFoundMiddleware
            },
            cssAssets: {
                'initialize:after': cssAssets
            }
        }
    }
}