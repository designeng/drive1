import _ from 'underscore';

function transformFacet(resolver, facet, wire) {
    // assume target is array
    let target = facet.target;
    let toSkip;

    if(!_.isArray(target)) {
        throw new Error('Facet \'skip\' accepts array as target');
    }

    let options = facet.options;
    // normilization
    if(_.isNumber(options.skip)) {
        toSkip = [options.skip]
    } else {
        toSkip = options.skip;
    }

    let result = _.filter(target, (item, index) => {
        return toSkip.indexOf(index) == -1;
    })

    resolver.resolve(result);
}

export default function ArrayTransformationsPlugin(options) {
    return {
        facets: {
            transform: {
                'ready:before': transformFacet
            }
        }
    }
}