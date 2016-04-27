import _ from 'underscore';

export default function utmEnrich(data, param, utmItems) {
    let utmString = Object.keys(utmItems)
        .map((key) => {
            return 'utm_' + key + '=' + encodeURIComponent(utmItems[key])
        })
        .join('&');

    function enrich(item) {
        if (item && param) {
            if (item.hasOwnProperty(param)) {
                let delimiter = item[param].indexOf('?') === -1 ? '?' : '&';

                item[param] += delimiter + utmString;
            } else {
                console.error('ERROR::::', 'No property to enrich');
            }
        } else {
            console.error('ERROR::::', 'Property ' + param + ' not found');
        }

        return item;
    }

    if (_.isArray(data)) {
        return data.map(enrich);
    } else {
        return enrich(data);
    }
}