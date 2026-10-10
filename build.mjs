import {minify} from "html-minifier-terser";
import {minify as tmin} from "terser";
import fs from "fs";
const banner="<!-- Paisa Ledger © 2026 krishikabhatu2018. All rights reserved. Copying, modifying or redistributing this code without written permission is prohibited. -->";
fs.mkdirSync("build",{recursive:true});
const src=fs.readFileSync("src/index.html","utf8");
let out=await minify(src,{collapseWhitespace:true,removeComments:true,minifyCSS:true,
  minifyJS:{mangle:{toplevel:true},compress:{passes:2},format:{comments:false}}});
out=out.replace(/^<!doctype html>/i,"<!doctype html>\n"+banner+"\n");
fs.writeFileSync("build/index.html",out);
const sw=await tmin(fs.readFileSync("src/sw.js","utf8"),{mangle:{toplevel:true},format:{preamble:"/* © 2026 krishikabhatu2018. Paisa Ledger. All rights reserved. */"}});
fs.writeFileSync("build/sw.js",sw.code);
for(const f of ["manifest.json","icon-192.png","icon-512.png","xlsx.full.min.js"])fs.copyFileSync("src/"+f,"build/"+f);
console.log("index.html",src.length,"->",out.length);
