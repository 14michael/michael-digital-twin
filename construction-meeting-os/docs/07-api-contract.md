# 07 API Contract

Base: /api/v1

- POST /projects
- GET /projects/:id
- POST /meetings
- GET /meetings/:id
- POST /meetings/:id/transcripts
- GET /meetings/:id/transcript-segments
- POST /meetings/:id/extract
- GET /meetings/:id/draft-events
- PATCH /draft-events/:id
- POST /draft-events/:id/verify
- POST /draft-events/:id/reject
- GET /meetings/:id/events
- PATCH /events/:id/status
- GET /projects/:id/open-items
- GET /events/:id/evidence
- GET /audit/:entityType/:entityId

## Error envelope
```json
{"error":{"code":"GATE_VIOLATION","message":"Human verification required","details":{}}}
```

Verify request requires reviewer identity and evidence links. Server validates Gate Rules; client state is never trusted.
