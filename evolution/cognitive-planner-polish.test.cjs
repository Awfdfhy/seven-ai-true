"use strict";

const assert = require("assert/strict");
const { createMission, nextMissionTasks, updateMissionTask } = require("./cognitive-boost.cjs");

let count = 0;
function check(name, fn) {
  assert.ok(fn(), name);
  count += 1;
  console.log("PASS", name);
}

let mission = createMission({
  id: "budget-frontier",
  goal: "stay inside mission budget",
  budget: { maxCost: 5 },
  tasks: [
    { id: "a", cost: 4 },
    { id: "b", cost: 4 },
    { id: "c", cost: 1 }
  ]
});
check("ready frontier cannot collectively oversubscribe budget", () => nextMissionTasks(mission).map(t => t.id).join(",") === "a,c");
mission = updateMissionTask(mission, "a", "RUNNING");
check("running work reserves mission budget", () => nextMissionTasks(mission).map(t => t.id).join(",") === "c");
assert.throws(() => updateMissionTask(mission, "b", "RUNNING"), /budget exceeded/);
count += 1; console.log("PASS concurrent start cannot exceed mission budget");

const dependent = createMission({
  goal: "respect dependencies",
  budget: { maxCost: 10 },
  tasks: [
    { id: "inspect", cost: 1 },
    { id: "edit", cost: 2, dependsOn: ["inspect"] }
  ]
});
assert.throws(() => updateMissionTask(dependent, "edit", "RUNNING"), /dependencies/);
count += 1; console.log("PASS dependent task cannot start early");

console.log(`cognitive planner polish suite: PASS (${count} assertions)`);