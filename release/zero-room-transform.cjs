'use strict';

function replaceOnce(html, from, to, label) {
  if (!html.includes(from)) throw new Error('zero-room transform missing '+label);
  return html.replace(from,to);
}

function applyZeroRoomTransform(html) {
  html=replaceOnce(html,
`            if (Object.keys(normalizedRooms).length === 0) {
                normalizedRooms.default = createEmptyRoom();
                normalizedTitles.default = "Chat";
            }
            return { rooms: normalizedRooms, roomTitles: normalizedTitles };`,
`            return { rooms: normalizedRooms, roomTitles: normalizedTitles };`,
'normalize empty state');

  html=replaceOnce(html,
`            currentRoom = (savedCurrentRoom && own(rooms, savedCurrentRoom))
                ? savedCurrentRoom
                : Object.keys(rooms)[0];`,
`            currentRoom = (savedCurrentRoom && own(rooms, savedCurrentRoom))
                ? savedCurrentRoom
                : (Object.keys(rooms)[0] || "");`,
'legacy current room');

  html=replaceOnce(html,
`                if (!Object.keys(value.rooms).length || !own(value.rooms, value.currentRoom)) throw new Error('INVALID_CURRENT_ROOM');`,
`                const roomIds = Object.keys(value.rooms);
                if ((roomIds.length === 0 && value.currentRoom !== '') || (roomIds.length > 0 && !own(value.rooms, value.currentRoom))) throw new Error('INVALID_CURRENT_ROOM');`,
'empty snapshot validation');

  html=replaceOnce(html,
`                rooms = normalized.rooms; roomTitles = normalized.roomTitles; currentRoom = value.currentRoom;`,
`                rooms = normalized.rooms; roomTitles = normalized.roomTitles; currentRoom = Object.keys(rooms).length ? value.currentRoom : "";`,
'empty snapshot apply');

  html=replaceOnce(html,
`            if (Object.keys(rooms).length <= 1) { alert("Cannot delete last room."); return; }
            if (confirm("Delete this room?")) {
                delete rooms[id];
                delete roomTitles[id];
                if (currentRoom === id) currentRoom = Object.keys(rooms)[0];`,
`            if (confirm("Delete this room?")) {
                delete rooms[id];
                delete roomTitles[id];
                if (currentRoom === id) currentRoom = Object.keys(rooms)[0] || "";`,
'delete final room');

  html=replaceOnce(html,
`        function updateRoomTitle() {
            document.getElementById("roomTitle").textContent = roomTitles[currentRoom] || currentRoom;
        }`,
`        function updateRoomTitle() {
            document.getElementById("roomTitle").textContent = currentRoom ? (roomTitles[currentRoom] || currentRoom) : "New Chat";
        }`,
'title without room');

  html=replaceOnce(html,
`            const roomId = currentRoom;
            const room = rooms[roomId];
            if (!room) return;`,
`            if (!currentRoom || !own(rooms, currentRoom)) {
                let id = Date.now().toString();
                while (own(rooms, id)) id = (Number(id) + 1).toString();
                rooms[id] = createEmptyRoom();
                roomTitles[id] = "New Chat";
                currentRoom = id;
            }
            const roomId = currentRoom;
            const room = rooms[roomId];
            if (!room) return;`,
'first send room creation');

  return html;
}

module.exports={applyZeroRoomTransform};
