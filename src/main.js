import wire         from 'essential-wire';
import pipeline     from 'when/pipeline';
import chalk        from 'chalk';

import bootstrapSpec    from './bootstrap.spec';
import expressSpec      from './express.spec';

import Timer    from './utils/timer';

let timer = new Timer();

const bootstrapTask = (context) => {
    return wire(bootstrapSpec);
}

const expressTask = (context) => {
    return context.wire(expressSpec);
}

// const expressTask = () => {
//     return wire(expressSpec);
// }

pipeline([bootstrapTask, expressTask]).then(context => {
    console.log(chalk.blue("Wiring time: " + timer.end()));
}).otherwise(error => console.error("ERROR:::", error));