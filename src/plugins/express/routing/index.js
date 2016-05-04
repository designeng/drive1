import fs from 'fs';
import _ from 'underscore';
import url from 'url';
import chalk from 'chalk';
import pipeline from 'when/pipeline';

import { isArticlePage, isNodePage } from '../../../utils/page';

import bootstrapSpec from '../../../pages/bootstrap/bootstrap.spec';
import articlePageSpec from '../../../pages/article/page.spec';

import nodePageSpec from '../../../pages/node/page.spec';

import categories from '../../../config/categories';
import brands from '../../../config/brands';
import themes from '../../../config/themes';

import { createTasks, createTask } from '../../../utils/tasks';

const articleIdRexeg = /([^\/]+)(?=\.\w+$)/;
const articleRexeg = /([a-zA-Z0-9\.])+(.html|.htm)/;

function routeMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const routes = facet.options.routes;
    const before = facet.options.before || function before(request, response, next) {next()};

    routes.forEach(route => {
        target.get(route.url, before, (request, response, next) => {
            let routeSpec = route.routeSpec;
            let provide = route.provide;
            let success = route.success;
            let error = route.error;

            // TODO: conflict resolving for routes [/news/*.html, /news/:brand etc.]
            // think how to avoid plugin hack
            if(request.url.match(articleRexeg)) {
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
                requestUrl      : request.url,
                accessToken     : null,
                targetUrl       : null,
            };

            let tasks = createTasks([bootstrapSpec, routeSpec]);

            if(request.params && request.params.category) {
                let category = _.find(categories, {id: request.params.category});
                if(category) {
                    _.extend(environment, { category });
                }
            }

            if(request.params && request.params.brand && !request.params.year && !request.params.model) {
                _.extend(environment, { brand: {
                    id: request.params.brand,
                    name: _.find(brands, {id: request.params.brand})['name']
                } });
            } else if(request.params && request.params.brand && request.params.year && request.params.model) {
                _.extend(environment, { carModel: {
                    brand   : request.params.brand,
                    year    : request.params.year,
                    model   : request.params.model,
                } });
            }

            // talk
            if(request.params && request.params.theme) {
                _.extend(environment, {
                    theme: _.find(brands, {id: request.params.theme}) || _.find(themes, {id: request.params.theme})
                });
            }

            if(request.params && request.params.talkFirstId) {
                _.extend(environment, { talkFirstId: request.params.talkFirstId });
            }

            if(request.params && request.params.talkSecondId) {
                _.extend(environment, { talkSecondId: request.params.talkSecondId });
            }

            if(provide) {
                _.extend(environment, provide);
            }

            const { query } = url.parse(request.url, true);

            if(query.city) {
                _.extend(environment, { city: {id: query.city }});
            }

            // TODO: add condition 'request url == local_reception'
            if(query['.AMET'] && query['url']) {
                let accessToken = query['.AMET'];
                // to redirect after reception connection
                let targetUrl = query['url'];
                _.extend(environment, { accessToken, targetUrl });
                // remove bootstrap task
                tasks.shift();
            }

            // TODO: 404error page
            if(route.url === '/404error') {
                _.extend(environment, { requestUrl: query.url });
            }
            // END TODO:

            tasks.unshift(createTask(environment));

            pipeline(tasks).then(success(response), error(response));
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

        const renderNodePage = (request, response, nodePageSpec, environment = {}) => {
            let requestUrl = request.url;
            let tasks = createTasks([bootstrapSpec, nodePageSpec]);

            _.extend(environment, { nodeId: requestUrl.match(articleIdRexeg)[0], requestUrl });

            tasks.unshift(createTask(environment));

            pipeline(tasks).then(
                (context) => {
                    response.status(200).end(context.body.html);
                },
                (error) => {
                    response.status(500).end(error)
                }
            );
        }

        target.get('*', function (request, response, next) {
            let requestUrl = request.url;
            const requestUrlArr = requestUrl.split('/');
            // remove zero blank element
            requestUrlArr.shift();

            if(isNodePage(requestUrlArr, {fragment: 'company'})) {
                renderNodePage(request, response, nodePageSpec, {
                    additionalStyles: [{path: '/css/company.css'}],
                    endpoint: 'companyPage'
                });
            } else if(isArticlePage(requestUrlArr, fragments[0].bounds, fragments[1].bounds, fragments[2].bounds)) {
                renderNodePage(request, response, articlePageSpec);
            } else if (isNodePage(requestUrlArr, {fragment: 'comments'})) {
                renderNodePage(request, response, nodePageSpec, {
                    additionalStyles: [{path: '/css/forum.css'}],
                    endpoint: 'commentsPage'
                });
            } else if (isNodePage(requestUrlArr, {fragment: 'talk'})) {
                response.status(200).end("some talk page::: " + requestUrl);
                // renderNodePage(requestUrl, nodePageSpec, response, {
                //     additionalStyles: [{path: '/css/forum.css'}],
                //     endpoint: 'threadTalkPage'
                // });
            } else {
                // 404 ?
                response.status(200).end("not recognized page::: " + requestUrl);
            }
        });
    })

    resolver.resolve(target);
}

function routeNotFoundMiddleware(resolver, facet, wire) {
    const target = facet.target;

    target.get("/*", function (request, response) {
        console.log(chalk.red("NOT FOUND:::", request.url));
        response.redirect('/404error?url=' + request.url);
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
// response.setHeader('charset', 'utf-8');
// return response.send(request.url);
// -----TEST END-----