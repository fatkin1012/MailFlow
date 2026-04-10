# MailFlow — Outlook 郵件到 Kanban（開發版）

簡介
--
MailFlow 是一個開發用的看板（Kanban）應用，能將 Outlook 郵件匯入為看板卡片，方便以看板方式管理郵件與任務。前端採用 Vite + React + TypeScript + Tailwind，郵件與驗證邏輯封裝在 `src/sdk`（`AuthService.ts`、`MailService.ts`、`types.ts`）。

主要功能
--
- 從 Outlook 同步郵件（標題、寄件者、內文預覽、收到時間）
- 將郵件轉為看板卡片，支援拖曳排序
- 使用 MSAL 登入並透過 Microsoft Graph 讀取郵件
- 開發友善：Vite 開發伺服器、TypeScript、Tailwind

技術棧
--
- 前端：React, TypeScript, Vite, Tailwind CSS
- 認證：@azure/msal-browser（MSAL）
- API：@microsoft/microsoft-graph-client（Microsoft Graph）

快速開始（開發）
--
需求
- Node.js (建議 v18+)
- npm
- 已註冊的 Azure AD 應用（Application / client ID）或可使用自己的開發租戶

安裝相依套件

Windows (PowerShell):
```powershell
npm.cmd install
```

macOS / Linux:
```bash
npm install
```

啟動開發伺服器

Windows (PowerShell):
```powershell
npm.cmd run dev
```

macOS / Linux:
```bash
npm run dev
```

建置與預覽
```bash
npm run build
npm run preview
```

Azure AD 設定（必須）
--
1. 在 Azure 入口網站（https://portal.azure.com）
2. 前往 **Azure Active Directory → App registrations**
3. 新增或選取你要使用的應用：
   - Redirect URI（平台：Single-page application）：`http://localhost:5173`
   - 支援的帳戶類型：視需求選擇（通常為「此組織目錄中的帳戶」）
4. 在 API permissions 加上委派權限（Delegated permissions）：
   - `openid`, `profile`, `offline_access`
   - `User.Read`
   - `Mail.Read`（如需寄信或讀寫則加上 `Mail.Send` / `Mail.ReadWrite`）
5. 如租戶需要，請管理員替整個租戶授予 admin consent。

將 client ID 放入專案
--
在 `src/sdk/AuthService.ts` 中，將 `REPLACE_WITH_YOUR_CLIENT_ID` 換成 Azure 提供的 Application (client) ID；並確認 Redirect URI 與註冊時一致（例如 `http://localhost:5173`）。

提示：若要使用環境變數，可建立 `.env` 並設定 `VITE_AAD_CLIENT_ID` 及 `VITE_AAD_AUTHORITY`，再把 `AuthService` 改為讀取 `import.meta.env`（此專案目前預設為直接在檔案中設定，請視情況調整）。

常見問題
--
- Application not found: 通常因為 `client_id` 是預設佔位字串或應用尚未在該租戶註冊；請確認你使用的是正確的 Application (client) ID，或請管理員在對應租戶註冊應用。
- PowerShell 遇到 `npm.ps1` 被封鎖：在 PowerShell 使用 `npm.cmd` 代替 `npm`。這在公司 Windows 環境很常見。

專案結構（重點）
--
- `src/`：前端程式碼
- `src/sdk/`：AuthService（MSAL 與 token）、MailService（Graph 查詢）、types
- `src/components/kanban/`：看板元件

貢獻
--
- Fork → 建立分支 → PR。歡迎報告 issue 或提出功能建議。

授權
--
請參閱專案根目錄的 `LICENSE` 檔案。


