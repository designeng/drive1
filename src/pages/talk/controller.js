function controller(talkPageData, getCarcassFn) {

    const additionalStyles = [
        {path: '/css/forum.css'}
    ];

    return {
        html: getCarcassFn(talkPageData, additionalStyles)
    }
}

export default controller;