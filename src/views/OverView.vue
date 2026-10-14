<template>
  <yk-space dir="vertical" size="xl">
    <top-title :is-search="false" />
    <gather/>
    <yk-space>
      
    </yk-space>
  </yk-space>
</template>

<script setup lang="ts">
import TopTitle from "../components/bar/TopTitle.vue";
import gather from "../components/overview/gather.vue";
</script>

<style scoped lang="less"></style>
