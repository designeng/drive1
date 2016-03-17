import wire         from 'essential-wire';
import pipeline     from 'when/pipeline';

import { expect }   from 'chai';
import cheerio      from 'cheerio';
import chalk        from 'chalk';

import demoPageSpec from '../../src/pages/demo/page.spec';

const smokeTask = () => {
    return wire(demoPageSpec);
}

pipeline([smokeTask]).then(context => {
    let $ = cheerio.load(context.page);
    let collection = $('.nncard');
    expect(collection.length).to.equal(8);
 
    let caption = $('#56e2742cec05c4250e000882').find('h4').text();
    let str = 'Новая Impreza';
    expect(caption.slice(0, str.length)).to.equal(str);
}).otherwise(error => console.error(chalk.red("ERROR:::"), chalk.blue(error)));