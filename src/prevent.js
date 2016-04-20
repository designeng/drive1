import _ from 'underscore';
import brands from './config/brands';
import Logger from './utils/logger';


let brandIds = _.map(brands, (item) => {
    return item.id;
});

export default function prevent(req, res, next) {
    let firstToken = req.url.split('/')[1];

    let logger = new Logger({file: './log/prevent.log'});
    logger.info('firstToken:', firstToken);
    logger.info('url:', req.url);

    if(_.indexOf(brandIds, firstToken) != -1) {
        let redirection = '/brands' + req.url;
        res.redirect(redirection);
    } else {
        next();
    }
}