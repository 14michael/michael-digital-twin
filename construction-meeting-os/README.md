# Construction Meeting OS V1.0

營造工程會議 AI 紀錄 × 決議 × 待辦 × 風險追蹤系統。

## Development gates
01 System Specification → 02 Data Dictionary → 03 ERD → 04 State Machine → 05 AI Extraction Schema → 06 Gate Rules → 07 API Contract → 08 UI Wireframe → 09 Prototype → 10 Golden Dataset → 11 UAT → 12 Evidence Audit.

## Non-negotiable controls
- Raw evidence is immutable.
- AI output is always a draft.
- `human_verified=false` cannot become an official event.
- Every official event must trace to evidence.
- One transcript segment may create multiple draft events.
- One event may reference multiple transcript segments.

Status: active development on `feature/construction-meeting-os-v1`.
