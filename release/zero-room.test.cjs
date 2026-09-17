'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {build,OUTPUT}=require('./build-release.cjs');
const {transformFile}=require('./zero-room-transform.cjs');

build();
transformFile(OUTPUT);
const html=fs.readFileSync(OUTPUT,'utf8');
const polish=fs.readFileSync(path.join(__dirname,'../dist/workspaces/ui-polish-fixes.js'),'utf8');
const loader=fs.readFileSync(path.join(__dirname,'attachment-loader.js'),'utf8');

assert(html.includes('SEVEN_TRUE_ZERO_ROOM_V1'));
assert(!html.includes('Cannot delete last room.'));
assert(!html.includes('normalizedRooms.default = createEmptyRoom()'));
assert(html.includes("roomIds.length === 0 && value.currentRoom !== ''"));
assert(html.includes('Object.keys(rooms)[0] || ""'));
assert(html.includes('if (!currentRoom || !own(rooms, currentRoom))'));
assert(html.includes('currentRoom ? (roomTitles[currentRoom] || currentRoom) : "New Chat"'));
assert(!polish.includes('installZeroRoomFacade();'));
assert(polish.includes('function installZeroRoomFacade(){'));
assert(loader.includes("d.addEventListener('pointerdown',warm,true)"));
assert(loader.includes("d.addEventListener('touchstart',warm,{capture:true,passive:true})"));
assert(!loader.includes('ev.preventDefault();ev.stopImmediatePropagation();'));
assert(!loader.includes("trigger.click()"));
console.log('true zero-room + attachment activation: PASS');
