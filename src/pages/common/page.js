import carcass              from '../../templates/build/carcass';
import head                 from '../../templates/build/head';

import body                 from '../../templates/build/body';
import additionalNav        from '../../templates/build/additionalNav';
import blogEntry            from '../../templates/build/blogEntry';
import bottomScripts        from '../../templates/build/bottomScripts';
import delimiter            from '../../templates/build/delimiter';
import description          from '../../templates/build/description';
import footer               from '../../templates/build/footer';
import header               from '../../templates/build/header';
import itemCompact          from '../../templates/build/itemCompact';
import itemLarge            from '../../templates/build/itemLarge';
import itemMed              from '../../templates/build/itemMedium';
import keywords             from '../../templates/build/keywords';
import logo                 from '../../templates/build/logo';
import mobileMenuTrigger    from '../../templates/build/mobileMenuTrigger';
import mobileNav            from '../../templates/build/mobileNav';
import nav                  from '../../templates/build/nav';
import topControls          from '../../templates/build/topControls';
import videoThumbnail       from '../../templates/build/videoThumbnail';
import brandsList           from '../../templates/build/brandsList';

const cacheReset = "v1";

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

export function getPage(pageTemplate) {
    return carcass({
        head: getHead(),
        header: "header...."
    })
}

export function getBody(pageTemplate) {
    return body({
        header: "header....12345",

        // skipping mobileNav
        mobileMenuTrigger: mobileMenuTrigger(),
        bottomScripts: bottomScripts()
    })
}


