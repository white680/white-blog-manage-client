<!-- 文章管理页：组合分组筛选、文章列表和标签侧栏。 -->
<template>
  <yk-space dir="vertical" class="artcle" size="l">
    <TopTitle name="博客文章" :isSearch="true" style="margin-bottom: 8px" @search="searchKey">
      <!-- 文章列表入口与总览卡片的加号均可打开新建页 -->
      <template #custom>
        <yk-button @click="router.push('/editarticle')">新建文章</yk-button>
      </template>
    </TopTitle>
    <SubSet @nowSubset="onSubsetChange" :classify="0"/>
    <yk-space class="artcle__main">
      <div class="artcle__main__contain">
        <ArticleView :subset-id="currentSubsetId" :state="currentState" :serchTerm="serchTerm" style="width: 100%" />
      </div>
      <div class="artcle__main__hub"><Label /></div>
    </yk-space>
  </yk-space>
</template>

<script setup lang="ts">
import TopTitle from "../components/bar/TopTitle.vue";
import Label from "../components/artcle/label/index.vue";
import SubSet from "../components/subset/index.vue";
import ArticleView from "../components/artcle/index.vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { ref } from "vue";



const currentSubsetId = ref(-1); // -1 表示全部文章
const currentState = ref(-1);

const onSubsetChange = ({ id, type }: { id: number | string; type: string }) => {
  currentSubsetId.value = -1;
  currentState.value = -1;

  if (type === "subset") currentSubsetId.value = Number(id);
  if (type === "excludedSubset") currentSubsetId.value = -2;
  if (type === "state") {
    currentState.value = Number(id) === 0 ? 1 : 0;
  }
};

const serchTerm = ref("");
// 获取搜索关键词
const searchKey = (e: string) => {
  serchTerm.value = e;
}


</script>

<style scoped lang="less">
.artcle {
  width: 100%;

  &__main {
    width: 100%;

    &__contain {
      flex: 1;
      min-width: 0;
    }

    &__hub {
      flex: none;
      width: 280px;
    }
  }
}
</style>
