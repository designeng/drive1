import url from 'url';
import axios from 'axios';

function proxyMiddleware(resolver, facet, wire) {
    const target = facet.target;
    const routes = facet.options.routes;

    routes.forEach(route => {
        let method = route.method.toLowerCase() || 'get';

        target[method](route.url, function (req, res) {
            // let query = url.parse(req.url, true).query;
            // let originUrl = route.originUrl;
            // originUrl.slice(-1) != '/' ? originUrl += '/' : void 0;
            // let restParams = req.params;
            // if(restParams) {
            //     for(let key in restParams) {
            //         originUrl += restParams[key] + '/'
            //     }
            // }

            console.log('req.body.email:::', req.body.email);
            console.log('req.body.text:::', req.body.text);
            console.log('req.body.mode:::', req.body.mode);
            console.log('req.body.url:::', req.body.url);

            // axios[method](originUrl, { params: query })
            axios[method](route.originUrl, {
                    email:  req.body.email,
                    text:   req.body.text,
                    mode:   req.body.mode,
                    url:    req.body.url,
                })
                .then(response => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response.data));
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