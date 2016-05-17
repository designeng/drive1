function controller(talkPageData, getCarcassFn) {

    const additionalStyles = [
        {path: '/css/forum.css'}
    ];

    return {
        html: getCarcassFn(talkPageData, {additionalStyles: additionalStyles})
    }
}

export default controller;