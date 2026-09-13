"use strict";

module.exports = Object.freeze({
  taskContract: require("./task-contract.cjs"),
  truthFabric: require("./truth-fabric.cjs"),
  contextCompiler: require("./context-compiler.cjs"),
  resourceGovernor: require("./resource-governor.cjs"),
  sideEffectLedger: require("./side-effect-ledger.cjs")
});
