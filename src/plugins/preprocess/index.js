const preprocess = (resolver, facet, wire) => {
    let target = facet.target;
    let method = facet.options;

    resolver.resolve(method(target)); 
}

export default function preprocessPlugin(options) {
    return {
        facets: {
            preprocess: {
                'initialize:before': preprocess
            }
        }
    }
}