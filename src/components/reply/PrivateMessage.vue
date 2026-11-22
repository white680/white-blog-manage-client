<!-- 私信抽屉：展示 Mock 私信并处理关闭、分页和删除。 -->
<template>
  <yk-drawer placement="right" :show="active" @open="handleDrawerOpen" @close="closes">
    <template #header>
      <h3>
        <IconBulbOutline />
        私信 {{ count }}条
      </h3>
    </template>
    <yk-space dir="vertical">
      <reply
        v-for="item in comments"
        :key="item.id"
        :is-comment="false"
        :content="item"
        @delete="deleteComment"
      />
    </yk-space>
    <template #footer>
      <yk-pagination size="m" :total="count" simple @change="changePage" />
    </template>
  </yk-drawer>
</template>

<script setup lang="ts">
import { toRefs, ref, getCurrentInstance, onMounted, nextTick } from "vue";
import type { MessageProps } from "./reply";
import { getMessageApi, deleteMessageApi } from "../../api";
import { useUserStore } from "../../store/user";
import { useCode } from "../../hook/code";
const userStore = useUserStore();
// token验证
const { tackleCode } = useCode();
const proxy: any = getCurrentInstance()?.proxy;

const props = withDefaults(defineProps<MessageProps>(), {
  active: false,
  pageSize: 8,
});
const emit = defineEmits(["close"]);
const { active } = toRefs(props);
// 将关闭意图通知父组件，由父组件更新抽屉的 active 状态。
const closes = () => {
  emit("close", false);
};

// Yike UI 会聚焦带 aria-hidden 的占位节点；打开后先修正属性，再把焦点导向可见的关闭按钮。
const handleDrawerOpen = async () => {
  await nextTick();
  const drawer = document.querySelector<HTMLElement>('.yk-drawer[aria-modal="true"]');
  const focuser = drawer?.querySelector<HTMLElement>(".yk-drawer__focus");
  const closeButton = drawer?.querySelector<HTMLButtonElement>(".yk-drawer__close");
  focuser?.removeAttribute("aria-hidden");
  if (focuser && closeButton) {
    closeButton.setAttribute("aria-label", "关闭私信");
    focuser.onfocus = () => closeButton.focus();
  }
};

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
// 总数
const count = ref<number>(123);
// 数据内容
const comments = ref();

// 获取私信数据
const drwCommentData = (e: boolean) => {
  // let data = comment.data;
  // comments.value = data.list.slice(
  //   (request.nowPage - 1) * request.pageSize,
  //   request.nowPage * request.pageSize
  // );
  request.count = e;
  getMessageApi(request).then((res: any) => {
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
  deleteMessageApi(req).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.code == 200) {
        proxy.$message({ type: "success", message: "删除成功" });
        drwCommentData(true);
      } else {
        proxy.$message({ type: "warning", message: "删除失败，请检查网络是否正常" });
      }
    }
  });
  drwCommentData(true);
};

onMounted(() => {
  drwCommentData(true);
});
</script>

<style scoped lang="less"></style>
