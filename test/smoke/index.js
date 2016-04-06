import wire         from 'essential-wire';
import pipeline     from 'when/pipeline';

import { expect }   from 'chai';
import cheerio      from 'cheerio';
import chalk        from 'chalk';

import bootstrapSpec    from '../../src/pages/bootstrap/bootstrap.spec';
import pageSpec         from '../../src/pages/article/page.spec';

const bootstrapTask = (context) => {
    return context ? context.wire(bootstrapSpec) : wire(bootstrapSpec);
}

const pageTask = (context) => {
    return context.wire(pageSpec);
}

const articleTask = () => {
    let articleId = '56f10fe0ec05c49f0500079e';
    return wire({ articleId });
}

const tasks = [bootstrapTask, pageTask];

tasks.unshift(articleTask);

pipeline(tasks).then(context => {
    expect(context).to.be.ok;
    
    console.log(chalk.green("Tests passed"));
}).otherwise(error => console.error(chalk.red("ERROR:::"), chalk.blue(error)));