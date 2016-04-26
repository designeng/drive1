function controller(pageData, getCarcassFn, additionalStyles) {
    return {
        html: getCarcassFn(pageData, additionalStyles)
    }
}

export default controller;