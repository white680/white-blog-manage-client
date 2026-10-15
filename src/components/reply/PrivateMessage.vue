<template>
  <yk-drawer placement="right" :show="active" @close="closes">
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
import { toRefs, ref, getCurrentInstance, onMounted } from "vue";
import type { MessageProps } from "./reply";
import { comment } from "../../mock/data";

const proxy: any = getCurrentInstance()?.proxy;

const props = withDefaults(defineProps<MessageProps>(), {
  active: false,
  pageSize: 8,
});
const emit = defineEmits(["close"]);
const { active } = toRefs(props);
const closes = () => {
  emit("close", false);
};

type Request = {
  token?: string;
  pageSize: number;
  nowPage: number;
};
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
const changePage = (e: number) => {
  request.nowPage = e;
  drwCommentData();
};

// 删除评论
const deleteComment = (e: number) => {
  comments.value = comments.value.filter((obj: any) => {
    return obj.id != e;
  });
  proxy.$message({ type: "success", message: "删除成功" });
};

onMounted(() => {
  drwCommentData();
});
</script>

<style scoped lang="less"></style>
