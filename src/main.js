import wire         from 'essential-wire';
import pipeline     from 'when/pipeline';
import chalk        from 'chalk';

import expressBootstrapSpec from './express.bootstrap.spec';
import expressSpec          from './express.spec';

import Timer    from './utils/timer';

let timer = new Timer();

const expressBootstrapTask = (context) => {
    return wire(expressBootstrapSpec);
}

const expressTask = (context) => {
    return context.wire(expressSpec);
}

// const expressTask = () => {
//     return wire(expressSpec);
// }

pipeline([expressBootstrapTask, expressTask]).then(context => {
    console.log(chalk.blue("Wiring time: " + timer.end()));
}).otherwise(error => console.error("ERROR:::", error));