'use strict';
// RPG-only patch for the shared model transport: never present unusable providers
// as selectable, and never overwrite a valid ranked selection with a stale ID.
const START='        function populateFreeModelSelect(selectedValue) {';
const END='        function getRouteUiStateV1() {';
function replaceOne(source,from,to) {
  if(!source.includes(from))throw Error('RPG model repair anchor missing: '+from.slice(0,60));
  return source.replace(from,to);
}
function patchRpgModelRuntime(html) {
  let result=String(html);
  const start=result.indexOf(START),end=result.indexOf(END,start);
  if(start<0||end<start)throw Error('RPG model catalog function anchors missing');
  const picker=[
'        function populateFreeModelSelect(selectedValue) {',
'            const select = document.getElementById("modelSelect");',
'            if (!select) return;',
'            const wanted = selectedValue || currentModel;',
'            const now = Date.now();',
'            const all = getFreeModelCatalog().filter(m => m.free === true && isFreePriceProofFresh(m, now));',
'            const configured = m => isFreeProviderConfigured(m.provider) && (!m.requiresExplicitEnable || isFreeProviderEnabled(m.provider));',
'            const ready = all.filter(m => configured(m) && !isFreeModelCoolingDown(m,now));',
'            const context = modelPickerContextV3();',
'            const ranked = rankModelCandidatesV3(ready,context);',
'            select.replaceChildren();',
'            if (ranked.length) {',
'                const group = document.createElement("optgroup");',
'                group.label = "Configured / anonymous routes — can try now";',
'                ranked.forEach((row,index)=>{',
'                    const model=row.model, opt=document.createElement("option");',
'                    opt.value=freeModelSelectionKey(model.provider,model.id);',
'                    opt.dataset.provider=model.provider;',
'                    opt.dataset.rank=String(index+1);',
'                    opt.dataset.score=row.score.toFixed(2);',
'                    opt.textContent=model.label+" · "+providerDisplayName(model.provider)+" · "+Math.round(model.contextWindow/1024)+"K context";',
'                    group.appendChild(opt);',
'                });',
'                select.appendChild(group);',
'            } else {',
'                const opt=document.createElement("option");',
'                opt.value="";opt.disabled=true;opt.textContent="No available route — refresh or check provider access";',
'                select.appendChild(opt);',
'            }',
'            const unavailable=all.filter(m=>!ready.includes(m));',
'            if(unavailable.length){',
'                const group=document.createElement("optgroup");',
'                group.label="Unavailable — requires credentials or temporarily cooling";',
'                unavailable.forEach(model=>{',
'                    const opt=document.createElement("option");opt.disabled=true;',
'                    opt.value=freeModelSelectionKey(model.provider,model.id);',
'                    opt.dataset.provider=model.provider;',
'                    opt.textContent=model.label+" · "+providerDisplayName(model.provider)+(configured(model)?" · cooling down":" · not configured");',
'                    group.appendChild(opt);',
'                });',
'                select.appendChild(group);',
'            }',
'            const canPreserve=[...select.options].some(opt=>!opt.disabled&&opt.value===wanted);',
'            select.value=canPreserve?wanted:(ranked.length?freeModelSelectionKey(ranked[0].model.provider,ranked[0].model.id):"");',
'            select.dataset.rpgAvailableCount=String(ranked.length);',
'            const counter=document.getElementById("rpg-model-count");',
'            if(counter)counter.textContent=ranked.length+" selectable · "+unavailable.length+" unavailable";',
'            if(!ranked.length){',
'                const status=document.getElementById("freeModelStatus");',
'                if(status)status.textContent="No configured, non-cooling model is available. Try refresh or Auto after provider recovery.";',
'            }',
'        }',
'',
'        '
  ].join('\n');
  result=result.slice(0,start)+picker+result.slice(end);
  result=replaceOne(result,
    '            document.getElementById("modelSelect").value = currentModel;\n            document.getElementById("temperatureRange").value',
    '            // The picker has already selected a valid configured route.\n            document.getElementById("temperatureRange").value');
  result=replaceOne(result,
    '            refreshModelDependentControls(currentModel, currentReasoningEffort, currentMaxTokens);\n            onRoutingModeChange();',
    '            refreshModelDependentControls(document.getElementById("modelSelect").value || currentModel, currentReasoningEffort, currentMaxTokens);\n            onRoutingModeChange();');
  result=replaceOne(result,
    '                populateFreeModelSelect(currentModel);\n                renderFreeModelFabricStatus',
    '                populateFreeModelSelect(document.getElementById("modelSelect").value || currentModel);\n                onRoutingModeChange();\n                renderFreeModelFabricStatus');
  result=replaceOne(result,
    '            const selected = document.getElementById("modelSelect").value;\n            currentModel = isValidFreeModelSelection(selected) ? selected : DEFAULT_MODEL;',
    '            const modelPicker=document.getElementById("modelSelect");\n            const selected=modelPicker.value;\n            if(currentRoutingMode==="manual" && (!selected || !isValidFreeModelSelection(selected) || modelPicker.selectedOptions[0]?.disabled)){\n                renderFreeModelFabricStatus("Choose a configured model or switch to Automatic routing.");\n                modelPicker.focus();\n                return;\n            }\n            currentModel = selected && isValidFreeModelSelection(selected) ? selected : currentModel;');
  // Validate the draft BEFORE writing mode and preferences, avoiding half-saved invalid state.
  result=replaceOne(result,
    '        function saveSettings() {\n            freeProviderPrefs = automaticProviderPrefs();',
    '        function saveSettings() {\n            const requestedMode=document.getElementById("routingModeSelect").value;\n            const draftModel=document.getElementById("modelSelect");\n            if(requestedMode==="manual" && (!draftModel.value || !isValidFreeModelSelection(draftModel.value) || draftModel.selectedOptions[0]?.disabled)){\n                renderFreeModelFabricStatus("No usable narrator model selected. Switch to Auto or refresh your routes.");\n                draftModel.focus();return;\n            }\n            freeProviderPrefs = automaticProviderPrefs();');
  result=replaceOne(result,
    '            document.getElementById("modelSelect").disabled = mode === "auto";',
    '            const picker=document.getElementById("modelSelect");\n            picker.disabled = mode === "auto" || picker.dataset.rpgAvailableCount==="0";');
  // Correct the reported counts: static unconfigured seeds are NOT usable models.
  result=replaceOne(result,
    '            const catalog = getFreeModelCatalog().filter(m => m.free === true);',
    '            const catalog = getFreeModelCatalog().filter(m => m.free === true && isFreePriceProofFresh(m) && isFreeProviderConfigured(m.provider));');
  return result;
}
module.exports={patchRpgModelRuntime};
