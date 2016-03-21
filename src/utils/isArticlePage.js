import _  from 'underscore';

function isMatch(bounds, item) {
    if(_.isArray(bounds)) {
        return _.indexOf(bounds, item) != -1 ? 1 : 0
    } else if(_.isRegExp(bounds)) {
        return item.match(bounds) ? 1 : 0
    }
}

export default function isArticlePage(requestUrlArr, firstBounds, middleBounds, lastBounds) {
    let isArticlePage = 1;

    let first = requestUrlArr.shift();
    let last  = requestUrlArr.pop();
    
    if(isMatch(firstBounds, first) && isMatch(lastBounds, last)) {
        isArticlePage *= 1;
    }

    isArticlePage = _.reduce(requestUrlArr, (result, item) => {
        let multiplier = isMatch(middleBounds, item);
        return result *= multiplier;
    }, isArticlePage)

    return isArticlePage;
}

// console.log(chalk.yellow("requestUrlArr:::", requestUrl, requestUrlArr, requestUrlArr.length));