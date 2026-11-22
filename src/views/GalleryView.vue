<!-- 图库管理页：组合分组筛选与图库列表。 -->
<template>
  <yk-space dir="vertical" class="artcle" size="l">
    <TopTitle name="摄影图库" :isSearch="true" style="margin-bottom: 8px" @search="searchGallery">
      <template #custom>
        <yk-button @click="router.push('/editgallery')">新增图库</yk-button>
      </template>
    </TopTitle>
    <SubSet :classify="1" @nowSubset="changeSubset" />
    <Gallery :subset-id="subsetId" :state="state" :serch-term="searchTerm" />
  </yk-space>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import TopTitle from "../components/bar/TopTitle.vue";
import SubSet from '../components/subset/index.vue';
import Gallery from '../components/gallery/index.vue'

const router = useRouter();

const subsetId = ref(-1);
const state = ref(-1);
const searchTerm = ref("");

// 接收分组栏的选择，转换为列表接口的分组或发布状态参数。
const changeSubset = ({ id, type }: { id: number | string; type: string }) => {
  subsetId.value = type === "subset" ? Number(id) : type === "excludedSubset" ? -2 : -1;
  state.value = type === "state" ? (Number(id) === 0 ? 1 : 0) : -1;
};

// 搜索框提交或取消时更新关键词，列表组件负责重新请求第一页。
const searchGallery = (value: string) => { searchTerm.value = value ?? ""; };
</script>

<style scoped lang="less">
.artcle {
  width: 100%;
  &__main {
    width: 100%;
    &__contain {
        background-color: #EEE;
        height: 12px;
        width: 100%;
    }
    &__hub {
        flex:none;
        width: 280px;
    }
  }
}
</style>
