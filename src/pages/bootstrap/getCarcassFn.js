function getCarcass(brands, cities) {

    const getCarcassFn = (pageContentHtml) => {
        return carcass({
            htmlClass: '',
            head: head(),
            body: body({
                mobileMenuTrigger: mobileMenuTrigger(),
                header: headerHtml({
                    cities
                }),
                mobileNav: mobileNav(),
                additionalNav: additionalNav(),
                brandsList: brandsList({
                    brands
                }),
                page: pageContentHtml,
                footer: footer(),
                sprContainer: sprContainer(),
                bottomScripts: bottomScripts()
            })
        })
    }

    return getCarcassFn;
}

export default getCarcass;