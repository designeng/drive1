import _ from 'underscore';
import chalk from 'chalk';

import brands from './config/brands';

let footerLinks = [
    'about',
    'ad',
    'd2b',
    'rewrite',
    'moderation',
    'feedback'
];

let brandIds = _.map(brands, (item) => {
    return item.id;
});

export default function resolveRoutesConcurrency(request, response, next) {
    let firstToken = request.url.split('/')[1];

    // improving previous version routing (info about all brands should be on '/brands/*')
    if(_.indexOf(brandIds, firstToken) != -1) {
        let redirection = '/brands' + request.url;
        response.redirect(redirection);
    } else {
        // if(_.indexOf(footerLinks, firstToken) != -1) {
        //     res.redirect(redirection);
        // } else {
        //     next();
        // }
        next();
    }
}