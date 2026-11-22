<!-- 本地文件页：将当前分组和分页配置交给文件列表组件。 -->
<template>
  <yk-space size="l" dir="vertical" class="file-view">
    <TopTitle name="本地文件" :isSearch='false'  style="margin-bottom: 8px;">
    </TopTitle>
    <SubSet :classify="2" groups-only @nowSubset="onSubsetChange" />
    <Files :key="subsetId" :subset-id="subsetId" :page-size="pageSize" />
  </yk-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopTitle from '../components/bar/TopTitle.vue';
import SubSet from '../components/subset/index.vue'
import Files from '../components/localfile/files/index.vue'

const subsetId = ref<number>(-1)
const pageSize = ref(10)
const onSubsetChange = ({ id, type }: { id: number | string; type: string }) => {
  subsetId.value = type === 'subset' ? Number(id) : -1
}
</script>

<style scoped lang="less">
.file-view{
    width: 100%;
}
</style>
