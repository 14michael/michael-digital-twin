# 02 Data Dictionary

| Entity | Key fields | Rules |
|---|---|---|
| projects | id, code, name, status | code unique |
| meetings | id, project_id, title, starts_at, status, owner_id | project required |
| participants | id, display_name, organization, role | no AI-invented identity |
| transcripts | id, meeting_id, provider, raw_uri, sha256, captured_at | immutable evidence |
| transcript_segments | id, transcript_id, start_ms, end_ms, speaker, text | source text immutable |
| draft_events | id, meeting_id, event_type, domain, subject, attributes_json, ai_original_json, needs_review | never official |
| events | id, meeting_id, event_type, domain, subject, status, human_verified, verified_by, verified_at | verified required |
| event_evidence | event_id, segment_id, evidence_text | N:M relationship |
| action_items | id, event_id, owner_text, due_date, relative_due_text, status | due date may be null |
| decisions | id, event_id, decision_text | must cite evidence |
| risks | id, event_id, condition_text, impact_text | probability is optional assistive signal |
| changes | id, event_id, change_text, approval_status | AI cannot approve |
| activity_logs | id, actor_type, actor_id, entity_type, entity_id, action, before_json, after_json, at | append-only |
| ai_processing_logs | id, meeting_id, model, prompt_version, input_hash, output_json, at | reproducibility |
| attachments | id, meeting_id, event_id, file_name, uri, sha256 | evidence hash |
| notifications | id, event_id, channel, recipient, status, sent_at | verified events only |

## Enumerations
event_type: FACT, PROGRESS, DECISION, ACTION, COMMITMENT, ISSUE, RISK, CHANGE, WORK_STOPPAGE, INFORMATION, UNKNOWN.

domain: GENERAL, PROCUREMENT, CONTRACT, COST, SCHEDULE, DESIGN, QUALITY, SAFETY, CONSTRUCTION.

Meeting states and event states are defined in 04-state-machine.md.
