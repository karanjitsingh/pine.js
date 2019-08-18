const fs = require('fs');
const path = require('path');
const npm = require('npm');

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
        const bin = path.join(projectDir, "pine", "bin");
        console.log("Deleting", bin);
        deleteFolder(bin);
        break;
    case "watch":
        npm.load(() => buildWatcher());
        break;
    case "build":
        npm.load(() => build());
        break;
    default:
        console.error("Unknown command:", command);
}

function buildWatcher() {
    fs.watch("./src/pine", {
        recursive: true
    }, (e, file) => {
        const b = file.endsWith("tsconfig.json") || file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".scss");
        if(b) {
            build();
        }
    });
}

function build() {
    npm.commands["run-script"](["build"], (err) => {
        console.error(err)
    });
}