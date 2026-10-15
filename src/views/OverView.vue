<template>
  <yk-space dir="vertical" size="xl">
    <top-title name="首页" :is-search="false" />
    <gather/>
    <yk-space class="main-contain">
      <datas/>
      <yk-space dir="vertical" size="xl" class="right-contain">
        <comment/>
        <!-- 预留容器：自动填充评论区下方的剩余高度，用不同背景色区分 -->
        <div class="data-reserve"></div>
      </yk-space>
    </yk-space>
    <yk-space>
      
    </yk-space>
  </yk-space>
</template>

<script setup lang="ts">
import TopTitle from "../components/bar/TopTitle.vue";
import gather from "../components/overview/gather.vue";
import datas from "../components/overview/datas.vue";
import { Comment,PrivateMessage,Reply } from "../components/reply/index.ts";
</script>

<style scoped lang="less">
/* 写 yk-space 一起使用，提高选择器优先级，
   以便覆盖组件库默认的 `.yk-space.align-start { align-items: flex-start }` */
.yk-space.main-contain{
  width:100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* 关键：yk-space 默认 align-items:flex-start 会让 grid 子项不拉伸，
     改为 stretch 后两列高度才会一致 */
  align-items: stretch;

  /* 左列两块卡片（折线图 / 饼图）的高度：
     卡片 16×2 padding + 标题行 + LineChart 的 chart-height
     当前图表 300px → 卡片 400px；改 LineChart 的 chart-height 时同步改这里 */
  --block-h: 400px;

  /* 评论区高度：默认与左侧折线图卡片等高；
     想单独调就改成具体值（如 --comment-h: 320px），
     此时右列下方预留容器会自动吃掉多出来的（或少掉的）高度 */
  --comment-h: 550px;
}

/* 右列：评论卡片 + 预留容器，块间距与左列一致（yk-space size="xl" = 24px） */
.right-contain {
  width: 100%;
}

/* 预留容器：自动填充右列剩余高度
   （右列总高由 grid 的 align-items:stretch 撑到与左列一致） */
.data-reserve {
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: @bg-color-s;
  border-radius: @radius-m;
}
</style>
