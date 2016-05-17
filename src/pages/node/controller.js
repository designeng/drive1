function controller(pageData, getCarcassFn, additionalStyles) {

    return {
        html: getCarcassFn(pageData, {additionalStyles: additionalStyles})
    }
}

export default controller;