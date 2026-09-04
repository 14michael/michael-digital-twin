# Michael Executive Studio — Agent Delivery Rules

## Mission
將 Michael Executive Studio 從 DEV 原型推進到可驗收的 Release Candidate。所有 AI 產出視為 Candidate，必須經過驗收與回歸測試後才能合併到 `main`。

## Branch Policy
- `main`：目前公開版本，只接受通過 RC Gate 的內容。
- `rc1`：施工、自測、回歸測試分支。
- 禁止直接在 `main` 進行未驗證修改。

## Non-Negotiable Rules
- 不得把 DEV 版當成完成品交使用者驗收。
- 不得以「看起來有改」作為完成判定。
- 不得在未完成 Regression Test 前宣稱 Release Candidate。
- 不得以程序化方塊家具假稱為擬真家具。
- 不得在修改單一功能時破壞既有互動、手機版或導航。
- 不得公開手機、住址、推薦人電話等個資。
- 未取得真實作品圖片授權前，不以假照片冒充實績。

## RC Gates
### RC-01 Visual
- Warm Executive Engineering Studio 方向成立。
- 主管桌、主管椅、桌燈、植栽、低櫃、地毯具可信材質與比例。
- 核心家具不得有積木／白模感。

### RC-02 Content
- About / Career / Projects / Portfolio / AI Lab / Education 內容完整。
- 履歷事實需一致，推估效益不得寫成已實現成果。

### RC-03 Interaction
- GSAP 鏡頭導航正常。
- Hotspot 點擊正常。
- Overview reset 正常。
- 日夜切換正常。

### RC-04 Mobile
- iPhone / Android 寬度下 UI 可操作。
- 面板可開關。
- 觸控與拖曳不互相衝突。

### RC-05 Performance
- GLB / texture 經壓縮後才允許上線。
- Pixel ratio 設上限。
- 不得因單一資產造成明顯卡頓或 WebGL 異常。

### RC-06 Privacy
- 公開版不顯示手機、完整住址、推薦人聯絡資料。

### RC-07 Deploy
- GitHub Pages 實際部署成功後才可交付。

### RC-08 Regression
完整重跑：
`overview → About → Career → Projects → Portfolio → AI Lab → Education → overview`

## Acceptance Evidence
每個 Gate 必須留下：
- PASS / FAIL
- 測試日期
- 測試裝置或瀏覽器
- 證據（截圖、commit、console 狀態或實際 URL）
- 未通過項目與修正結果

## Release Rule
只有 RC-01～RC-08 全部 PASS，才能標示：

`Michael Executive Studio — RC1`

並合併至 `main`。
