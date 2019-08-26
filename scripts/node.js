const fs = require('fs');
const path = require('path');
const npm = require('npm');
const cp = require('child_process');

const projectDir = path.dirname(path.dirname(__filename));
const command = process.argv[2].toLowerCase();


const deleteFolder = (path) => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            const curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

switch (command) {
    case undefined:
        console.log("No command supplied");
    case "clean":
        const bin = path.join(projectDir, "out");
        console.log("Deleting", bin);
        deleteFolder(bin);
        break;
    case "watch":
        buildWatcher();
        break;
    case "build":
        npm.load(() => build());
        break;
    default:
        console.error("Unknown command:", command);
}

function buildWatcher() {
    
    const paths = [
        "./node_modules/.bin/tsc --watch -p ./src/tsconfig.json",
        "./node_modules/.bin/tsc --watch -p ./src/Reporters/Browser/tsconfig.json",
        "node ./node_modules/node-sass/bin/node-sass -rw ./src/Reporters/Browser/Components/style.scss -o ./out/Reporters/Browser"
    ]
    
    const commands = paths.map((value) => (value.replace(/\//g, path.sep)));

    commands.forEach(command => {
        const child_process = cp.exec(command);

        child_process.stdout.on('data', (data) => {
            process.stderr.write(data);
        });

        child_process.stderr.on('data', (data) => {
            process.stderr.write(data);

        });

        child_process.on('error', (error) => {
            console.error(error);
        })
    })

    endless();
}

function endless() {
    setTimeout(endless, 1000);
}

function build() {
    npm.commands["run-script"](["build"], (err) => {
        if(err)
            console.error(err)
    });
}