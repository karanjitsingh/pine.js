

const Module = require('module');
const originalRequire = Module.prototype.require;
const Path = require('path');

const roots = [
   "Model/",
   "Platform/",
   "Strategy/",
   "Exchange/",
   "PineServer",
   "Main"
];

Module.prototype.require = function (path: string) {

   if(aliasPath(path))
      path = Path.join(__dirname,path);

   return originalRequire.apply(this, [path]);
};

function aliasPath(path: string) {
   for(let i =0;i<roots.length;i++) {
      if(path.startsWith(roots[i]))
         return true;
   }

   return false;
}

require('Main');