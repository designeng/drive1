function controller(pageData, getCarcassFn) {

    const additionalStyles = [
        {path: '/css/company.css'}
    ];

    return {
        html: getCarcassFn(pageData, additionalStyles)
    }
}

export default controller;