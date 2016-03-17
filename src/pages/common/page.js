import carcass              from 'drive-templates/build/carcass';
import head                 from 'drive-templates/build/head';

import body                 from 'drive-templates/build/body';
import additionalNav        from 'drive-templates/build/additionalNav';
import blogEntry            from 'drive-templates/build/blogEntry';
import bottomScripts        from 'drive-templates/build/bottomScripts';
import delimiter            from 'drive-templates/build/delimiter';
import description          from 'drive-templates/build/description';
import footer               from 'drive-templates/build/footer';
import header               from 'drive-templates/build/header';
import itemCompact          from 'drive-templates/build/itemCompact';
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMed              from 'drive-templates/build/itemMed';
import keywords             from 'drive-templates/build/keywords';
import logo                 from 'drive-templates/build/logo';
import mobileMenuTrigger    from 'drive-templates/build/mobileMenuTrigger';
import mobileNav            from 'drive-templates/build/mobileNav';
import nav                  from 'drive-templates/build/nav';
import sprContainer         from 'drive-templates/build/sprContainer';
import topControls          from 'drive-templates/build/topControls';
import videoThumbnail       from 'drive-templates/build/videoThumbnail';

const cacheReset = "v1"

const getHead = () => {
    return head({
        title: "MAIN PAGE", 
        keywords: keywords({content: "SOME KEYWORDS"}),
        description: description({content: "SOME DESCRIPTION"})
    })
}

export function getPage(pageTemplate) {
    return carcass({
        head: getHead(),
        header: "header...."
    })
}


// https://dev.drive.ru/api/v1/static/brands
const brands = [{"id":"acura","name":"Acura","backgroundOffset":0},{"id":"alfaromeo","name":"Alfa Romeo","backgroundOffset":-29}];
export function getBody(pageTemplate) {
    return body({
        header: "header....12345",

        // skipping mobileNav
        mobileMenuTrigger: mobileMenuTrigger(),
        bottomScripts: bottomScripts()
    })
}