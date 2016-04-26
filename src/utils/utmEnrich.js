import _ from 'underscore';

export default function utmEnrich(data, utmItems) {
    let utmString = Object.keys(utmItems)
        .map((key) => {
            return 'utm_' + key + '=' + utmItems[key];
        })
        .join('&');

    function enrich(item) {
        item['utm'] = utmString;

        return item;
    }

    if (_.isArray(data)) {
        return data.map(enrich);
    } else {
        return enrich(data);
    }
}