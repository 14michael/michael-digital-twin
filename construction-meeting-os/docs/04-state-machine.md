# 04 State Machine

## Meeting
DRAFT → SCHEDULED → RECORDING → PROCESSING → AI_DRAFT → REVIEW_PENDING → VERIFIED → CLOSED.
Exception states: CANCELLED, FAILED.

## Draft Event
AI_DRAFT → REVIEW_PENDING → VERIFIED or REJECTED.
Verification creates/updates an Official Event; AI cannot execute this transition.

## Official Event
OPEN → IN_PROGRESS → CLOSED.
OVERDUE is computed when due_date < now and status not CLOSED; it is not a manually trusted state.

## Bot
NOT_REQUESTED → SCHEDULED → JOINING → IN_CALL → PROCESSING → DONE.
Any active state may transition to FAILED with reason.

All state changes create an activity_log entry.
