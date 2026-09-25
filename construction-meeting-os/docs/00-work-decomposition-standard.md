# Michael Work Decomposition Standard V1.0 — Construction Meeting OS Retrofit

> No Work Model → No Workflow → No Transaction/State → No Gate/Evidence → No AI → No UI.

## A. 開工許可證（Development Permit）
任何新增功能或 UI 改造前，以下八項不得有關鍵 UNKNOWN：
1. Work 已拆清楚
2. Data Source 可識別
3. Business Rule 明確
4. State / State Change 明確
5. Exception 有正式路徑
6. Human Gate 明確
7. Evidence 可追溯
8. Golden Case 可描述

任一關鍵項 UNKNOWN → STOP / HOLD，不得用 UI、假資料或 AI 推論掩蓋。

## B. Construction Meeting OS 現實工作模型
Trigger → Input → Task → Decision → Rule → Role → State → Exception → Human Gate → Output → Evidence → Audit → Knowledge Feedback

### Trigger
會議建立／排程到時／會議開始／逐字稿可用／前次未結事項需追蹤。

### Input
Project、Meeting、Participants、Agenda、Previous Open Events、Transcript、TranscriptSegment、Attachments、Meeting Date/Time。

### Task
建立會議 → 通知/分享 → 會議紀錄 → Evidence Capture → Event Extraction → Human Review → Official Record → Action/Risk/Issue/Decision Tracking → Close/Carry Forward。

### Decision
逐字稿是否完整？AI 擷取是否有 Evidence？事件分類/責任/期限是否成立？是否可成為正式紀錄？是否結案或帶入下次會議？

### Rule
- Raw Evidence immutable.
- AI output = Draft only.
- Official Event requires valid Evidence + Reviewer + Human Verification.
- Unknown owner/date/amount/liability stays UNKNOWN/null.
- Relative date preserves source phrase + anchor + resolved value.
- Formal contractual liability/approval cannot be inferred by AI.

### Role
Requester / Meeting Owner / Participant / AI Assistant / Reviewer / Approver / Action Owner / Project Admin / Auditor。

### State
Meeting: DRAFT → SCHEDULED → RECORDING → PROCESSING → AI_DRAFT → REVIEW_PENDING → VERIFIED → CLOSED.
DraftEvent: AI_DRAFT → REVIEW_PENDING → VERIFIED | REJECTED.
OfficialEvent: OPEN → IN_PROGRESS → CLOSED; OVERDUE computed.

### Exception
每一例外必須建立正式 Exception Record：
Exception_ID + Type + Owner + Action + Due_Date + State + Evidence + Resolution。

初始類型：
TRANSCRIPT_INCOMPLETE, SPEAKER_UNKNOWN, EVIDENCE_MISSING, CONFLICTING_STATEMENT, DATE_AMBIGUOUS, OWNER_UNKNOWN, CONTRACT_LIABILITY_UNCONFIRMED, AI_EXTRACTION_FAILED, BOT_FAILED。

### Human Gate
G1 發布會議邀請（若涉及正式對外通知）
G2 AI Draft → Official Event
G3 Decision/Commitment 的正式確認
G4 Action Owner / Due Date 關鍵修正
G5 Event Close（需要完成證據者）
G6 Meeting Close / Minutes Publish

### Output
Verified Event、Official Minutes、Action List、Risk/Issue List、Decision Register、Carry-forward Agenda、Audit Record。

### Evidence
TranscriptSegment ID + timestamp + speaker + immutable text；附件 hash；AI original；Human revision；Reviewer；verified_at；state transition record。

### Audit
Who / When / What / Before / After / Reason / Evidence Reference。

### Knowledge Feedback
Closed Event、實際完成日、延誤原因、承諾履行情況、供應商履約事件、重複風險/議題 → 下一次 Meeting Agenda / Project Knowledge。

## C. 每一 Task / Decision / Gate 的六問
每個節點必須有：
- Who：Requester / Owner / Reviewer / Approver / Executor
- Data：精確到 Entity / Document / Revision / Segment ID
- Rule：獨立於 UI 的 Business Rule
- Result：產生明確結果並盡量造成 State Change
- Gate：允許 Transition 的條件
- Evidence：證明執行與判斷依據的資料

## D. 核心 Transaction 節點拆解

### T01 Capture Evidence
Who: System/Meeting Owner
Data: Meeting + transcript provider output
Rule: segment 必須有 meeting_id, transcript_id, start/end, text
Result: TranscriptSegment CREATED
Gate: evidence integrity check PASS
Evidence: raw transcript/hash/provider metadata
State Change: PROCESSING → AI_DRAFT
Exception: TRANSCRIPT_INCOMPLETE / BOT_FAILED

### T02 Extract Draft Events
Who: AI Assistant
Data: immutable TranscriptSegments + meeting context
Rule: no invention; one segment may create N drafts; each draft cites evidence
Result: DraftEvent[]
Gate: schema validation PASS
Evidence: input_hash + model/prompt version + ai_original_json
State Change: AI_DRAFT → REVIEW_PENDING
Exception: AI_EXTRACTION_FAILED / EVIDENCE_MISSING
Human authority: NONE

### T03 Review Draft Event
Who: Reviewer
Data: DraftEvent + exact Evidence + meeting context
Rule: reviewer compares extracted fields against evidence
Result: edited draft / reject / ready-to-verify
Gate: mandatory fields + evidence valid
Evidence: before/after/reason/reviewer/timestamp
State Change: REVIEW_PENDING → VERIFIED | REJECTED
Exception: DATE_AMBIGUOUS / OWNER_UNKNOWN / CONFLICTING_STATEMENT

### T04 Verify Official Event
Who: Reviewer (human only)
Data: reviewed draft + evidence
Rule: valid evidence AND reviewer AND verification timestamp
Result: Official Event
Gate: G02 Human Verification
Evidence: verification record + evidence links
State Change: no Official Event → OPEN
Exception: CONTRACT_LIABILITY_UNCONFIRMED

### T05 Execute / Follow-up
Who: Action Owner
Data: Official Event + due date + linked project context
Rule: only verified events generate official follow-up
Result: status update / completion evidence
Gate: close-required evidence present
Evidence: completion record/attachment/comment
State Change: OPEN → IN_PROGRESS → CLOSED
Exception: overdue / blocked / reassigned

### T06 Carry Forward
Who: Meeting Owner / Reviewer
Data: prior OPEN/IN_PROGRESS/OVERDUE verified events
Rule: AI may suggest; human decides agenda inclusion
Result: next meeting agenda references prior event_id
Gate: meeting owner confirmation
Evidence: carry-forward link + reason
State Change: prior event unchanged; new agenda item CREATED

## E. Functional Baseline
目前 V1 Prototype 只可宣稱：
- Evidence capture demo
- 1 Segment → N DraftEvents
- Draft vs Official separation
- Human verification gate
- Evidence backlink
- Basic audit fields

不得宣稱 Production Ready：
- LINE/LIFF live integration
- Recall.ai live recording
- enterprise RBAC/auth
- persistent production DB
- full Exception engine
- full audit trail
- production retention/security controls

## F. UI Retrofit Rule
UI 只能呈現既有 Transaction / State / Gate / Evidence。
每個主要按鈕必須對應：
Action → API/Transaction → Before State → Rule/Gate → After State → Evidence/Audit。
無 State Change、無 Evidence、無 Transaction 的按鈕不得列為「功能完成」。

## G. Golden Case
防火門案例：
SEG-001 → PROGRESS + ISSUE + COMMITMENT + ACTION + RISK Drafts。
只有 Reviewer 對照 SEG-001 後，個別 Draft 才可 VERIFIED。
未知/模糊欄位不得自動補值。
Verified ACTION 才能進 Follow-up。
未結事項可由 Meeting Owner 確認後帶入下一次會議。

## H. 後續施工順序
Work Decomposition → Workflow Model → Functional Baseline → Transaction/State → Evidence/Gate → Golden UAT → Automation/AI → UI.

目前 Operational UI 視為可保留的 Prototype Asset，但不得反向定義 Workflow。
