# Michael Executive Studio — RC1 Acceptance Checklist

> Rule: AI 產出只算 Candidate。所有項目 PASS 後才可 Release。

| ID | 驗收項目 | PASS 條件 | 狀態 |
|---|---|---|---|
| AT-01 | 首頁載入 | Desktop / Mobile 可正常載入，無致命 console error | PASS |
| AT-02 | 視覺方向 | 暖色主管工作室成立，非白模／積木感 | TODO |
| AT-03 | 主管椅 | 比例、曲面、材質可信，不可用簡化方塊冒充擬真 | TODO |
| AT-04 | 主管桌 | 桌體、厚度、材質與桌面物件比例自然 | TODO |
| AT-05 | 桌燈 | 金屬材質、結構與光源效果可信 | TODO |
| AT-06 | 植栽 | 葉片與盆器具可信體積，不可用簡化幾何拼湊 | TODO |
| AT-07 | Career | 左牆內容清楚可讀，鏡頭可到位 | TODO |
| AT-08 | Projects | 背牆內容清楚，代表工程與管理方法正確 | TODO |
| AT-09 | Portfolio | 右牆不得只是色塊；正式版需接真實授權成果 | TODO |
| AT-10 | AI Lab | AI 區域可辨識且可互動 | TODO |
| AT-11 | Education | 學歷與證照內容正確、可讀 | TODO |
| AT-12 | Navigation | About/Career/Projects/Portfolio/AI Lab/Education 全部可反覆切換 | PASS |
| AT-13 | Overview Reset | 任一區域可回全景，回全景後互動仍正常 | PASS |
| AT-14 | Theme | 日／夜模式可反覆切換，不破壞其他功能 | PASS |
| AT-15 | Hotspot | 場景點擊區正確，不需精準點擊高模物件 | TODO |
| AT-16 | Regression | 完整循環 overview→About→Career→Projects→Portfolio→AI Lab→Education→overview 全 PASS | PASS |
| AT-17 | Mobile UI | 390px 級手機寬度可操作，導覽與資訊面板不互相遮擋 | PASS |
| AT-18 | Touch | 拖曳、點擊與面板操作不互相衝突 | PASS |
| AT-19 | Performance | 高解析度裝置有 DPR 上限；核心資產已壓縮 | PASS |
| AT-20 | Privacy | 不公開手機、完整住址、推薦人聯絡資料 | TODO |
| AT-21 | Resume Accuracy | 經歷、學歷、證照、專案名稱與年份符合履歷來源 | TODO |
| AT-22 | Claim Accuracy | 預估效益清楚標示為預估，不寫成已實現成果 | TODO |
| AT-23 | Deploy | GitHub Pages 使用 RC 合併後版本且可公開訪問 | TODO |
| AT-24 | Desktop Smoke | Chrome 桌機實測 PASS | PASS |
| AT-25 | Mobile Smoke | iPhone/Android 尺寸模擬或實機 smoke test PASS | PASS |

## Acceptance Evidence

### 2026-09-05 — GitHub Actions RC1 Gates Run #8

- Commit: `c35a284e7329049784f1e1b7d5c41ad7421db21c`
- Browser: Playwright Chromium / GitHub Actions `ubuntu-latest`
- Desktop viewport: `1440 × 900`, DPR 1
- Mobile viewport: `390 × 844`, DPR 2, `hasTouch: true`, `isMobile: true`
- Result: **Desktop and 390px browser smoke PASS**
- Covered acceptance items: AT-01, AT-12, AT-13, AT-14, AT-16, AT-17, AT-24, AT-25
- Regression route exercised: `overview → About → Career → Projects → Portfolio → AI Lab → Education → overview`
- Additional assertions: canvas renderer ready, all navigation buttons active when selected, panel opens/closes, theme round-trip returns to original state, mobile nav/panel do not overflow viewport, no fatal `console.error` / `pageerror`.
- Evidence URL: https://github.com/14michael/michael-digital-twin/actions/runs/33931982658

### 2026-09-05 — GitHub Actions RC1 Gates Run #17

- Commit: `691f22186d899cf2d27390f803d5606ca6c65f9d`
- Result: **Static contract and syntax PASS; Desktop and 390px browser smoke PASS**
- Browser smoke revalidated local real-asset loading, full navigation regression, theme round-trip, panel close, mobile viewport constraints, and no fatal `console.error` / `pageerror`.
- Headless FPS remains diagnostic only because GitHub shared runners throttle `requestAnimationFrame`; no unsupported numeric CI FPS acceptance threshold is used.
- Evidence URL: https://github.com/14michael/michael-digital-twin/actions/runs/33941010307

### 2026-09-05 — GitHub Actions RC1 Gates Run #27 / AT-18

- Commit: `82ce4578565efcd5c3d74c5aab7727d10a6175b5`
- Browser: Playwright Chromium / GitHub Actions `ubuntu-latest`
- Mobile viewport: `390 × 844`, mobile/touch emulation enabled.
- Result: **Static contract and syntax PASS; Desktop/390px browser smoke PASS; native mobile touch/panel regression PASS.**
- Touch test uses Chrome DevTools Protocol `Input.dispatchTouchEvent` to exercise a real browser touch stream instead of synthetic pointer events.
- Verified sequence: canvas touch drag does not spuriously open the information panel; subsequent navigation remains operable; panel can be opened/closed; no fatal `console.error` / `pageerror` is introduced.
- Covered acceptance item: AT-18.
- Evidence URL: https://github.com/14michael/michael-digital-twin/actions/runs/33954417025

### 2026-09-05 — RC1 Vendor Assets Run #3 / AT-19

- Source commit: `7ba827c15a96b7bcc93ce717e50e8d87f73f6de5`
- Generated asset commit: `ee59c5ec3d8a66bfcddb0a084e1ae091b138238e`
- Result: **Vendor and quantization pipeline PASS**
- Tool: `@gltf-transform/cli@4.2.1`
- Geometry optimization: `KHR_mesh_quantization` on all five core authored GLBs.
- Verified outputs: executive chair `172,612` bytes; executive desk `153,180` bytes; desk lamp `779,624` bytes; low cabinet `791,788` bytes; potted plant `175,128` bytes.
- Manifest byte counts are checked against the generated GLBs; each GLB JSON chunk must declare `KHR_mesh_quantization`.
- DPR cap remains enforced by the static contract (`1.55` desktop / `1.2` mobile ceiling).
- Evidence URL: https://github.com/14michael/michael-digital-twin/actions/runs/33943791280

### Remaining release work

AT-18 is now PASS because the native browser touch stream, drag behavior, navigation continuity, panel open/close behavior, and zero-fatal-console condition all passed in RC1 Gates Run #27. AT-19 remains PASS because the local core GLBs have explicit, reproducible geometry quantization evidence and the renderer DPR cap is enforced. RC1 is still **not releasable** until the remaining visual UAT, hotspot behavior, privacy/content accuracy, and deployment items are independently evidenced and marked PASS.

## Release Gate

只有 AT-01～AT-25 全部 PASS，才可將版本標示為：

**Michael Executive Studio — RC1**

並合併至 `main`。
