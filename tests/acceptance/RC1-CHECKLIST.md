# Michael Executive Studio — RC1 Acceptance Checklist

> Rule: AI 產出只算 Candidate。所有項目 PASS 後才可 Release。

| ID | 驗收項目 | PASS 條件 | 狀態 |
|---|---|---|---|
| AT-01 | 首頁載入 | Desktop / Mobile 可正常載入，無致命 console error | TODO |
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
| AT-12 | Navigation | About/Career/Projects/Portfolio/AI Lab/Education 全部可反覆切換 | TODO |
| AT-13 | Overview Reset | 任一區域可回全景，回全景後互動仍正常 | TODO |
| AT-14 | Theme | 日／夜模式可反覆切換，不破壞其他功能 | TODO |
| AT-15 | Hotspot | 場景點擊區正確，不需精準點擊高模物件 | TODO |
| AT-16 | Regression | 完整循環 overview→About→Career→Projects→Portfolio→AI Lab→Education→overview 全 PASS | TODO |
| AT-17 | Mobile UI | 390px 級手機寬度可操作，導覽與資訊面板不互相遮擋 | TODO |
| AT-18 | Touch | 拖曳、點擊與面板操作不互相衝突 | TODO |
| AT-19 | Performance | 高解析度裝置有 DPR 上限；核心資產已壓縮 | TODO |
| AT-20 | Privacy | 不公開手機、完整住址、推薦人聯絡資料 | TODO |
| AT-21 | Resume Accuracy | 經歷、學歷、證照、專案名稱與年份符合履歷來源 | TODO |
| AT-22 | Claim Accuracy | 預估效益清楚標示為預估，不寫成已實現成果 | TODO |
| AT-23 | Deploy | GitHub Pages 使用 RC 合併後版本且可公開訪問 | TODO |
| AT-24 | Desktop Smoke | Chrome 桌機實測 PASS | TODO |
| AT-25 | Mobile Smoke | iPhone/Android 尺寸模擬或實機 smoke test PASS | TODO |

## Release Gate

只有 AT-01～AT-25 全部 PASS，才可將版本標示為：

**Michael Executive Studio — RC1**

並合併至 `main`。
