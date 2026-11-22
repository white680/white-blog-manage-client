<!-- 侧边菜单：根据菜单配置生成路由导航项。 -->
<template>
  <yk-space dir="vertical" class="menu-bar" size="xl">
    <router-link
      :to="item.path"
      v-for="(item, index) in menuList"
      :key="index"
      class="menu-bar__nav"
    >
      <yk-space align="center" size="xl">
        <component :is="item.icon" />
        <yk-text>{{ item.name }}</yk-text>
      </yk-space>
    </router-link>
  </yk-space>
</template>

<script setup lang="ts">
import { menuList } from "../../utils/meun";
</script>

<style scoped lang="less">
.menu-bar {
  // width: 160px;
  padding: @space-l;
  position: fixed;
  top: 72px;
  left: 8px;
}
.menu-bar__nav {
  width: 160px;
  height: 40px;
  border-radius: @radius-m;
  padding: 0 @space-l;
  display: flex;
  align-items: center;
  .yk-icon {
    color: @font-color-ss;
    width: 16px;
    height: 16px;
  }
  &:hover {
    background-color: @bg-color-l;
    .yk-text{
        font-weight: 600;
    }
  }
}
.router-link-active {
    background: linear-gradient(135deg, #a855f7 0%, #6d28d9 100%);
    .yk-icon {
    color: @white;
    }
    .yk-text{
        color: @white;
    }
}
</style>
