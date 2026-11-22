<!-- 文章搜索没有匹配结果时显示在列表原位。 -->
<template>
  <div class="article-search-empty" role="status">
    <IconSearchOutline class="article-search-empty__icon" aria-hidden="true" />
    <p class="article-search-empty__title">没有找到与“{{ keyword }}”相关的文章</p>
    <p class="article-search-empty__hint">试试其他关键词，或点击右上角取消搜索</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ keyword: string }>();
</script>

<style scoped lang="less">
.article-search-empty {
  width: 100%;
  min-height: 320px;
  padding: @space-xl;
  border-radius: @radius-m;
  background: @bg-color-l;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &__icon {
    font-size: 40px;
    color: @font-color-s;
    margin-bottom: @space-m;
  }

  &__title {
    color: @font-color-l;
    font-size: 18px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  &__hint {
    color: @font-color-s;
    font-size: 14px;
    margin-top: @space-s;
  }
}
</style>
