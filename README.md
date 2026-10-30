# MindTrace-Agent

**学生入口（Local）**：启动后打开 `http://localhost:5173/`。**演示入口（Hosted）**：Not deployed。**GitHub URL**：[https://github.com/afountain/MindTrace-Agent](https://github.com/afountain/MindTrace-Agent)。**API接口**：无独立后端；本地 adapter 位于 `frontend/src/adapters/learning.ts`。

## 三分钟启动

```bash
npm --prefix frontend install
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

浏览器打开 `http://localhost:5173/`；另一个终端运行 `npm --prefix frontend run build` 和 `npm --prefix frontend test`。端口占用时 Vite `strictPort` 报错。刷新 `/` 仍可访问。三库可同时运行。

## 当前状态

- 默认页面：Learning Agent Lab。
- 已实现：A/B 演示学生回答、差异化规则反馈、教师本地记录。
- DEMO / SAMPLE：所有输入与展示数据均为本地演示，不调用原 ProjectMind 或生产服务。
- 待接入：真实专业算法、经许可的数据与独立部署。当前没有在线 Demo URL。

## 学生任务

从 `frontend/src/adapters/learning.ts` 开始。第一任务：为错因分类设计可测试规则和证据字段，不自动给学生评级。 详见 `docs/STUDENT_START_HERE.md` 和 `docs/ROADMAP_7_DAYS.md`。
