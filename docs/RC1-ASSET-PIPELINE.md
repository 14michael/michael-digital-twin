# RC1 Real Asset Pipeline

## Objective
RC1 不再以程序化方塊家具假裝擬真。核心家具逐步改為可追溯來源的真實 3D 資產，Three.js 只負責載入、材質調整、比例定位、互動與效能控制。

## Current real assets

| Role | Asset | Source | Web path | Current state |
|---|---|---|---|---|
| Executive chair | `modern_arm_chair_01` | Poly Haven CC0 source / Igrium polyhaven-models mirror | `Assets/models/furniture/modern_arm_chair_01.fbx` | Loader implemented; runtime integration pending |
| Interior plant | `potted_plant_04` | Poly Haven CC0 source / Igrium polyhaven-models mirror | `Assets/models/props_garden/potted_plant_04.fbx` | Loader implemented; runtime integration pending |

## Implementation
`src/real-assets.js` provides:

- `loadExecutiveChair(scene)`
- `loadPottedPlant(scene)`
- `loadRC1RealAssets(scene, onProgress)`
- shadow setup
- material remapping
- position / scale / rotation defaults
- load failure reporting

## Quality rules
1. 高模物件不可直接拿來做 raycast；互動仍使用低模 invisible hit box。
2. 真實資產載入失敗時只能顯示明確 fallback 狀態，不可把簡化方塊當成已完成擬真成果。
3. 正式 Release 前要把遠端 FBX 轉成本專案壓縮後的 GLB，並完成 texture / draw call / triangle 檢查。
4. 資產來源、授權與轉換紀錄必須保留。
5. `main` 不接受未通過 RC Gate 的資產版本。

## Next integration gate

- 把 `src/real-assets.js` 接入 `rc1/index.html`
- 椅子與植栽載入後移除目前對應的程序化替代物
- 檢查比例、落地高度、材質與陰影
- 再處理主管桌與桌燈正式資產
- 完成後才更新 AT-03 / AT-06 為 PASS Candidate
