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
const getData = (e: boolean) => {
  request.count = e;
  loadedSearchTerm.value = null;
  const currentRequest = ++latestRequest;
  const params = { ...request };
  diaryApi(params).then((res: any) => {
    if (currentRequest !== latestRequest) {
      return;
    }
    if (res.code === 200 && Array.isArray(res.data?.result)) {
      diaryList.value = res.data.result.map((item: any) => ({
        ...item,
        weatherId: item.weather_id
      }));
      // 翻页请求的 count 为 -1，保留上次取得的总数
      if (res.data.count >= 0) count.value = res.data.count;
      loadedSearchTerm.value = String(params.serchTerm ?? "").trim();
    } else {
      tackleCode(res.code);
    }
  });
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
