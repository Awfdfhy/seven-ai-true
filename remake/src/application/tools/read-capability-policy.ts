export interface ToolCapabilityPolicy {
  capabilitiesFor(input:Readonly<{
    query:string;
    roomId:string;
    taskId:string;
  }>):readonly string[];
}

function normalize(value:string):string{
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
}

export class DefaultReadToolCapabilityPolicy implements ToolCapabilityPolicy {
  capabilitiesFor(input:Readonly<{query:string;roomId:string;taskId:string}>):readonly string[]{
    const q=normalize(input.query);
    const caps=["memory.read"];
    const explicitHistory=
      /\b(previous chat|previous conversation|chat history|conversation history|older chat|old chat|another chat|past conversation|earlier conversation)\b/.test(q) ||
      /محادثه سابقه|محادثة سابقة|محادثات سابقه|محادثات سابقة|سجل المحادثات|دردشه سابقه|دردشة سابقة|محادثه قديمه|محادثة قديمة/.test(q);
    if(explicitHistory)caps.push("rooms.read");
    return Object.freeze(caps);
  }
}
