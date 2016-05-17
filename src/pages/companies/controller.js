function controller(companiesPageData, getCarcassFn) {
    const additionalStyles = [
        {path: '/css/company.css'}
    ];

    return {
        html: getCarcassFn(companiesPageData, {additionalStyles: additionalStyles})
    }
}

export default controller;