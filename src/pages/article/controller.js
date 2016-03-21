import chalk from 'chalk';

import carcass              from 'drive-templates/build/carcass';
import head                 from 'drive-templates/build/head';
import body                 from 'drive-templates/build/body';

import articlePageContent   from 'drive-templates/build/pages/article';

import articleHeader        from 'drive-templates/build/partials/articleHeader';
import articleMeta          from 'drive-templates/build/partials/articleMeta';
import articleTitle         from 'drive-templates/build/partials/articleTitle';
import brandedArticleHeader from 'drive-templates/build/partials/brandedArticleHeader';
import hr                   from 'drive-templates/build/partials/hr';



function controller(article, brands, cities, articleId) {

    console.log(chalk.green("article:::::", JSON.stringify(article), articleId));

    return {
        html: JSON.stringify(article)
    }
}

export default controller;