import wire         from 'essential-wire';
import pipeline     from 'when/pipeline';

import { expect }   from 'chai';
import cheerio      from 'cheerio';
import chalk        from 'chalk';

// TODO: use pages/bootstrap ?
import bootstrapSpec    from '../../src/bootstrap.spec';
import mainPageSpec     from '../../src/pages/home/page.spec';

const bootstrapTask = () => {
    return wire(bootstrapSpec);
}

const pageTask = (context) => {
    return context.wire(mainPageSpec);
}

pipeline([bootstrapTask, pageTask]).then(context => {
    expect(context).to.be.ok;
    expect(context.pageHead).to.be.a('function');
    expect(context.pageTemplate).to.be.a('function');
    
    console.log(chalk.green("Tests passed"));
}).otherwise(error => console.error(chalk.red("ERROR:::"), chalk.blue(error)));