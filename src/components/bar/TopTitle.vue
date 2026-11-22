<!-- 页面标题栏：通过插槽扩展操作区，并按需展示搜索框。 -->
<template>
  <div class="top_title">
    <yk-title :level="2" style="margin: 0;line-height: 36px;;">{{ props.name }}</yk-title>
    <div class="top_title__extra">
      <!-- 在不同的页面中，标题右边的内容是不同的，默认搜索框，有需要再隐藏展示插槽里的内容，所以这里采用插槽 -->
      <slot name="custom" />
      <!-- 搜索控件 -->
      <yk-space size="s" v-if="isSearch">
        <Transition name="cancel_search">
          <yk-button type="secondary" v-show="SearchData" @click="CancelSearch">取消搜索</yk-button>
        </Transition>
        <yk-input-search style="width: 320px" placeholder="请输入..." v-model="SearchData" @search="search">
          <template #suffix>
            <yk-button type="secondary"><IconSearchOutline /></yk-button>
          </template>
        </yk-input-search>
      </yk-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
//类型定义
type titleProps = {
  name: string;
  isSearch: boolean;
};
const props = withDefaults(defineProps<titleProps>(), {
  name: "首页",
  isSearch: true,
});
// 读取搜索输入框的内容
const SearchData = ref();

// 发送送给父级
const emit = defineEmits(['search'])
// 搜索事件
const search = ()=>{
    emit('search',SearchData.value)
}
// 取消搜索
const CancelSearch=()=>{
    emit('search','')
    SearchData.value=''
}
</script>

<style scoped lang="less">
.top_title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &__extra {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }
}
// 取消按钮动效
.cancel_search-enter-from,
.cancel_search-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
