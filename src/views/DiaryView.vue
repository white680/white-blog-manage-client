<!-- 日记页：并列展示日记列表与日记编辑区。 -->
<template>
  <yk-space dir="vertical" class="diary" size="l">
    <TopTitle name="随笔随记" :isSearch="true" style="margin-bottom: 8px" @search="seaech"></TopTitle>
  </yk-space>
  <yk-space class="diary__content" size="l">
    <DiaryVue ref="diaryListRef" :serchTerm="serchTerm" />
    <DEditor style="flex:none;width:500px;" @change-diary="handleDiaryCreated" />
  </yk-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopTitle from "../components/bar/TopTitle.vue";
import DiaryVue from "../components/diary/index.vue";
import DEditor from "../components/diary/diary-editor/index.vue";

const serchTerm = ref("");

const seaech = (e: string) => {
  serchTerm.value = e
}

const diaryListRef = ref<{ changeDiary: () => void } | null>(null);
const handleDiaryCreated = () => {
  diaryListRef.value?.changeDiary();
};
</script>

<style scoped lang="less">
.diary {
  width: 100%;
}

// 覆盖 YkSpace 默认的顶部对齐，让左右两栏的外框一起伸展。
.yk-space.diary__content {
  width: 100%;
  align-items: stretch;
}
</style>
