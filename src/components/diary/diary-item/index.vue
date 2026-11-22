<!-- 日记卡片：展示天气、日期和正文，并提供删除入口。 -->
<template>
  <div class="diary-item">
    <yk-space dir="vertical">
      <div class="diary-item__top">
        <yk-space dir="vertical" :size="4">
          <p class="diary-item__top__title">
            {{ props.data?.title }}
            <img :src="imgUrl" alt="" />
          </p>
          <yk-text type="third"> {{ momentm(props.data?.moment!) }} </yk-text>
        </yk-space>
        <IconDeleteOutline @click="showModal" class="diary-item__top__delete" />
      </div>
      <yk-text> {{ props.data?.content }}</yk-text>
      <div class="images">
        <yk-image-preview-group :src-list="images" width="150" height="150" fit="cover"></yk-image-preview-group>
      </div>
    </yk-space>
  </div>
  <yk-modal v-model="visible" title="删除" size="s" @onSubmit="deleteArticle">
    <span>你确定删除此图库吗？确认后不可撤回</span>
  </yk-modal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { DiaryeData } from "../../../utils/interface";
import { weather } from "../../../utils/weather";
import { momentm } from "../../../utils/moment";
import { baseImgUrl } from "../../../utils/env";
// 传给父级
const emits = defineEmits(["delete"]);
// 删除弹窗
const visible = ref<boolean>(false);
const showModal = () => {
  visible.value = !visible.value;
};
type diaryItemProps = {
  data?: DiaryeData;
};
const props = defineProps<diaryItemProps>();
const imgUrl = `/src/assets/${weather[props.data?.weatherId!].icon}`;
// 删除文章
const deleteArticle = () => {
  // 传递信息给父级，由父级去操作
  emits("delete", props.data!.id);
  // 关闭对话框
  showModal();
};
// 图片地址处理
const images = computed(() => {
  if (!Array.isArray(props.data?.picture)) return [];

  return props.data.picture.map((name) => {
    if (/^(https?:|data:|blob:)/i.test(name) || name.startsWith("/")) {
      return name;
    }
    return `${baseImgUrl}/${encodeURIComponent(name)}`;
  });
});
</script>

<style scoped lang="less">
.diary-item {
  border-radius: @radius-m;
  background: @bg-color-l;
  padding: @space-xl;
  width: 100%;

  &__top {
    display: flex;
    justify-content: space-between;
    width: 100%;

    &__title {
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 600;

      img {
        width: 30px;
        margin-left: @space-s;
      }
    }

    &__delete {
      width: 20px;
      height: 20px;
      padding: 2px;
      color: @font-color-s;
      transition: color @animatb;
      display: none;

      &:hover {
        color: @font-color-l;
      }
    }
  }

  &:hover {
    .diary-item__top__delete {
      display: block;
    }
  }
}
</style>
<style lang="less">
.images {
  .yk-space {
    gap: 8px;
  }

  .yk-image {
    border-radius: 8px;
  }
}
</style>
