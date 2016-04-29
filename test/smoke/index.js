import pipeline     from 'when/pipeline';

import { expect }   from 'chai';
import cheerio      from 'cheerio';
import chalk        from 'chalk';

import receptionSpec         from '../../src/reception.spec';
import { createTasks, createTask } from '../../src/utils/tasks';

let environment = {
    accessToken: '',
    targetUrl: 'ttp://localhost:3002/auth'
}

const tasks = createTasks([environment, receptionSpec]);

pipeline(tasks).then(context => {
    expect(context).to.be.ok;

    console.log("context", context.userProfileData);
    
    console.log(chalk.green("Tests passed"));
}).otherwise(error => console.error(chalk.red("ERROR:::"), chalk.blue(error)));