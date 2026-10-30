<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ project: string; eyebrow: string; subtitle: string; mode: string; steps: string[] }>()
const drawer = ref(true)
const active = ref(0)
</script>
<template>
  <div class="app-shell">
    <header class="topbar"><div class="brand-mark">◈</div><div class="brand"><small>{{ eyebrow }}</small><strong>{{ project }}</strong></div><span class="mode-tag">● {{ mode }}</span><button class="drawer-toggle" @click="drawer = !drawer" :aria-expanded="drawer" aria-controls="workspace-drawer">{{ drawer ? '收起工具' : '展开工具' }}</button></header>
    <div class="hero-line"><div><small>INDEPENDENT RESEARCH WORKSPACE / 001</small><h1>{{ subtitle }}</h1></div><span class="sample-tag">DEMO / SAMPLE</span></div>
    <div class="work-layout" :class="{ collapsed: !drawer }"><main class="main-stage"><slot /></main><aside id="workspace-drawer" v-if="drawer" class="tool-drawer"><div class="drawer-head"><small>WORKFLOW</small><button @click="drawer = false" aria-label="关闭工具区">×</button></div><h2>研发路径</h2><nav class="step-list" aria-label="任务步骤"><button v-for="(step, i) in props.steps" :key="step" :class="{ active: i === active }" @click="active = i"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ step }}</button></nav><section class="drawer-detail"><small>当前步骤 / {{ String(active + 1).padStart(2, '0') }}</small><h3>{{ props.steps[active] }}</h3><slot name="drawer" :active="active" /></section></aside></div>
    <footer class="footer">{{ project }} · 独立演示工作区 <span>本地样例 · 未连接生产服务</span></footer>
  </div>
</template>
