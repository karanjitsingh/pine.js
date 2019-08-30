const fs = require('fs');
const path = require('path');
const npm = require('npm');
const cp = require('child_process');

const projectDir = path.dirname(path.dirname(__filename));
// const command = process.argv[2].toLowerCase();

const tty = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
}

function build() {

    const paths = [
        "./node_modules/.bin/tsc -p ./src/tsconfig.json",
        "./node_modules/.bin/tsc -p ./src/Reporters/Browser/tsconfig.json",
        "node ./node_modules/node-sass/bin/node-sass -r ./src/Reporters/Browser/Components/style.scss -o ./out/Reporters/Browser"
    ]
    
    const commands = paths.map((value) => (value.replace(/\//g, path.sep)));

    const promises = []

    commands.forEach(command => {
        const child_process = cp.exec(command);
        let resolver;
        promises.push(new Promise((r) => {resolver = r}));

        child_process.on('exit', () => {
            resolver(0);
        });
    })


    return Promise.all(promises).then((r) => {
        fs.copyFileSync(path.join(projectDir, "src", "Reporters", "Browser", "index.html"), path.join(projectDir, "out", "Reporters", "Browser", "index.html"));
        return '';
    });
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

            data.split('\n').forEach(elem => {
                if(elem.trim().match(/^([^\s].*)[\(:](\d+)[,:](\d+)(?:\):\s+|\s+-\s+)(error|warning|info)\s+TS(\d+)\s*:\s*(.*)$/))
                    console.log(elem);
            });
        });
    })

    endless();
}

// buildWatcher();

function endless() {
    setTimeout(endless, 1000);
}

build().then(() => {
    buildWatcher();
})
