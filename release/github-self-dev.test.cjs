"use strict";
const fs=require("fs");
const path=require("path");
const assert=require("assert/strict");
const {build}=require("./build-release.cjs");
const ROOT=path.resolve(__dirname,"..");
const runtime=fs.readFileSync(path.join(__dirname,"github-self-dev.js"),"utf8");
const shell=fs.readFileSync(path.join(__dirname,"workspaces","seven-shell-final.js"),"utf8");
const native=fs.readFileSync(path.join(ROOT,"apk","materialize-native-platform.cjs"),"utf8");

assert.match(runtime,/SevenGitHubSelfDev/);
assert.match(runtime,/githubBeginDeviceFlow/);
assert.match(runtime,/githubPollDeviceFlow/);
assert.match(runtime,/githubJobLogs/);
assert.match(runtime,/Autonomous Development/);
assert.match(runtime,/PROTECTED_PATHS/);
assert.match(shell,/\.\/github-self-dev\.js/);
assert.match(native,/githubBeginDeviceFlow/);
assert.match(native,/githubApi/);
assert.match(native,/githubJobLogs/);
assert.match(native,/AndroidKeyStore/);

const built=build();
assert.equal(built.githubSelfDevLoadMode,"lazy-local");
assert.equal(built.githubSelfDevFile.path,"github-self-dev.js");
assert.ok(fs.existsSync(path.join(ROOT,"dist","github-self-dev.js")));
assert.ok(!built.workspaceFiles.some(x=>x.path==="workspaces/github-self-dev.js"));
console.log("GitHub Self Development contract: PASS");
