<template>
  <div class="head-bar">
    <yk-space align="center" :size="12" style="cursor:pointer;" @click="backHome">
      <img src="../../images/white-blog-icon-v2.png" alt="white的博客后台管理" class="logo" />
      <span class="name">子超兄的博客后台管理</span>
    </yk-space>
    <yk-space align="center" size="xl">
      <!-- 邮箱icon -->
      <yk-badge is-dot>
        <IconMailOutline style="font-size: 20px;" class="message" @click="changeActive(true)"/>
      </yk-badge>
      <!-- 头像 -->
      <yk-avatar :img-url="Avatar"/>
      <!-- 切换模式按钮 -->
      <!-- Codex 添加：接管主题切换，播放整页幕布动画 -->
      <button
        type="button"
        class="theme-toggle"
        :disabled="isThemeTransitioning"
        :aria-label="isDark ? '切换为浅色模式' : '切换为深色模式'"
        @click="toggleThemeWithCurtain"
      >
        <IconMoonFill v-if="isDark" />
        <IconSunFill v-else />
      </button>
      <!--  -->
      <yk-button size="l" style="--pcolor: #8a3ee8">退出</yk-button>
    </yk-space>
    <PrivateMessage  :active="active" @close="changeActive(false)"/>
  </div>
  <!-- Codex 添加：不支持 View Transition 时使用的整页幕布 -->
  <Teleport to="body">
    <div
      class="theme-curtain"
      :class="curtainPhase"
      aria-hidden="true"
      @transitionend="handleCurtainTransitionEnd"
    />
  </Teleport>
</template>

<script setup lang="ts">
// 通过 import 让 Vite 处理图片资源，拿到可用的最终 URL
import Avatar from '../../images/pic.png'
import {PrivateMessage} from '../reply/index'
import { useRouter } from 'vue-router';
// Codex 添加：主题状态与幕布动画所需依赖
import { nextTick, ref } from 'vue'
import { useDark } from '@vueuse/core'
const router = useRouter()

// 返回总览页面
const backHome=()=>{
  router.push('/')
}
// 打开或关闭私信
const active = ref<boolean>(false)
const changeActive=(e:boolean)=>{
  active.value = e
}

// Codex 添加：沿用 Yike UI 的主题属性和存储键，保留原有主题记忆
const isDark = useDark({
  attribute: 'data-theme',
  storageKey: 'YIKE_THEME',
  disableTransition: false,
})
const isThemeTransitioning = ref(false)
const curtainPhase = ref<'idle' | 'cover' | 'reveal'>('idle')

async function applyTheme() {
  isDark.value = !isDark.value
  await nextTick()
}

async function toggleThemeWithCurtain() {
  if (isThemeTransitioning.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    await applyTheme()
    return
  }

  if (!document.startViewTransition) {
    isThemeTransitioning.value = true
    curtainPhase.value = 'cover'
    return
  }

  isThemeTransitioning.value = true
  try {
    await document.startViewTransition(applyTheme).finished
  } finally {
    isThemeTransitioning.value = false
  }
}

// Codex 添加：幕布从左上角盖满后切换主题，再向右下角收起
async function handleCurtainTransitionEnd(event: TransitionEvent) {
  if (event.target !== event.currentTarget || event.propertyName !== 'clip-path') return

  if (curtainPhase.value === 'cover') {
    try {
      await applyTheme()
    } finally {
      curtainPhase.value = 'reveal'
    }
  } else if (curtainPhase.value === 'reveal') {
    curtainPhase.value = 'idle'
    isThemeTransitioning.value = false
  }
}
</script>

<style scoped lang="less">
.head-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background: @bg-color-l;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 @space-xl;
  .logo {
    height: 40px;
  }
  .name{
    font-weight: 600;
    font-size: 20px;
    font-style: normal;
  }
  .message{
    cursor: pointer;
    &:hover{
      background-color: @gray-1;
    }
  }
  // 头像：yk-avatar 是 flex 子项，默认 flex-shrink:1 会被压扁成椭圆，
  // 且组件内置 img 只有 height:100%，非正方形图片会横向溢出被裁掉
  :deep(.yk-avatar) {
    flex: none;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      float: none;
    }
  }
}

// Codex 添加：让自定义按钮保持与原主题图标相近的尺寸和颜色
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 20px;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--pcolor);
    outline-offset: 3px;
    border-radius: 4px;
  }

  :deep(.icon-moon-fill) {
    color: #ffd500;
  }

  :deep(.icon-sun-fill) {
    color: #ff9b00;
  }
}
</style>
