<!-- 富文本工具栏：接收正文编辑器实例，保持页面滚动时可用。 -->
<template>
  <div class="article-editor-toolbar">
    <yk-affix :offset="64">
      <Toolbar
        class="article-editor-toolbar__tools"
        :editor="editor"
        :default-config="toolbarConfig"
        mode="default"
      />
    </yk-affix>
  </div>
</template>

<script setup lang="ts">
import { Toolbar } from "@wangeditor/editor-for-vue";
import type { IDomEditor, IToolbarConfig } from "@wangeditor/editor";

defineProps<{ editor?: IDomEditor }>();

// 工具顺序与原页面一致，仅把工具栏从正文组件中独立出来。
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    "blockquote", "headerSelect", "|",
    "bold", "underline", "through", "italic", "color", "bgColor", "clearStyle", "|",
    "bulletedList", "numberedList", "todo",
    { key: "group-justify", title: "对齐", menuKeys: ["justifyLeft", "justifyCenter", "justifyRight", "justifyJustify"] },
    { key: "group-indent", title: "缩进", menuKeys: ["indent", "delIndent"] },
    "|", "emotion", "insertLink", "uploadImage", "insertVideo", "insertTable", "|", "code", "codeBlock",
  ],
};
</script>

<style scoped lang="less">
.article-editor-toolbar {
  width: 100%;
  min-width: 0;
  margin-bottom: 14px;
  --w-e-toolbar-bg-color: @bg-color-l;
  --w-e-toolbar-color: @font-color-m;
  --w-e-toolbar-border-color: @line-color-s;
  --w-e-toolbar-active-bg-color: @bg-color-s;
  --w-e-toolbar-active-color: @font-color-l;
  &__tools {
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: 0 @space-s;
  }
}
</style>
