<template>
  <div class="index-view">
    <Menubar />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import Menubar from "../components/bar/MuneBar.vue";
</script>

<style scoped lang="less">
  .index-view{
    padding:32px 32px 32px 232px;
  }
</style>
