import fs from 'fs';
import _  from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';
import rootWire from 'essential-wire';

import bootstrapSpec from '../../../bootstrap.spec';

function routeMiddleware(resolver, facet, wire) {
    const target = facet.target;

    const bootstrapTask = (context) => {
        return context ? context.wire(bootstrapSpec) : rootWire(bootstrapSpec)
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
                const requestUrlTask = () => {
                    const { query } = url.parse(req.url, true);
                    return rootWire(_.extend(environment, { requestUrl: query.url }));
                }
                tasks.unshift(requestUrlTask);
            }

            pipeline(tasks).then(
                (context) => {
                    console.log(chalk.green("context:::::", JSON.stringify(context.body)));
                    // res.status(200).end(_.result(context, 'body'));
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
        fragments
    }) => {
        let fragmentKeys = _.keys(fragments);
        // fragmentKeys.forEach(key => {
        //     fragments[key] 
        // })

        console.log(chalk.yellow("BOUNDS:::", fragments[1].bounds));

        target.use(function (req, res, next) {
            let requestUrl = req.url;
            const requestUrlArr = requestUrl.split('/');
            // remove 0 blank element
            requestUrlArr.shift();

            // requestUrlArr.length < 2 - unpossible here. Sould be handles d on routeMiddleware step
            if(requestUrlArr.length > fragments.length || requestUrlArr.length < 2){
                next()
            }

            if(requestUrlArr[0] == 2) {
                if(_.indexOf(fragments[0].bounds, requestUrlArr[0]) != -1 && requestUrlArr[1].match(fragments[2])) {
                    res.end("Article..... 2");
                } else {
                    next()
                }
            } else if(requestUrlArr[0] == 3) {
                if(_.indexOf(fragments[0].bounds, requestUrlArr[0]) != -1 && _.indexOf(fragments[1].bounds, requestUrlArr[1]) != -1 && requestUrlArr[2].match(fragments[2])) {
                    res.end("Article..... 3");
                } else {
                    next()
                }
            }

            console.log(chalk.yellow("requestUrlArr:::", requestUrl, requestUrlArr, requestUrlArr.length));
            next()
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