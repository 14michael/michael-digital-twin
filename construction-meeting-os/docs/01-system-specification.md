# 01 System Specification

## Objective
Turn construction meetings into a traceable closed loop: Meeting → Evidence → AI Draft → Human Review → Official Event → Follow-up → Next Meeting.

## In scope
Project/meeting management; participants; LINE LIFF invitation; calendar links; meeting bot adapter; transcript and timestamped segments; AI structured extraction; human verification; official minutes; decisions/actions/risks/issues/changes; attachments; notifications; dashboard; audit log; carry-forward of open items.

## Out of scope
ERP posting, payment approval, award decision, formal contract-change approval, statutory quality/safety record replacement, autonomous approval.

## Roles
SYSTEM_ADMIN, PROJECT_ADMIN, MEETING_OWNER, REVIEWER, PARTICIPANT, VIEWER. AI has no REVIEWER authority.

## Core entities
Project, Meeting, Participant, Transcript, TranscriptSegment, DraftEvent, Event, EventEvidence, ActionItem, Decision, Risk, Change, Attachment, Notification, ActivityLog, AIProcessingLog.

## Traceability
project_id → meeting_id → transcript_id → segment_id → draft_event_id → event_id.

## Success criteria
A real transcript can yield N draft events; reviewer can inspect timestamped evidence, edit/reject/verify; only verified records become official; responsibility/due/status can be tracked; unresolved items are carried into the next meeting.

## Mandatory invariants
1. Raw transcript evidence is append-only/immutable after capture.
2. AI Draft and Official Event are separate records.
3. `human_verified=false` blocks official publication and overdue notification.
4. Official events require at least one evidence link.
5. AI original output and human revision are both retained.
6. Relative dates preserve original text, meeting-date anchor and resolved date.
