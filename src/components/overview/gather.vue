<!-- 总览统计卡片：展示各模块数据并提供对应新建入口。 -->
<template>
  <yk-space class="gather">
    <div v-for="(item, index) in gathers" :key="index" class="gather__list" :style="{ background: item.bgColor }">
      <yk-space dir="vertical" size="s">
        <yk-text type="secondary">{{ item.name }}</yk-text>
        <yk-title :level="2">{{ item.total }}</yk-title>
      </yk-space>
      <yk-button v-if="index > 0" type="secondary" size="xl" shape="square" @click="goPage(item.path)">
        <IconPlusOutline />
      </yk-button>
    </div>
  </yk-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { overLink } from "../../utils/meun";
// import { overview } from '../../mock/data';
import { useRouter } from "vue-router";
import { useUserStore } from "../../store/user";
import { useCode } from "../../hook/code";
import { overviewApi } from "../../api";

const userStore = useUserStore();
// token验证
const { tackleCode } = useCode();

const router = useRouter();
const gathers = ref(overLink);
onMounted(() => {
  // 组件加载完毕后渲染数据
  drawGatherData();
});
//获取数据
const drawGatherData = async () => {
  try {
    const res: any = await overviewApi({});
    if (!tackleCode(res.code)) return;
    if (res.code !== 200 || !res.data) return;
    const data = res.data;
    gathers.value[0].total = data.file;
    gathers.value[1].total = data.article;
    gathers.value[2].total = data.gallery;
    gathers.value[3].total = data.diary;
  } catch (error) {
    console.error("获取总览数据失败", error);
  }
};
// 页面跳转
const goPage = (e: string) => {
  router.push(e);
};
</script>

<style scoped lang="less">
.gather {
  width: 100%;

  .gather__list {
    /* flex:1 = flex:1 1 0%，剩余空间（已扣除 gap）被平均分配，
           不会再出现 4×25% + 3×16px 超出容器宽度的问题 */
    flex: 1;
    min-width: 0; // 防止内部内容把子项撑破
    background: #6d6c6c;
    display: flex;
    justify-content: space-between;
    padding: @space-xl;
    border-radius: @radius-m;
    align-items: center;

    &:first-child {

      .yk-title,
      .yk-text {
        color: @white;
      }
    }
  }
}

// 仅暗色模式下，后三张卡片的名称和数字使用黑色
[data-theme="dark"] .gather__list:not(:first-child) {

  :deep(.yk-text),
  :deep(.yk-title) {
    color: #000;
  }
}
</style>
