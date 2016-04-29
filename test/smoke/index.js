import pipeline     from 'when/pipeline';

import { expect }   from 'chai';
import cheerio      from 'cheerio';
import chalk        from 'chalk';

import receptionSpec         from '../../src/reception.spec';
import { createTasks, createTask } from '../../src/utils/tasks';

let environment = {
    // accessToken: '57rvBRYOy1ztDOFUM0PRfipzIipfqf9tVjFuvsWkixMPsFtmqYjOv7mhsjtxD6OdJRyooF1C-5bjE4zOk7MWgXxJUDtTI7YXgjHCtaZ4jk64rme0dy588bfahGOddERZ',
    accessToken: 't3h8_FsEh8Nqcm8P7NhtePmo3Uqr9isqm0nbIEEwFk4AAH5PL4d0VNGANFGX_jKj7MoBqHsQZ3F1DrMhHsz9YkKQc9kHLGvXxRiC7Ax-xUUZg_jru45hN6z6ONJmdE8T',
    targetUrl: 'ttp://localhost:3002/auth',
    response: {}
}

const tasks = createTasks([environment, receptionSpec]);

pipeline(tasks).then(context => {
    expect(context).to.be.ok;

    console.log("context", context.userProfileData);
    
    console.log(chalk.green("Tests passed"));
}).otherwise(error => console.error(chalk.red("ERROR:::"), chalk.blue(error)));