import url from 'url';
import axios from 'axios';

function proxyMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const routes = facet.options.routes;

    routes.forEach(route => {
        target.get(route.url, function (req, res) {
            let query = url.parse(req.url, true).query;
            let originUrl = route.originUrl;
            originUrl.slice(-1) != '/' ? originUrl += '/' : void 0;
            let restParams = req.params;
            if(restParams) {
                for(let key in restParams) {
                    originUrl += restParams[key] + '/'
                }
            }

            let method = String.prototype.toLowerCase.call(null, route.method || 'get');

            axios[method](originUrl, { params: query })
                .then(response => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response.data));
                })
                .catch(error => {
                    console.error("ERROR::::", error);
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