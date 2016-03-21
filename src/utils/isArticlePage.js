export default isArticlePage(requestUrl, maxFragmentsCount) {
    const requestUrlArr = requestUrl.split('/');
    
    // remove 0 blank element
    requestUrlArr.shift();

    if(requestUrlArr.length > maxFragmentsCount || requestUrlArr.length < 2){
        return false;
    }

    if(requestUrlArr.length == 2) {
        if(inArray(fragments[0].bounds, requestUrlArr[0]) && requestUrlArr[1].match(fragments[2])) {
            return "Article..... 2";
        }
    } else if(requestUrlArr.length == 3) {
        if(inArray(fragments[0].bounds, requestUrlArr[0]) && inArray(fragments[1].bounds, requestUrlArr[1]) && requestUrlArr[2].match(fragments[2])) {
            return "Article..... 3";
        }
    }
}

// console.log(chalk.yellow("requestUrlArr:::", requestUrl, requestUrlArr, requestUrlArr.length));