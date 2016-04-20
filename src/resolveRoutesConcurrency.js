import _ from 'underscore';
import brands from './config/brands';

let brandIds = _.map(brands, (item) => {
    return item.id;
});

export default function resolveRoutesConcurrency(req, res, next) {
    let firstToken = req.url.split('/')[1];

    if(_.indexOf(brandIds, firstToken) != -1) {
        let redirection = '/brands' + req.url;
        res.redirect(redirection);
    } else {
        next();
    }
}