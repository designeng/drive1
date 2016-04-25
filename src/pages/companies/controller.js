function controller(companiesPageData, getCarcassFn) {
    const additionalStyles = [
        {path: '/css/companies.css'}
    ];
    
    return {
        html: getCarcassFn(companiesPageData, additionalStyles)
    }
}

export default controller;