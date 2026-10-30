# Migration manifest

源：`afountain/ProjectMind` 的 `origin/main`，SHA `6f765d950668c9e8d7cb3e220b76fba730b28d52`。源库仅只读检查。新项目没有继承源 `.git`。用户已授权根据各自需求选择性迁移，目标 GitHub URL 尚未提供。

| 源路径 | 目标路径 | 处理 | 依赖与原因 |
|---|---|---|---|
| `frontend/src/components/PublishedProjectSession.vue` | `frontend/src/App.vue` | 适配视觉布局与主舞台/右栏交互；新写实现 | 原组件深依赖 PBCD 发布、TTS、ModelGateway、证据与教师身份，不直接复制 |
| `frontend/src/components/immersive/ImmersiveStage.vue`、`DynamicBlockGrid.vue` | `frontend/src/shell/WorkspaceShell.vue` | 保留中央舞台与卡片语法，重写为插槽 | 原组件依赖 `block-layout.ts`、`semantic-scan.ts` 及教师发布投影 |
| `frontend/src/immersive-focus.css`、`frontend/src/design-system/research-tokens.ts` | `frontend/src/styles/shell.css` | 适配深绿视觉 token、导航层级、响应式网格 | 仅 CSS 概念；无生产选择器或全局 store |
| `frontend/src/components/immersive/HumanHelp.vue`、`ClassroomMediaGallery.vue` | 专业 `features/` 与 `adapters/` | 不复制；按项目需要重写 | 原 API/媒体授权链与课堂消息耦合 |
| `backend/app/api/stage21.py`、认证、TTS、模型网关 | 无 | 舍弃 | 不迁移生产业务和服务端地址 |

无直接复制的源代码文件；结构、布局与设计 token 经选择性适配。
