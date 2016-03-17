import webpack      from "webpack";
import chalk        from "chalk";
import { exec }     from "child_process";
import config       from "./webpack.config";

const compiler = webpack(config);

compiler.run((err, stats) => {
    if (err) {
        console.log(`COMPILATION ERROR: ${err}`);
    } else {
        exec('npm test', (error, stdout, stderr) => {
            console.log(`stdout: ` + chalk.blue(stdout));
            console.log(`stderr: ` + chalk.red (stderr));
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }
});