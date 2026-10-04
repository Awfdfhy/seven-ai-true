import { describe, expect, it } from "vitest";
import { createRoom, isRoom, withRoomMode } from "./index";

describe("room routing mode", () => {
  it("persists a validated per-room mode while accepting legacy rooms without it", () => {
    const room = createRoom({ id: "mode-room", now: 1 });
    expect(room.mode).toBe("balanced");
    const deep = withRoomMode(room, "deep", 2);
    expect(deep.mode).toBe("deep");
    expect(isRoom(deep)).toBe(true);
    const { mode: _ignored, ...legacy } = deep;
    expect(isRoom(legacy)).toBe(true);
    expect(isRoom({ ...deep, mode: "invalid" })).toBe(false);
  });
});
