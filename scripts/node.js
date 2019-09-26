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

function runCommand(command) {

    switch (command) {
        case undefined:
            console.log("No command supplied");
        case "clean":
            const bin = path.join(projectDir, "out");
            console.log("Cleaning", bin);
            deleteFolder(bin);
            break;
        case "watch":
            buildWatcher();
            break;
        case "build":
            runCommand('clean');
            console.log("Building")
            build();
            break;
        default:
            console.error("Unknown command:", command);
    }
}

function buildWatcher() {

    const paths = [
        "./node_modules/.bin/tsc --watch -p ./src/tsconfig.json",
        "./node_modules/.bin/tsc --watch -p ./src/Reporters/Browser/tsconfig.json",
        "node ./node_modules/node-sass/bin/node-sass -rw ./src/Reporters/Browser/Components/style.scss -o ./out/Reporters/Browser/lib"
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
    // copy src/Reporters/Browser/scripts to out/Reporters/Browser/scripts
    copyFolderRecursiveSync(path.join(projectDir, "src", "Reporters", "Browser", "scripts"), path.join(projectDir, "out", "Reporters", "Browser"))

    const paths = [
        "./node_modules/.bin/tsc -p ./src/tsconfig.json",
        "./node_modules/.bin/tsc -p ./src/Reporters/Browser/tsconfig.json",
        "node ./node_modules/node-sass/bin/node-sass -r ./src/Reporters/Browser/Components/style.scss -o ./out/Reporters/Browser/lib"
    ]

    // paths relative to source
    const copyPaths = [
        "Reporters/Browser/index.html",
        ".testconfig.json"
    ]

    const commands = paths.map((value) => (value.replace(/\//g, path.sep)));

    const promises = []

    commands.forEach(command => {
        const child_process = cp.exec(command);
        let resolver;
        promises.push(new Promise((r) => { resolver = r }));

        child_process.on('exit', () => {
            resolver(0);
        });

        child_process.stderr.on('data', (data) => {
            console.log(data);
        })
        
        child_process.stdout.on('data', (data) => {
            data.split('\n').forEach(elem => {
                if (elem.trim().match(/^([^\s].*)[\(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/))
                    console.log(elem);
            });
        });
    })


    return Promise.all(promises).then((r) => {
        copyPaths.forEach((copyPath) => {
            const split = copyPath.split('/');
            fs.copyFileSync(path.join(projectDir, "src", ...split), path.join(projectDir, "out", ...split));
        })

        console.log("Done.")
        return '';
    });
}

function copyFileSync( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder, { recursive: true } );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

runCommand(command);

