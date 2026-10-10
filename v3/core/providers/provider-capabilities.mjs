export function assertRequestSupported(descriptor,request){
  const cap=descriptor?.capabilities||{};
  if(request.stream===true&&cap.stream===false)throw new Error(`provider ${descriptor.id} does not support streaming`);
  if((request.tools?.length||0)>0&&cap.tools!==true)throw new Error(`provider ${descriptor.id} does not support tools`);
  const hasVision=(request.messages||[]).some(m=>Array.isArray(m.content)&&m.content.some(x=>x&&["image","image_url"].includes(x.type)));
  if(hasVision&&cap.vision!==true)throw new Error(`provider ${descriptor.id} does not support vision`);
  if(request.metadata?.requireStructured===true&&cap.structured!==true)throw new Error(`provider ${descriptor.id} does not support structured output`);
  if(request.reasoningEffort&&cap.reasoning!==true)throw new Error(`provider ${descriptor.id} does not support reasoning effort`);
  if(Number(request.maxOutputTokens)>Number(descriptor?.limits?.maxOutputTokens||Infinity))throw new Error(`request exceeds ${descriptor.id} output-token limit`);
  return true;
}
