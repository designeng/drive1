import _ from 'underscore';

export default function utmEnrich(data, utmItems) {
    let utmString = Object.keys(utmItems)
        .map((key) => {
            return 'utm_' + key + '=' + utmItems[key];
        })
        .join('&');

    function enrich(item) {
        if (item.url) {
            let delimiter = item.url.indexOf('?') === -1 ? '?' : '&';

            item.url += delimiter + utmString;
        } else {
            console.error('ERROR::::', 'No url property to enrich');
        }

        return item;
    }

    if (_.isArray(data)) {
        return data.map(enrich);
    } else {
        return enrich(data);
    }
}