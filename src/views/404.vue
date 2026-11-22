<!-- 未知地址的独立错误页；返回首页由路由链接直接完成。 -->
<template>
  <main class="error-info">
    <div class="error-info__content">
      <p class="error-info__code" aria-hidden="true">404</p>
      <h1>页面不存在</h1>
      <p class="error-info__message">地址可能输入有误，请返回首页。</p>
      <router-link class="error-info__home" to="/">返回首页</router-link>
    </div>
  </main>
</template>

<style scoped lang="less">
.error-info {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: @bg-color-m;
  text-align: center;
}

.error-info__content {
  width: min(100%, 520px);
}

.error-info__code {
  margin: 0;
  color: @pcolor;
  font-size: clamp(96px, 20vw, 188px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.08em;
}

h1 {
  margin: 12px 0 0;
  color: @font-color-l;
  font-size: clamp(28px, 5vw, 36px);
}

.error-info__message {
  margin: 12px 0 32px;
  color: @font-color-m;
  font-size: 16px;
  line-height: 1.5;
}

.error-info__home {
  display: inline-flex;
  min-width: 144px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: @pcolor;
  color: #fff !important;
  font-weight: 600;
  transition: opacity 180ms ease;
}

.error-info__home:hover {
  opacity: 0.86;
}

.error-info__home:focus-visible {
  outline: 3px solid @pcolor;
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .error-info__home {
    transition: none;
  }
}
</style>
