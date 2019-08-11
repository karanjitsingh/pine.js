const fs = require('fs');
const path = require('path');

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
    default:
        console.error("Unknown command:", command);
}
