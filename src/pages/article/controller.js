import chalk from 'chalk';

import articlePageContent   from '../../templates/build/pages/article';

import articleHeader        from '../../templates/build/partials/articleHeader';
import articleMeta          from '../../templates/build/partials/articleMeta';
import articleTitle         from '../../templates/build/partials/articleTitle';
import brandedArticleHeader from '../../templates/build/partials/brandedArticleHeader';
import hr                   from '../../templates/build/partials/hr';

import registerPartials from '../../utils/handlebars/registerPartials';

registerPartials({
    'articleHeader': articleHeader,
    'articleMeta': articleMeta,
    'articleTitle': articleTitle,
    'brandedArticleHeader': brandedArticleHeader,
    'hr': hr
});

const composePageContentHtml = (articleData) => {
    return articlePageContent({
        сaption: articleData.сaption,
        time: articleData.time,
        company: articleData.company,
        dropcap: articleData.dropcap,
        video: articleData.video,
        lead: articleData.lead,
        gallery: articleData.gallery,
        
        articleContent: articleData.articleContent,
        commentsCount: articleData.commentsCount,
    })
}

function controller(articleData, articleId, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(
        articleData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;

// console.log(chalk.green("article:::::", JSON.stringify(article), articleId));