const assert=require('assert');const {extractRules,verifyDraft}=require('../lib/core');
const meeting={id:'MTG-T01',date:'2026-09-23'};const seg=[{id:'SEG-T01',start_ms:0,end_ms:20000,speaker:'主任',text:'防火門目前完成32樘，剩18樘。五金還有6組沒到，永盛說下週三會全部補齊。採購明天下班前再確認一次，如果再延誤會影響七樓裝修。'}];
const d=extractRules(meeting,seg);const types=d.map(x=>x.event_type);for(const x of ['PROGRESS','ISSUE','COMMITMENT','ACTION','RISK'])assert(types.includes(x),'missing '+x);
assert.throws(()=>verifyDraft(d[0],null,seg),/reviewer required/);assert.throws(()=>verifyDraft({...d[0],evidence:[{segment_id:'BAD'}]},'R1',seg),/invalid evidence/);
const e=verifyDraft(d[0],'R1',seg);assert(e.human_verified===true);assert(e.evidence[0].segment_id==='SEG-T01');assert(e.ai_original);
console.log(JSON.stringify({tests:8,passed:8,failed:0,extracted:types},null,2));