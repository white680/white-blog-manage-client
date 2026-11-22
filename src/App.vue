<!-- 应用根组件：顶部导航保持常驻，页面内容由路由出口渲染。 -->
<template>
  <div class="app-shell" :class="{ 'app-shell--login': route.meta.hideHeader }">
    <head-bar v-if="!route.meta.hideHeader" />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import HeadBar from "./components/bar/HeadBar.vue";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style scoped lang="less">
@color: #00aaee;
.main {
  color: @scolor;
}
.app-shell {
  padding-top: 64px;
}
.app-shell--login {
  padding-top: 0;
}
</style>
