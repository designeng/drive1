import url from 'url';
import _ from 'underscore';

import axios from 'axios';

import Logger from '../../../utils/logger';
let logger = new Logger({file: __dirname + '../../../../../log/proxy.log'});

const prepareData = (data) => {
    let str = [];
    for(let p in data)
        if (data.hasOwnProperty(p) && data[p]) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
        }
    return str.join("&");
}

function proxyMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const routes = facet.options.routes;

    routes.forEach(route => {
        let method = route.method.toLowerCase() || 'get';

        target[method](route.url, function (req, res) {

            let query = url.parse(req.url, true).query;

            let headers = route.headers || {};
            let forwardCookies = route.forwardCookies;
                    
            if(forwardCookies) {
                _.extend(headers, {'Cookie': req.get('Cookie')});
            }

            let data = prepareData(req.body);

            // logger.info("QUERY::::", query);

            axios[method](route.originUrl, {
                data,
                headers
            })
            .then(response => {
                res.writeHead(200, headers);
                res.end(response.data);
            })
            .catch(error => {
                res.writeHead(200, headers);
                res.end("ERROR:" + output);
            });

            axios({
                method: method,
                url: route.originUrl,
                data,
                params: query,
                headers
            }).then(response => {
                let outputFormat = route.outputFormat,
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

                // logger.info("SUCCESS:::", output);

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