import _ from 'underscore';
import caption from './caption';

import moment from 'moment';
moment.locale('ru');

export default function preprocessCaption(items, mode) {
    return _.map(items, (item) => {
        return _.extend({}, item, {
            time    : moment.unix(item.time).format('D MMMM YYYY'),
            caption : caption(item, mode)
        });
    });
}