
const Module = require("module");
const originalRequire = Module.prototype.require;
const Path = require("path");

const roots = [
   "Model/",
   "Platform/",
   "Strategy/",
   "Exchange/",
   "Server/",
   "PineServer",
   "Main"
];

Module.prototype.require = function (path: string) {

   if (aliasPath(path)) {
      path = Path.join(__dirname, path);
   }

   // tslint:disable-next-line: no-invalid-this
   return originalRequire.apply(this, [path]);
};

function aliasPath(path: string) {
   for (let i = 0; i < roots.length; i++) {
      if (path.startsWith(roots[i])) {
         return true;
      }
   }

   return false;
}

// tslint:disable-next-line: no-var-requires
require("Main");