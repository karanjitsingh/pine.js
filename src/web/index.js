const http = require('http')
const https = require('https')
const fs = require('fs');
const path = require('path');

const pineBin = path.join(path.dirname(__dirname), "pine", "bin");

function listener(request,response)
{
    const url = request.url.toString();

    let file = "";

    let promise;
    
    if(url == "/") {
        promise = serve(file = path.join(__dirname, "index.html"), response);
    }
    else if(url.startsWith("/pine")) {
        promise = serve(file = path.join(pineBin, url.replace("/pine", "")), response);
    } else if(url.startsWith("/proxy")) {
        proxy(request, response);
    } else {
        promise = serve(file = path.join(__dirname, url), response);
    }

    if(promise) {
        promise.then((code) => {
            console.log(request.url, file, code);
        });
    } else {
        console.log(request.url, file, 200);
    }
}

function getContentType(file) {
    const ext = path.extname(file);
    switch(ext) {
        case ".js":
        case ".ts":
            return "script";
        case ".map":
            return "text/json"; 
        case ".html":
            return "text/html";
    }
}

function serve(file, response) {
    const promise = new Promise((resolve) => {
        if(fs.existsSync(file)) {
            fs.readFile(file, (err, content) => {
                if(err) {
                    response.writeHead(500, {
                        "Content-Type": "text/HTML"
                    });
                    response.end(err.toString());
                    resolve(500);
                }
                else {
                    response.writeHead(200), {
                        "Content-Type": getContentType(file) 
                    }
                    response.end(content);
                    resolve(200);
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
            resolve(404);
        }
    })

    return promise;
}

const proxy = (request, response) => {
    if(request.method.toLowerCase() == "get") {
        const url = decodeURIComponent(request.url.match(/.*url=(.*)/)[1]);
        const wrappedHeaders = request.headers["pine-wrapped-headers"];

        const headers = JSON.parse(wrappedHeaders);

        if(url.startsWith("https")) {
            https.get(new URL(url), (res) => {

                response.writeHead(res.statusCode, res.headers);

                res.setEncoding('utf8');

                let data = "";
                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function() {
                    response.end(data);
                });
            })
        }
    } else {
        response.writeHead(405);
        response.end();
    } 
}

var server=http.createServer(listener);
server.listen(3000);