<!-- 文章列表：从接口数据中取当前页，并同步删除和发布状态。 -->
<template>
  <yk-space dir="vertical" style="width: 100%">
    <SearchEmpty v-if="showSearchEmpty" :keyword="props.serchTerm.trim()" />
    <template v-else>
      <ArticleItem v-for="item in articleList" :key="item.id" :data="item" @delete="deleteArticle(item.id)"
        @state="updateState($event.id, $event.state)" />
      <div v-if="count > 0" class="Pagination">
        <yk-pagination size="m" :total="count" :default-page-size="props.pageSize" simple @change="changePage"
          :current="currentPage" />
      </div>
    </template>
  </yk-space>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from "vue";
import type { ArticleData } from "../../utils/interface.ts";
import ArticleItem from "./article-item/index.vue";
import SearchEmpty from "./SearchEmpty.vue";
import { articleApi, changeArticleStateApi, deleteArticleApi } from "../../api";
import { useCode } from "../../hook/code";
import { useUserStore } from "../../store/user.ts";

const userStore = useUserStore();

// code验证
const { tackleCode } = useCode();
const proxy: any = getCurrentInstance()?.proxy;

const props = defineProps({
  pageSize: {
    type: Number,
    default: 4,
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
type artcle = {
  token?: string;
  pageSize: number; //单页条数；
  nowPage: number; //当前页
  state?: number; //状态
  subsetId?: number; //分组
  serchTerm?: string | number; //搜索词条
  count?: boolean;
  classify?: number;
};

const request: artcle = {
  token: userStore.token,
  pageSize: props.pageSize, //单页条数；
  nowPage: 1, //当前页
  state: props.state, //状态
  subsetId: props.subsetId, //分组
  serchTerm: props.serchTerm, //搜索词条
  classify: 0,
  count: true,
};
// 获取文章
// 文章
const articleList = ref<ArticleData[]>([]);
// 文章总数
const count = ref<number>(0);

const currentPage = ref(1);  //当前页
// 仅在当前关键词的请求成功后显示空结果，避免请求中误显示。
const loadedSearchTerm = ref<string | null>(null);
let latestRequest = 0;
const showSearchEmpty = computed(() => {
  const keyword = props.serchTerm.trim();
  return !!keyword && loadedSearchTerm.value === keyword && count.value === 0 && articleList.value.length === 0;
});
// 获取文章数据
// e 为 true 表示同时刷新文章总数，翻页时传 false 以减少不必要的统计查询
const getData = async (e: boolean) => {
  // 让接口决定本次是否返回 count（文章总数）
  request.count = e;
  // 先清空已加载的搜索词，请求成功后再写入，避免请求期间误显示"无结果"
  loadedSearchTerm.value = null;
  // 请求序号自增，用于丢弃过期响应（后发请求优先）
  const currentRequest = ++latestRequest;
  // 拷贝一份参数快照，防止请求过程中 request 被翻页等操作修改
  const params = { ...request };
  try {
    const res: any = await articleApi(params);
    // 只处理最后一次发起的请求，避免竞态下旧数据覆盖新数据
    if (currentRequest !== latestRequest) return;
    // 统一处理登录失效等业务状态码（如跳转登录），返回 false 表示无需继续
    if (!tackleCode(res.code)) return;
    // 业务成功且返回列表数组，否则提示失败并终止
    if (res.code !== 200 || !Array.isArray(res.data?.result)) {
      proxy.$message({ type: "warning", message: res.msg ?? "文章获取失败" });
      return;
    }
    // 把后端字段适配成组件使用的结构：subset_id -> subsetId，label 兜底为空数组
    articleList.value = res.data.result.map((item: any) => ({
      ...item,
      subsetId: item.subset_id,
      label: item.label ?? [],
    }));
    // 仅当接口返回了有效总数时更新，避免翻页请求把总数覆盖成 0
    if (res.data.count >= 0) count.value = res.data.count;
    // 记录本次成功加载所用的搜索词，供"无结果"提示判断
    loadedSearchTerm.value = String(params.serchTerm ?? "").trim();
  } catch (error) {
    // 仅记录最后一次请求的错误，忽略已被取代的请求异常
    if (currentRequest === latestRequest) console.error("获取文章失败", error);
  }
};

// 根据文章 id 删除文章，再刷新当前列表和总数。
const deleteArticle = async (e: number) => {
  try {
    const res: any = await deleteArticleApi({ articleId: e });
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) {
      proxy.$message({ type: "warning", message: res.msg ?? "删除失败" });
      return;
    }
    proxy.$message({ type: "success", message: "删除成功" });
    getData(true);
  } catch (error) {
    console.error("删除文章失败", error);
  }
};

// 根据传入的文章 id 和状态，更新共享文章的发布状态。
const updateState = async (articleId: number, state: number) => {
  try {
    const res: any = await changeArticleStateApi({ articleId, state });
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) {
      proxy.$message({ type: "warning", message: res.msg ?? "修改失败" });
      return;
    }
    proxy.$message({ type: "primary", message: state === 1 ? "发布成功" : "已撤回" });
    getData(true);
  } catch (error) {
    console.error("修改文章状态失败", error);
  }
};
//翻页操作
const changePage = (e: number) => {
  request.nowPage = e;
  currentPage.value = e;
  getData(false);
};

// 分组、发布状态或搜索词变化时，回到第一页并重新获取列表及总数
watch(
  [() => props.subsetId, () => props.state, () => props.serchTerm],
  ([subsetId, state, serchTerm]) => {
    request.subsetId = subsetId;
    request.state = state;
    request.serchTerm = serchTerm.trim();
    request.nowPage = 1;
    currentPage.value = 1;
    getData(true);
  }
);


onMounted(() => {
  getData(true);
});
</script>

<style scoped lang="less">
.Pagination {
  width: 100%;
  padding: @space-s 0 @space-xl;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // border-top: 1px solid @line-color-s;
}
</style>
