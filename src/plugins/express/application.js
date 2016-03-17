import express from 'express';
import favicon from 'serve-favicon';

// facets
function startExpressServerFacet(resolver, facet, wire) {
    const port = facet.options.port;
    let target = facet.target;
    const server = target.listen(port, () => {
        if (facet.options.verbose === true){
            const host = server.address().address;
            const port = server.address().port;
            console.info("==> 🌎  Express app listening at http://%s:%s", host, port);
        }
    });
    resolver.resolve(target);
}

// TODO: move to expressStaticMiddlewarePlugin ?
function staticFacet(resolver, facet, wire) {
    const dir = facet.options.dir;
    let target = facet.target;
    target.use(express.static(dir));
    resolver.resolve(target);
}

function faviconFacet(resolver, facet, wire) {
    let target = facet.target;
    let path = facet.options.path
    target.use(favicon(path));
    resolver.resolve(target);
}

// factories
function expressApplication(resolver, compDef, wire) {
    if (!compDef.options) {
        throw new Error("Please set true value to create Express application.")
    }
    const app = express();
    resolver.resolve(app);
}

export default function ExpressAppPlugin(options) {
    return {
        factories: {
            expressApplication
        },
        facets: {
            static: {
                initialize: staticFacet
            },
            favicon: {
                initialize: faviconFacet
            },
            server: {
                ready: startExpressServerFacet
            }
        }
    }
}