import _ from 'underscore';
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

export default function resolveRoutesConcurrency(req, res, next) {
    let firstToken = req.url.split('/')[1];

    if(_.indexOf(brandIds, firstToken) != -1) {
        let redirection = '/brands' + req.url;
        res.redirect(redirection);
    } else {
        // if(_.indexOf(footerLinks, firstToken) != -1) {
        //     res.redirect(redirection);
        // } else {
        //     next();
        // }
        next();
    }
}