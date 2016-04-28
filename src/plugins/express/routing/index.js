import fs from 'fs';
import _  from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';

import { isArticlePage, isNodePage } from '../../../utils/page';

import bootstrapSpec    from '../../../pages/bootstrap/bootstrap.spec';
import articlePageSpec  from '../../../pages/article/page.spec';

import nodePageSpec     from '../../../pages/node/page.spec';

import categories       from '../../../config/categories';
import brands           from '../../../config/brands';
import themes           from '../../../config/themes';

import { createTasks, createTask } from '../../../utils/tasks';

const articleIdRexeg = /([^\/]+)(?=\.\w+$)/;
const articleRexeg = /([a-zA-Z0-9\.])+(.html|.htm)/;

function routeMiddleware(resolver, facet, wire) {
    const target    = facet.target;
    const routes    = facet.options.routes;
    const before    = facet.options.before || function before(req, res, next) {next()};

    routes.forEach(route => {
        target.get(route.url, before, (req, res, next) => {
            let routeSpec   = route.routeSpec;
            let provide     = route.provide;

            // TODO: conflict resolving for routes [/news/*.html, /news/:brand etc.]
            // think how to avoid plugin hack
            if(req.url.match(articleRexeg)) {
                return next();
            }
            // END TODO

            let environment = {
                brand           : null,
                city            : null,
                category        : null,
                theme           : null,
                talkFirstId     : null,
                talkSecondId    : null,
                requestUrl      : req.url,
            };

            let tasks = createTasks([bootstrapSpec, routeSpec]);

            if(req.params && req.params.category) {
                let category = _.find(categories, {id: req.params.category});
                if(category) {
                    _.extend(environment, { category });
                }
            }

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

            // talk
            if(req.params && req.params.theme) {
                _.extend(environment, { 
                    theme: _.find(brands, {id: req.params.theme}) || _.find(themes, {id: req.params.theme})
                });
            }

            if(req.params && req.params.talkFirstId) {
                _.extend(environment, { talkFirstId: req.params.talkFirstId });
            }

            if(req.params && req.params.talkSecondId) {
                _.extend(environment, { talkSecondId: req.params.talkSecondId });
            }

            if(provide) {
                _.extend(environment, provide);
            }

            const { query } = url.parse(req.url, true);

            if(query.city) {
                _.extend(environment, { city: {id: query.city }});
            }

            // TODO: 404error page
            if(route.url === '/404error') {
                _.extend(environment, { requestUrl: query.url });
            }
            // END TODO:

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

        const renderNodePage = (req, res, nodePageSpec, environment = {}) => {
            let requestUrl = req.url;
            let tasks = createTasks([bootstrapSpec, nodePageSpec]);

            _.extend(environment, { nodeId: requestUrl.match(articleIdRexeg)[0], requestUrl });

            tasks.unshift(createTask(environment));

            pipeline(tasks).then(
                (context) => {
                    res.status(200).end(context.body.html);
                },
                (error) => {
                    res.status(500).end(error)
                }
            );
        }

        target.get('*', function (req, res, next) {
            let requestUrl = req.url;
            const requestUrlArr = requestUrl.split('/');
            // remove zero blank element
            requestUrlArr.shift();

            if(isNodePage(requestUrlArr, {fragment: 'company'})) {
                renderNodePage(req, res, nodePageSpec, {
                    additionalStyles: [{path: '/css/company.css'}],
                    endpoint: 'companyPage'
                });
            } else if(isArticlePage(requestUrlArr, fragments[0].bounds, fragments[1].bounds, fragments[2].bounds)) {
                renderNodePage(req, res, articlePageSpec);
            } else if (isNodePage(requestUrlArr, {fragment: 'comments'})) {
                renderNodePage(req, res, nodePageSpec, {
                    additionalStyles: [{path: '/css/forum.css'}],
                    endpoint: 'commentsPage'
                });
            } else if (isNodePage(requestUrlArr, {fragment: 'talk'})) {
                res.status(200).end("some talk page::: " + requestUrl);
                // renderNodePage(requestUrl, nodePageSpec, res, {
                //     additionalStyles: [{path: '/css/forum.css'}],
                //     endpoint: 'threadTalkPage'
                // });
            } else {
                // 404 ?
                res.status(200).end("not recognized page::: " + requestUrl);
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

// -----TEST-----
// res.setHeader('charset', 'utf-8');
// return res.send(req.url);
// -----TEST END-----