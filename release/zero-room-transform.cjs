'use strict';
const fs=require('fs');
const path=require('path');
function replaceOnce(html,from,to,label){if(!html.includes(from))throw new Error('zero-room transform missing '+label);return html.replace(from,to)}
function applyZeroRoomTransform(html){
 if(html.includes('SEVEN_TRUE_ZERO_ROOM_V1'))return html;
 html=replaceOnce(html,`            if (Object.keys(normalizedRooms).length === 0) {\n                normalizedRooms.default = createEmptyRoom();\n                normalizedTitles.default = "Chat";\n            }\n            return { rooms: normalizedRooms, roomTitles: normalizedTitles };`,`            return { rooms: normalizedRooms, roomTitles: normalizedTitles };`,'normalize empty state');
 html=replaceOnce(html,`            currentRoom = (savedCurrentRoom && own(rooms, savedCurrentRoom))\n                ? savedCurrentRoom\n                : Object.keys(rooms)[0];`,`            currentRoom = (savedCurrentRoom && own(rooms, savedCurrentRoom))\n                ? savedCurrentRoom\n                : (Object.keys(rooms)[0] || "");`,'legacy current room');
 html=replaceOnce(html,`                if (!Object.keys(value.rooms).length || !own(value.rooms, value.currentRoom)) throw new Error('INVALID_CURRENT_ROOM');`,`                const roomIds = Object.keys(value.rooms);\n                if ((roomIds.length === 0 && value.currentRoom !== '') || (roomIds.length > 0 && !own(value.rooms, value.currentRoom))) throw new Error('INVALID_CURRENT_ROOM');`,'empty snapshot validation');
 html=replaceOnce(html,`                rooms = normalized.rooms; roomTitles = normalized.roomTitles; currentRoom = value.currentRoom;`,`                rooms = normalized.rooms; roomTitles = normalized.roomTitles; currentRoom = Object.keys(rooms).length ? value.currentRoom : "";`,'empty snapshot apply');
 html=replaceOnce(html,`            if (Object.keys(rooms).length <= 1) { alert("Cannot delete last room."); return; }\n            if (confirm("Delete this room?")) {\n                delete rooms[id];\n                delete roomTitles[id];\n                if (currentRoom === id) currentRoom = Object.keys(rooms)[0];`,`            if (confirm("Delete this room?")) {\n                delete rooms[id];\n                delete roomTitles[id];\n                if (currentRoom === id) currentRoom = Object.keys(rooms)[0] || "";`,'delete final room');
 html=replaceOnce(html,`        function updateRoomTitle() {\n            document.getElementById("roomTitle").textContent = roomTitles[currentRoom] || currentRoom;\n        }`,`        function updateRoomTitle() {\n            document.getElementById("roomTitle").textContent = currentRoom ? (roomTitles[currentRoom] || currentRoom) : "New Chat";\n        }`,'title without room');
 html=replaceOnce(html,`            const roomId = currentRoom;\n            const room = rooms[roomId];\n            if (!room) return;`,`            if (!currentRoom || !own(rooms, currentRoom)) {\n                let id = Date.now().toString();\n                while (own(rooms, id)) id = (Number(id) + 1).toString();\n                rooms[id] = createEmptyRoom();\n                roomTitles[id] = "New Chat";\n                currentRoom = id;\n            }\n            const roomId = currentRoom;\n            const room = rooms[roomId];\n            if (!room) return;`,'first send room creation');
 return html.replace('</body>','<!-- SEVEN_TRUE_ZERO_ROOM_V1 --></body>');
}
function disablePlaceholderFacade(file){
 if(!fs.existsSync(file))throw new Error('zero-room workspace asset missing');
 let js=fs.readFileSync(file,'utf8');
 const before=(js.match(/installZeroRoomFacade\(\);/g)||[]).length;
 if(before<2)throw new Error('zero-room placeholder facade call sites changed');
 js=js.replace(/installZeroRoomFacade\(\);/g,'void 0;');
 fs.writeFileSync(file,js);
 return before;
}
function transformFile(file){
 const before=fs.readFileSync(file,'utf8'),after=applyZeroRoomTransform(before);fs.writeFileSync(file,after);
 disablePlaceholderFacade(path.resolve(path.dirname(file),'workspaces/ui-polish-fixes.js'));
 return after;
}
if(require.main===module){const file=path.resolve(__dirname,'../dist/seven_ai-release.html');transformFile(file);console.log('true zero-room transform: PASS');}
module.exports={applyZeroRoomTransform,transformFile,disablePlaceholderFacade};
