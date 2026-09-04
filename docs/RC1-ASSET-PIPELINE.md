# RC1 Real Asset Pipeline

## Objective
RC1 不再以程序化方塊家具假裝擬真。核心家具逐步改為可追溯來源的真實 3D 資產，Three.js 只負責載入、材質調整、比例定位、互動與效能控制。

## Current real assets

| Role | Asset | Source | Web path | Current state |
|---|---|---|---|---|
| Executive chair | `modern_arm_chair_01` | Poly Haven CC0 source / Igrium polyhaven-models mirror | `Assets/models/furniture/modern_arm_chair_01.fbx` | Integrated in `app.html`; auto-normalized to 1.22 m target height; visual UAT pending |
| Interior plant | `potted_plant_04` | Poly Haven CC0 source / Igrium polyhaven-models mirror | `Assets/models/props_garden/potted_plant_04.fbx` | Integrated in `app.html`; auto-normalized to 1.55 m target height; visual UAT pending |

## Implementation
`src/real-assets.js` currently provides:

- `loadExecutiveChair(scene)`
- `loadPottedPlant(scene)`
- `loadRC1RealAssets(scene, onProgress)`
- asset-source and license metadata in `userData.asset`
- automatic bounding-box validation
- automatic target-height normalization
- floor rebasing so imported meshes do not float or sink because of source pivots
- shadow setup
- role-based material remapping
- parallel loading so one slow asset does not block the other
- 15-second default load timeout and explicit load failure reporting

## Quality rules
1. 高模物件不可直接拿來做 raycast；互動仍使用低模 invisible hit box。
2. 真實資產載入失敗時只能顯示明確 fallback 狀態，不可把簡化方塊當成已完成擬真成果。
3. 正式 Release 前要把遠端 FBX 轉成本專案壓縮後的 GLB，並完成 texture / draw call / triangle 檢查。
4. 資產來源、授權與轉換紀錄必須保留。
5. `main` 不接受未通過 RC Gate 的資產版本。
6. 尺度不得只依來源模型的原始單位猜測；需以 bounding box 正規化到指定實體高度，再進行視覺 UAT。

## Current gate status

- 椅子與植栽：已完成程式整合與尺度正規化，尚未完成瀏覽器視覺 UAT，因此 AT-03 / AT-06 不標示 PASS。
- 主管桌：仍為程序化幾何，AT-04 未通過。
- 桌燈：仍為程序化幾何，AT-05 未通過。
- 真實資產目前仍由遠端 FBX 載入，RC-05 Performance 尚未通過；正式 Release 前必須轉為專案內壓縮 GLB。

## Next integration gate

- 瀏覽器檢查椅子與植栽比例、落地高度、材質與陰影
- 尋找並接入可追溯來源的主管桌與桌燈資產
- 完成日／夜切換與拖曳／觸控環視，解除 AT-14 / AT-18 阻塞
- 將已確認資產轉為本專案 GLB，避免 Release 依賴遠端 FBX
- 完成後才更新 AT-03 / AT-06 為 PASS Candidate
