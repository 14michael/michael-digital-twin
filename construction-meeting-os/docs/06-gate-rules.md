# 06 Gate Rules

G01 Evidence required: official Event requires >=1 valid TranscriptSegment or approved attachment evidence.
G02 Human verification: `human_verified=true`, verified_by and verified_at required.
G03 No AI authority: AI cannot approve contract change, payment, award, acceptance, safety/quality statutory record, or assign formal contractual liability.
G04 No invention: unknown owner/vendor/date/amount/obligation remains null/UNKNOWN.
G05 Relative date: preserve source phrase + anchor date + resolved date; reviewer confirms.
G06 Revision retention: preserve ai_original_json and human revision/audit diff.
G07 Multi-event: one segment can create multiple draft events.
G08 Multi-evidence: one event can cite multiple segments.
G09 Notification: responsibility/overdue notifications only from verified official events.
G10 Publication: rejected/unverified drafts never appear in official minutes/dashboard KPI.
G11 Audit: verification, rejection, edits and state changes are append-only logged.
G12 Security: secrets never stored in client code; sensitive meeting links require controlled access in production.
