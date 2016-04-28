import caption from '../../utils/caption';

import articlePageContent from '../../templates/build/pages/article';

import articleHeader from '../../templates/build/partials/articleHeader';
import articleMeta from '../../templates/build/partials/articleMeta';
import articleTitle from '../../templates/build/partials/articleTitle';
import brandedArticleHeader from '../../templates/build/partials/brandedArticleHeader';
import hr from '../../templates/build/partials/hr';

import registerPartials from '../../utils/handlebars/registerPartials';

registerPartials({
    'articleHeader': articleHeader,
    'articleMeta': articleMeta,
    'articleTitle': articleTitle,
    'brandedArticleHeader': brandedArticleHeader,
    'hr': hr
});

const composePageContentHtml = (articleData) => {
    let socialLinks = [
        {
            caption: 'ВКонтакте',
            link: 'http://goo.gl/YFa5PI'
        },
        {
            caption: 'Facebook',
            link: 'http://goo.gl/1AbwRq'
        },
        {
            caption: 'Одноклассники',
            link: 'http://goo.gl/GQhtzd'
        },
        {
            caption: 'Telegram',
            link: 'http://goo.gl/0yn1gz'
        },
        {
            caption: 'Instagram',
            link: 'http://goo.gl/mKqUDh'
        }
    ];

    socialLinks.sort(() => {
        return 0.5 - Math.random()
    });

    return articlePageContent({
        id: articleData.id,
        caption: caption(articleData, {mode: 'text'}),
        time: articleData.time,
        company: articleData.company,
        dropcap: articleData.dropcap,
        headerImage: articleData.headerImage,
        headerImageDescription: articleData.headerImageDescription,
        wideImage: articleData.wideImage,
        video: articleData.video,
        lead: articleData.lead,
        gallery: articleData.gallery,
        category: articleData.category,
        articleContent: articleData.articleContent,
        commentsCount: articleData.commentsCount,
        socialLinksMobile: socialLinks.slice(0, 2)
    });
}

function controller(articleData, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(
        articleData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;

// tracing usage:
// import chalk from 'chalk';
// console.log(chalk.green("......"));

// import Logger from '../../utils/logger';
// let logger = new Logger({file: __dirname + '../../../../log/articleData.log'});
// logger.info(articleData);