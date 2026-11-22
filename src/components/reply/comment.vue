<!-- 评论面板：读取 Mock 评论并处理分页、删除及滚动展示。 -->
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
        <yk-pagination size="m" :total="count" simple @change="changePage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance } from "vue";
import { Reply } from "../reply/index";
import type { CommentProps } from "./reply";
import { useUserStore } from "../../store/user";
import { useCode } from "../../hook/code";
import { commentApi, deleteCommentApi } from "../../api";

const userStore = useUserStore();
// token验证
const { tackleCode } = useCode();

// 总数
const count = ref<number>(123);
// 数据内容
const comments = ref();
const proxy: any = getCurrentInstance()?.proxy;

const props = withDefaults(defineProps<CommentProps>(), {
  pageSize: 6,
});
type Request = {
  token?: string;
  pageSize: number;
  nowPage: number;
  count?: boolean;
};
const request: Request = {
  token: userStore.token,
  pageSize: props.pageSize,
  nowPage: 1,
  count: true,
};

// 获取数据
const drwCommentData = (e: boolean) => {
  request.count = e;

  commentApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.data.count != -1) {
        count.value = res.data.count;
      }
      comments.value = res.data.result;
    }
  });
};
//翻页操作
const changePage = (e: number) => {
  request.nowPage = e;
  drwCommentData(false);
};

// 删除评论
const deleteComment = (e: number) => {
  let req = {
    token: userStore.token,
    id: e,
  };
  deleteCommentApi(req).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.code == 200) {
        proxy.$message({ type: "success", message: "删除成功" });
        drwCommentData(true);
      }else {
        proxy.$message({ type: "warning", message: "删除失败，请检查网络是否正常" });
      }
    }
  });
};

onMounted(() => {
  drwCommentData(true);
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
