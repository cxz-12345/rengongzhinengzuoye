# Architecture

Vue 3 + Vite 单页项目；`shell/WorkspaceShell.vue` 仅管理顶部状态、主舞台、侧栏及步骤导航。`features/` 放专业可视化，`adapters/` 放可替换的领域契约，`sample-data/` 放离线样例。项目不请求原 ProjectMind 域名、API、登录或发布 Session。端口固定 5173，`strictPort: true`。
