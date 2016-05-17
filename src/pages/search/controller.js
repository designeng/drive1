function controller(pageData, getCarcassFn) {

    return {
        html: getCarcassFn(pageData)
    }
}

export default controller;