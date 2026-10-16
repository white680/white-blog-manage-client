<template>
  <yk-space size="m" class="reply">
    <yk-avatar :img-url="Avatar" v-if="isComment" />
    <yk-space dir="vertical" size="s" class="reply__main">
      <div class="reply__main__name">
        <yk-text strong> {{ content?.user?.name }} </yk-text>
        <yk-text type="secondary" style="font-size: 12px">{{ content?.moment }}</yk-text>
      </div>
      <yk-text type="secondary">{{ content?.comment }}</yk-text>
      <yk-space v-if="isComment">
        <yk-tag type="primary">{{ content?.article?.title }}</yk-tag>
        <yk-text type="danger" v-show="content?.complaint! >0">举报 {{ content?.complaint }}</yk-text>
      </yk-space>
      <IconDeleteOutline class="reply__main__delete" @click.stop="deleteReply(props.content!.id)"/>
    </yk-space>
  </yk-space>
</template>

<script setup lang="ts">
import Avatar from "../../images/pic.png";
import type { ReplyProps } from "./reply";
const props = withDefaults(defineProps<ReplyProps>(), {
  isComment: true,
});
const emit =defineEmits(["delete"])
// 删除回调函数
const deleteReply=(e:number)=>{
    // 告诉父级去处理
    emit("delete",e)
}
</script>

<style scoped lang="less">
.reply {
  width: 100%;
  &__main {
    width: 100%;
    border-bottom: 1px solid @line-color-s;
    padding-bottom: @space-l;
    flex: 1;
    position: relative;
    &__name {
      display: flex;
      flex-direction: column;
    }
    &__delete {
      position: absolute;
      right: 10px;
      top: 4px;
      width: 16px;
      height: 16px;
      cursor: pointer;
      color: @font-color-s;
      display: none;
    }
    &:hover {
      .reply__main__delete {
        display: block;
      }
    }
  }
  &:hover {
    background-color: @gray-1;
  }
}
</style>
