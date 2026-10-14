<template>
  <head-bar/>
  <router-view></router-view>
</template>

<script setup lang="ts">
import HeadBar  from './components/bar/HeadBar.vue';
</script>

<style scoped lang="less">
@color: #00aaee;
.main {
  color: @scolor;
}
</style>
