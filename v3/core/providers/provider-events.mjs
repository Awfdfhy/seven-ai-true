export const PROVIDER_EVENT_TYPES=Object.freeze([
  "start",
  "text_delta",
  "reasoning_delta",
  "tool_call",
  "usage",
  "complete",
  "error"
]);

export function createProviderEvent(type,payload={}){
  if(!PROVIDER_EVENT_TYPES.includes(type))throw new TypeError(`invalid provider event type: ${type}`);
  return Object.freeze({
    type,
    timestamp:Number.isFinite(payload.timestamp)?payload.timestamp:Date.now(),
    provider:payload.provider==null?null:String(payload.provider),
    model:payload.model==null?null:String(payload.model),
    text:payload.text==null?null:String(payload.text),
    reasoning:payload.reasoning==null?null:String(payload.reasoning),
    toolCall:payload.toolCall??null,
    usage:payload.usage??null,
    finishReason:payload.finishReason==null?null:String(payload.finishReason),
    error:payload.error??null,
    metadata:Object.freeze({...payload.metadata})
  });
}

export async function collectProviderEvents(iterable){
  const events=[],text=[],reasoning=[];
  for await(const event of iterable){
    events.push(event);
    if(event.type==="text_delta"&&event.text)text.push(event.text);
    if(event.type==="reasoning_delta"&&event.reasoning)reasoning.push(event.reasoning);
  }
  return Object.freeze({
    events:Object.freeze(events),
    text:text.join(""),
    reasoning:reasoning.join("")
  });
}
