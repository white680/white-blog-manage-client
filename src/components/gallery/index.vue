<!-- 图库列表：按分类、搜索词和页码获取真实图库数据。 -->
<template>
  <div class="gallery">
    <div class="gallery__content">
      <div class="gallery__content__files">
        <GalleryItem
          v-for="item in articleList"
          :key="item.id"
          :data="item"
          @delete="deleteGallery"
        />
      </div>
      <p v-if="loading" class="gallery__empty">正在加载图库...</p>
      <p v-else-if="!articleList.length" class="gallery__empty">暂无图库</p>
      <div v-if="count > 0" class="Pagination">
        <yk-pagination size="m" :total="count" :default-page-size="props.pageSize"
          :current="currentPage" simple @change="changePage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance } from "vue";
import type { ArticleData } from "../../utils/interface.ts";
import GalleryItem from "./gallery-item/index.vue";
import { articleApi, deleteArticleApi } from "../../api";
import { useCode } from "../../hook/code";
import { useUserStore } from "../../store/user";

const proxy: any = getCurrentInstance()?.proxy;
const userStore = useUserStore();
const { tackleCode } = useCode();

const props = defineProps({
  pageSize: {
    type: Number,
    default: 6,
  },
  subsetId: {
    type: Number,
    default: -1,
  },
  state: {
    type: Number,
    default: -1,
  },
  serchTerm: {
    type: String,
    default: "",
  },
});
// 当前页的图库卡片数据。
const articleList = ref<ArticleData[]>([]);
// 图库总数，用于分页器。
const count = ref(0);
const currentPage = ref(1);
const loading = ref(false);
const deleting = ref(false);
let latestRequest = 0;

// 仅删除确认过的图库记录；成功后刷新列表和分页总数。
const deleteGallery = async (id: number) => {
  if (deleting.value || !tackleCode(userStore.token)) return;
  deleting.value = true;
  try {
    const res: any = await deleteArticleApi({ token: userStore.token, articleId: id, classify: 1 });
    if (res.code !== 200) {
      tackleCode(res.code);
      proxy?.$message({ type: "warning", message: "图库删除失败" });
      return;
    }
    proxy?.$message({ type: "success", message: "图库已删除" });
    // 删掉当前页最后一项时，退到前一页，避免出现空白页。
    if (articleList.value.length === 1 && currentPage.value > 1) currentPage.value--;
    await getData(true);
  } catch {
    proxy?.$message({ type: "warning", message: "图库删除失败，请检查网络" });
  } finally {
    deleting.value = false;
  }
};

// 请求 classify=1 的图库；翻页时沿用已取得的总数，筛选变化时重新统计。
const getData = async (refreshCount: boolean) => {
  if (!tackleCode(userStore.token)) return;
  const requestId = ++latestRequest;
  loading.value = true;
  articleList.value = [];
  try {
    const res: any = await articleApi({
      token: userStore.token,
      pageSize: props.pageSize,
      nowPage: currentPage.value,
      state: props.state,
      subsetId: props.subsetId,
      serchTerm: props.serchTerm.trim(),
      classify: 1,
      count: refreshCount,
    });
    if (requestId !== latestRequest) return;
    if (res.code !== 200 || !Array.isArray(res.data?.result)) {
      tackleCode(res.code);
      proxy?.$message({ type: "warning", message: "图库获取失败" });
      return;
    }
    articleList.value = res.data.result;
    if (res.data.count >= 0) count.value = Number(res.data.count);
  } catch {
    if (requestId === latestRequest) proxy?.$message({ type: "warning", message: "图库获取失败" });
  } finally {
    if (requestId === latestRequest) loading.value = false;
  }
};

// 切换页码，保留当前搜索和分组条件。
const changePage = (e: number) => {
  currentPage.value = e;
  getData(false);
};

// 首次进入和筛选条件变化时，从第一页重新获取图库及总数。
watch([() => props.subsetId, () => props.state, () => props.serchTerm, () => props.pageSize], () => {
  currentPage.value = 1;
  count.value = 0;
  getData(true);
}, { immediate: true });
</script>

<style scoped lang="less">
.gallery {
  width: 100%;
  background: @bg-color-l;
  padding: 32px 24px;
  border-radius: @radius-m;
  &__content {
    display: inline;
    width: 100%;
    &__files {
      display: grid;
      grid-template-columns: repeat(auto-fill, 238px);
      row-gap: 32px;
      column-gap: 24px;
      justify-content: center;
    }
  }
  &__empty { text-align: center; padding: @space-xl; color: @font-color-s; }
}

.Pagination {
  width: 100%;
  padding: @space-s 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // border-top: 1px solid @line-color-s;
}
</style>
