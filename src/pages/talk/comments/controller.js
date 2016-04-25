function controller(commentsPageData, getCarcassFn) {

    const additionalStyles = [
        {path: '/css/forum.css'}
    ];

    return {
        html: getCarcassFn(commentsPageData, additionalStyles)
    }
}

export default controller;