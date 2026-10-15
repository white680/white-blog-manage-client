<template>
  <div class="comment">
    <div class="data-card">
      <div class="data-card__title">
        <p>评论 {{ count }}</p>
      </div>
      <div class="data-card__content">
        <yk-scrollbar ref="scrollbar" height="100%">
          <yk-space dir="vertical">
            <reply
              v-for="item in comments"
              :key="item.id"
              is-comment
              :content="item"
              @delete="deleteComment"
            />
          </yk-space>
        </yk-scrollbar>
      </div>
      <div class="data-card__Pagination">
        <yk-pagination size="m" :total="count" simple @change="changePage"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref,getCurrentInstance } from "vue";
import { Reply } from "../reply/index";
import { comment } from "../../mock/data";
import type { CommentProps } from "./reply";
type Request = {
  token?: string;
  pageSize: number;
  nowPage: number;
};

const proxy:any = getCurrentInstance()?.proxy

const props = withDefaults(defineProps<CommentProps>(), {
  pageSize: 8,
});

const request: Request = {
  pageSize: props.pageSize,
  nowPage: 1,
};
// 总数
const count = ref<number>(123);
// 数据内容
const comments = ref();

// 获取数据
const drwCommentData = () => {
  let data = comment.data;
  comments.value = data.list.slice(
    (request.nowPage - 1) * request.pageSize,
    request.nowPage * request.pageSize
  );
};
//翻页操作
const changePage = (e:number) =>{
  request.nowPage=e;
  drwCommentData();
}


// 删除评论
const deleteComment = (e: number) => {
  comments.value = comments.value.filter((obj: any) => {
    return obj.id != e;
  });
  proxy.$message({ type: 'success', message: '删除成功' })
};

onMounted(() => {
  drwCommentData();
});
</script>

<style scoped lang="less">
.comment {
  width: 100%;
  .data-card {
    padding: @space-l;
    border-radius: @radius-m;
    background-color: @bg-color-l;
    width: 100%;
    /* 高度可单独调整：改 OverView.vue 里的 --comment-h 即可，
       不会影响左列（左列由自己的 --block-h 决定） */
    height: var(--comment-h, 400px);
    display: flex;
    flex-direction: column;
    .data-card__title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: @space-l;
      p {
        .font-xl();
        font-weight: 600;
        color: font-color-l;
      }
    }
    .data-card__content {
      /* flex-basis 用固定值（而不是 flex:1 的 0%），
         这样卡片的固有高度由 400px 决定（grid 行高交给左侧两卡片决定），
         同时仍可被拉伸填满剩余高度 */
      flex: 1 1 400px;
      min-height: 0;
    }
    &__Pagination {
      padding: @space-l @space-xl;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      border-top: 1px solid @line-color-s;
    }
  }
}
</style>
