import url from 'url';
import axios from 'axios';
import _ from 'underscore';

// import Logger from '../../../utils/logger';
// let logger = new Logger({file: __dirname + '../../../../../log/proxy.log'});

function proxyMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const routes = facet.options.routes;

    routes.forEach(route => {
        let method = route.method.toLowerCase() || 'get';

        target[method](route.url, function (req, res) {

            let query = url.parse(req.url, true).query;

            // let originUrl = route.originUrl;
            // originUrl.slice(-1) != '/' ? originUrl += '/' : void 0;
            // let restParams = req.params;
            // if(restParams) {
            //     for(let key in restParams) {
            //         originUrl += restParams[key] + '/'
            //     }
            // }

            // TODO: for post method?
            // feedback page options:
            // {
            //     email:  req.body.email,
            //     text:   req.body.text,
            //     mode:   req.body.mode,
            //     url:    req.body.url,
            // }
            
            let options = method === 'get' ? { params: query } : {};

            axios[method](route.originUrl, options)
                .then(response => {
                    let outputFormat = route.outputFormat,
                        headers = route.headers || {},
                        output;

                    if(outputFormat == 'html') {
                        _.extend(headers, {'Content-Type': 'text/html; charset=utf-8'});
                        output = response.data;
                    } else if(outputFormat == 'plain') {
                        _.extend(headers, {'Content-Type': 'text/plain'});
                        output = response.data;
                    } else if(outputFormat == 'json' || !outputFormat) { //default
                        _.extend(headers, {'Content-Type': 'application/json'});
                        output = JSON.stringify(response.data);
                    }

                    res.writeHead(200, headers);
                    res.end(output);
                })
                .catch(error => {
                    console.error("ERROR::::", error);
                    res.setHeader('charset', 'utf-8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(error));
                });
        });
    });

    resolver.resolve(target);
}

export default function proxyMiddlewarePlugin(options) {
    return {
        facets: {
            proxyMiddleware: {
                'initialize:before': proxyMiddleware
            }
        }
    }
}