import _ from 'underscore';
import moment from 'moment';
moment.locale('ru');

export function preprocessNews(items) {
    return _.map(items, (item) => {
        return _.extend({}, item, {
            time    : moment.unix(item.time).fromNow(),
            caption : item.caption.replace(/\{(.*?)\}/, function(match, aText) {
                return '<a href="' + item.url + '">' + aText + '</a>';
            })
        });
    });
}

export function getPage(items, block, page) {
    return page({ items:  _.reduce(items, (result, item, index) => {
        result = result + block(item);
        return result;
    }, '') });
}