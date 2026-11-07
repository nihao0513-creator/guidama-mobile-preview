// PC판과 같은 계열의 무료 규칙 기반 검토 초안. 사실·결정·담당자를 확정하지 않습니다.
const CATEGORIES=[
  {label:'인력·퇴사 배경',words:['퇴사','그만두','매니저','직원','인력','교체'],task:'인력·퇴사 배경에 관한 발언을 확인하고 필요한 조치를 검토'},
  {label:'소통·업무 지시',words:['소통','대화','표현','점장','지시','갈등','말씀'],task:'직원 간 소통과 업무 지시 방식의 개선 필요성을 확인'},
  {label:'교육·역할',words:['교육','신규','메뉴','가격','주문','역할','업무','체계'],task:'신규 직원 교육과 업무 역할·절차를 점검'},
  {label:'고객 응대·품질',words:['고객','응대','서비스','맛','음식','품질','불만'],task:'고객 응대와 음식 품질 관련 사례를 확인'},
  {label:'매장 운영',words:['운영','청소','재고','휴게','식사','위생','관리'],task:'매장 운영 관련 사항을 점검'}
];
export function analyzeText(transcript){
  const segments=String(transcript||'').split(/\n\s*\n/).map(s=>{const m=s.match(/^\[(\d{2}:\d{2}:\d{2})\]\s*([\s\S]*)$/);return m?{time:m[1],text:m[2].replace(/\s+/g,' ').trim()}:null}).filter(s=>s&&s.text);
  const selected=[];for(const category of CATEGORIES){const candidates=segments.map(s=>({...s,hits:category.words.filter(w=>s.text.includes(w)).length})).filter(s=>s.hits>=2).sort((a,b)=>b.hits-a.hits);if(candidates[0])selected.push({category,time:candidates[0].time})}
  const topics=selected.map(x=>({time:x.time,text:`전사에서는 ${x.category.label}에 관한 발언이 확인됐다. 구체적인 경위와 사실관계는 원음 및 참석자에게 확인해야 한다.`}));
  const tasks=selected.filter(x=>x.category.label!=='인력·퇴사 배경').map(x=>({id:crypto.randomUUID(),text:x.category.task+' (검토용 후보)',time:x.time,done:false}));
  const labels=selected.map(x=>x.category.label);const overview=labels.length?`이번 회의 전사에서는 ${labels.join(', ')}에 관한 이야기가 나왔다. 전체 전사문을 빠르게 분류한 초안이며, 발언의 사실 여부와 합의·결정 여부는 확인되지 않았다.`:'전사문에서 주요 논의를 안정적으로 분류하지 못했습니다. 원음과 전사문을 대조한 뒤 직접 보완하세요.';
  return{overview,topics,tasks,verify:['자동 전사의 고유명사·숫자·발언자를 원음에 대조하세요.','결정·담당자·기한은 참석자에게 확인하기 전까지 확정하지 마세요.']};
}
export function reportText(result){return ['회의 요약 (검토용 초안)',result.overview,'','주요 논의',...(result.topics.length?result.topics.map(x=>`[${x.time}] ${x.text}`):['확인된 주제 없음']),'','확인 필요',...result.verify].join('\n')}
