const transform = (resolver, facet, wire) => {
    let target = facet.target;
    let method = facet.options;

    resolver.resolve(method(target));
}

export default function transformPlugin(options) {
    return {
        facets: {
            transform: {
                'create:after': transform
            }
        }
    }
}