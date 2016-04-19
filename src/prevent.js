import _ from 'underscore';
import brands from './config/brands';
import Logger from './utils/logger';

let brandsLength = brands.length;

let redirectRexegStr = _.reduce(brands, (result, brand, index) => {
    let suffix = index <  brandsLength - 1 ? '|' : '';
    return result += '^' + brand.id + '\\/?' + suffix;
}, '');

let redirectRexeg = new RegExp(redirectRexegStr);

export default function prevent(req, res, next) {
    let firstToken = req.url.split('/')[1];

    // res.setHeader('charset', 'utf-8');
    // res.send(redirectRexegStr);
    // return;

    if(!firstToken) next();

    let logger = new Logger({file: './log/prevent.log'});
    logger.info('firstToken:', firstToken);

    if(firstToken.match(redirectRexeg)) {
        res.redirect('/brand' + req.url);
    } else {
        next();
    }
}