const crypto=require('crypto');
const TYPES=new Set(['FACT','PROGRESS','DECISION','ACTION','COMMITMENT','ISSUE','RISK','CHANGE','WORK_STOPPAGE','INFORMATION','UNKNOWN']);
const DOMAINS=new Set(['GENERAL','PROCUREMENT','CONTRACT','COST','SCHEDULE','DESIGN','QUALITY','SAFETY','CONSTRUCTION']);
function id(p){return p+'-'+crypto.randomUUID()}
function validateDraft(d){const e=[];if(!TYPES.has(d.event_type))e.push('invalid event_type');if(!DOMAINS.has(d.domain))e.push('invalid domain');if(!d.subject)e.push('subject required');if(!Array.isArray(d.evidence)||!d.evidence.length)e.push('evidence required');return e}
function verifyDraft(d,reviewer,segments){const errors=validateDraft(d);if(!reviewer)errors.push('reviewer required');for(const x of d.evidence||[])if(!segments.some(s=>s.id===x.segment_id))errors.push('invalid evidence '+x.segment_id);if(errors.length){const z=new Error(errors.join('; '));z.code='GATE_VIOLATION';throw z}
return {id:id('EVT'),draft_event_id:d.id,event_type:d.event_type,domain:d.domain,subject:d.subject,description:d.description||null,status:'OPEN',human_verified:true,verified_by:reviewer,verified_at:new Date().toISOString(),evidence:d.evidence,ai_original:d.ai_original||d,human_revision:d.human_revision||null}}
function extractRules(meeting,segments){const out=[];for(const s of segments){const t=s.text;
const ev=(type,domain,subject,extra={})=>out.push({id:id('DRF'),meeting_id:meeting.id,event_type:type,domain,subject,description:t,evidence:[{segment_id:s.id,start_ms:s.start_ms,end_ms:s.end_ms,speaker:s.speaker,quote:t}],confidence:.8,needs_review:true,...extra});
let m=t.match(/完成\s*(\d+)\s*樘.*(?:剩|還有)\s*(\d+)\s*樘/);if(m)ev('PROGRESS','CONSTRUCTION',`防火門完成 ${m[1]} 樘，未完成 ${m[2]} 樘`,{quantity:{value:+m[1],unit:'樘'}});
m=t.match(/五金.*?(\d+)\s*組.*?(?:沒到|未到)/);if(m)ev('ISSUE','PROCUREMENT',`防火門五金 ${m[1]} 組未到貨`,{quantity:{value:+m[1],unit:'組'}});
if(/下週三.*(?:補齊|到)/.test(t))ev('COMMITMENT','PROCUREMENT','下週三補齊',{relative_due_text:'下週三',resolved_due_date:null,date_resolution_base:meeting.date});
if(/採購.*明天.*確認/.test(t))ev('ACTION','PROCUREMENT','採購確認交期',{owner_text:'採購',relative_due_text:'明天',resolved_due_date:null,date_resolution_base:meeting.date});
if(/影響.*裝修/.test(t))ev('RISK','SCHEDULE','交期延誤可能影響裝修',{risk:{condition:'交期持續延誤',impact:'影響裝修'}});
if(!out.length)ev('INFORMATION','GENERAL',t);
}return out}
module.exports={validateDraft,verifyDraft,extractRules};