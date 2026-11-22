<!-- 日记列表：分页读取 Mock 日记并处理删除事件。 -->
<template>
  <div class="diary">
    <SearchEmpty v-if="showSearchEmpty" :keyword="props.serchTerm.trim()" />
    <template v-else>
      <yk-space dir="vertical" size="xl" style="width:100%;padding-bottom:24px;">
        <DiaryItem v-for="item in diaryList" :data="item" :key="item.id" @delete="deleteDiary" />
      </yk-space>
      <div v-if="count > 0" class="Pagination">
        <yk-pagination size="m" :total="count" :default-page-size="props.pageSize" simple @change="changePage" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, computed, watch } from "vue";
import type { DiaryeData } from "../../utils/interface.ts";
import DiaryItem from "./diary-item/index.vue";
import SearchEmpty from "../artcle/SearchEmpty.vue";
import { diaryApi, deleteDiaryApi } from "../../api";
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
  serchTerm: {
    type: String,
    default: "",
  },
});
const request = {
  token: userStore.token,
  pageSize: props.pageSize, //单页条数；
  nowPage: 1, //当前页
  count: true,
  serchTerm: props.serchTerm, //搜索词条
};
// 获取日记
// 日记
const diaryList = ref<DiaryeData[]>([]);
// 日记总数
const count = ref<number>(0);

const currentPage = ref(1);  //当前页

// 仅在当前关键词的请求成功后显示空结果，避免请求中误显示。
const loadedSearchTerm = ref<string | null>(null);
let latestRequest = 0;
const showSearchEmpty = computed(() => {
  const keyword = props.serchTerm.trim();
  return !!keyword && loadedSearchTerm.value === keyword && count.value === 0 && diaryList.value.length === 0;
});

// 获取随笔随记数据
// e 为 true 表示同时刷新总条数；翻页时传 false，避免多余的统计查询
const getData = async (e: boolean) => {
  // 把"是否需要 count"的意图传给接口
  request.count = e;
  // 先清空已加载的搜索词，请求成功后再写入，保证请求过程中不误显示"无结果"
  loadedSearchTerm.value = null;
  // 请求序号自增，用于丢弃过期响应（后发请求优先）
  const currentRequest = ++latestRequest;
  // 参数快照：防止请求期间 request 被翻页、搜索等操作修改
  const params = { ...request };
  try {
    const res: any = await diaryApi(params);
    // 只处理最后一次请求，避免快速翻页/搜索时旧响应覆盖新数据
    if (currentRequest !== latestRequest) return;
    // 统一处理登录失效等业务状态码，返回 false 表示已处理、无需继续
    if (!tackleCode(res.code)) return;
    // 业务成功且 result 为数组才渲染，否则仅记录日志（此处不弹提示）
    if (res.code !== 200 || !Array.isArray(res.data?.result)) {
      console.error("获取随笔失败", res);
      return;
    }
    // 字段适配：后端 weather_id -> 组件使用的 weatherId
    diaryList.value = res.data.result.map((item: any) => ({
      ...item,
      weatherId: item.weather_id,
    }));
    // 仅当返回了有效总数时更新，避免翻页请求把总数覆盖成 0
    if (res.data.count >= 0) count.value = res.data.count;
    // 记录本次成功加载所用的搜索词，供"无结果"提示判断
    loadedSearchTerm.value = String(params.serchTerm ?? "").trim();
  } catch (error) {
    // 只打印最后一次请求的异常，忽略已被新请求取代的失败
    if (currentRequest === latestRequest) console.error("获取随笔失败", error);
  }
};


// 删除日记
const deleteDiary = async (e: number) => {
  try {
    const res: any = await deleteDiaryApi({
      token: userStore.token,
      diaryId: e
    })
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) {
      proxy.$message({ type: "warning", message: res.msg ?? "删除失败" });
      return;
    }
    proxy.$notification.success({ title: "消息", message: '删除成功', duration: 2000 });
    getData(true);
  } catch (error) {
    console.error("删除文章失败", error);
  }
};
//翻页操作
const changePage = (e: number) => {
  request.nowPage = e;
  currentPage.value = e;
  getData(false);
};

// 子组件传递更新消息
const changeDiary = () => {
  getData(true);
}
defineExpose({ changeDiary });

onMounted(() => {
  getData(true);
});
watch(
  () => props.serchTerm,
  (serchTerm) => {
    request.serchTerm = serchTerm.trim();
    getData(true);
  }
)
</script>

<style scoped lang="less">
.diary {
  width: 100%;

  .Pagination {
    width: 100%;
    padding: @space-s 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // border-top: 1px solid @line-color-s;
  }
}
</style>
