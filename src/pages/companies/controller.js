function controller(companiesPageData, getCarcassFn) {

    return {
        html: getCarcassFn(companiesPageData)
    }
}

export default controller;