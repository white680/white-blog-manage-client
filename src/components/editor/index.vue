<!-- 富文本正文：绑定内容、创建编辑器实例并处理本地图片插入。 -->
<template>
  <div class="article-editor">
    <Editor
      v-model="content"
      class="article-editor__content"
      :default-config="editorConfig"
      mode="default"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, shallowRef } from "vue";
import { Editor } from "@wangeditor/editor-for-vue";
import type { IDomEditor, IEditorConfig } from "@wangeditor/editor";
import { uploadApi } from "../../api";
import { baseImgUrl } from "../../utils/env";
import { FILE_GROUP } from "../../utils/fileGroups";

const content = defineModel<string>({ default: "" });
const emit = defineEmits<{ created: [editor: IDomEditor] }>();

// wangEditor 实例用 shallowRef 保存，避免 Vue 深度代理编辑器对象。
const editorRef = shallowRef<IDomEditor>();
// 编辑器创建完成时保存实例，供工具栏绑定和页面销毁时清理。
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
  emit("created", editor);
};
// 离开页面时销毁编辑器，释放事件监听和内部资源。
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});

// 正文图片上传后使用文件 URL；文章保存时，引用关系由正文内容确定。
const editorConfig: Partial<IEditorConfig> = {
  placeholder: "请输入文章内容...",
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
        const data = new FormData();
        data.append("file", file);
        data.append("subsetId", String(FILE_GROUP.article));
        const result: any = await uploadApi(data);
        if (result.code !== 200 || !result.data?.url) throw new Error(result.msg ?? "正文图片上传失败");
        const url = `${baseImgUrl}/${encodeURIComponent(result.data.url)}`;
        insertFn(url, file.name, url);
      },
    },
  },
};
</script>

<style scoped lang="less">
.article-editor {
  width: 100%;
  min-width: 0;
  // Editor 组件根节点内联 height: 100%，由外层提供确定高度。
  height: 500px;
  --w-e-textarea-bg-color: @bg-color-l;
  --w-e-textarea-color: @font-color-l;
  --w-e-textarea-border-color: @line-color-s;
  &__content {
    overflow-y: hidden;
    background: @bg-color-l;
    :deep(.w-e-text-container) { border: 0; }
    :deep(.w-e-text-container [data-slate-editor]) { padding: 0; }
    :deep(.w-e-text-placeholder) { left: 0; }
  }
}
</style>
