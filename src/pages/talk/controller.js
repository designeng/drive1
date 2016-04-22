function controller(talkPageData, getCarcassFn) {

    return {
        html: getCarcassFn(talkPageData)
    }
}

export default controller;