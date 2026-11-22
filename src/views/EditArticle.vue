<!-- 新建文章页：表单与正文从空值开始，暂只准备创建请求参数。 -->
<template>
  <div class="edit-article">
    <div class="edit-article__topbar">
      <p class="edit-article__topbar__title">新建/更改博客文章</p>
      <yk-space align="center">
        <yk-button type="secondary" @click="router.push('/article')">取消</yk-button>
        <yk-space v-if="!route.query.id">
          <yk-button type="secondary" @click="submit(0)">保存</yk-button>
          <yk-button @click="submit(1)">发布</yk-button>
        </yk-space>
        <yk-space v-else>
          <yk-button @click="updateArticle()">修改</yk-button>
        </yk-space>
      </yk-space>
    </div>
    <!-- 工具栏、文章表单和正文编辑区按阅读顺序排列。 -->
    <RichEditorToolbar :editor="editorRef" />
    <div class="edit-article__paper">
      <div class="edit-article__inner">
        <FormView ref="formRef" v-model="formData" :classify="0" class="edit-article__form" />
        <div class="edit-article__body">
          <RichEditor v-model="content" @created="handleEditorCreated" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref, shallowRef, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user.ts";
import FormView from "../components/form/index.vue";
import RichEditor from "../components/editor/index.vue";
import RichEditorToolbar from "../components/editor/toolbar.vue";
import type { IDomEditor } from "@wangeditor/editor";
import type { ArticleFormData } from "../utils/interface";
import { createArticleApi, gainArticleApi, updateArticleApi } from "../api/index.ts";
import { useCode } from "../hook/code";
import { useRoute } from 'vue-router'

// 获取路由传过来的参数
const route = useRoute();
const articleId = Number(route.query.id);

const router = useRouter();
const userStore = useUserStore();
const proxy: any = getCurrentInstance()?.proxy;


// token验证
const { tackleCode } = useCode();
// 新建文章时保持表单与正文为空
const formData = ref<ArticleFormData>({
  title: "",
  subset_id: -1,
  classify: 0,
  label: "",
  introduce: "",
  content: "",
  state: -1,
  moment: new Date(),
});
const formRef = ref<{ uploadCover: () => Promise<string> } | null>(null);
const submitting = ref(false);
const content = ref("");
// 正文创建后保存实例，供上方独立工具栏绑定同一个编辑器。
const editorRef = shallowRef<IDomEditor>();
const handleEditorCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

// 获取文章
const gainArticle = () => {
  if (route.query.id) {
    if (tackleCode(userStore.token)) {
      gainArticleApi({
        token: userStore.token,
        id: articleId
      }).then((res: any) => {
        if (res.code === 200 && res.data?.[0]) {
          formData.value = res.data[0];
          content.value = res.data[0].content ?? "";
        } else {
          proxy?.$message({ type: "warning", message: "文章详情获取失败" });
        }
      });
    }
  } else return;
}

// 修改文章
const updateArticle = async () => {
  if (submitting.value) return;
  const title = formData.value.title.trim();
  if (!title) {
    proxy?.$message({ type: "warning", message: "请输入标题" });
    return;
  }
  submitting.value = true;
  try {
    await formRef.value?.uploadCover();
    // /createArticle 接收 { token, value }；封面字段现在是上传后的文件名。
    const req = {
      token: userStore.token,
      id:articleId,
      value: {
        title,
        subset_id: formData.value.subset_id ?? null,
        label: Array.isArray(formData.value.label)
          ? formData.value.label.join(",")
          : formData.value.label ?? "",
        introduce: formData.value.introduce,
        content: content.value,
        cover: formData.value.cover,
        state: route.query.state,
      },
    };
    // 修改文章
    if (tackleCode(req.token)) {
      updateArticleApi(req).then((res: any) => {
        if (tackleCode(res.code)) {
          if (res.code === 200) {
            proxy?.$message({ type: "success", message: "文章修改成功" });
          }
        }
      });
    }
  } catch (error) {
    proxy?.$message({ type: "warning", message: "封面修改失败，请重试" });
  } finally {
    submitting.value = false;
  }
}

// 点击保存或发布时才上传封面，然后整理请求参数。
const submit = async (state: 0 | 1) => {
  if (submitting.value) return;
  const title = formData.value.title.trim();
  if (!title) {
    proxy?.$message({ type: "warning", message: "请输入标题" });
    return;
  }

  submitting.value = true;
  try {
    await formRef.value?.uploadCover();
    // /createArticle 接收 { token, value }；封面字段现在是上传后的文件名。
    const req = {
      token: userStore.token,
      value: {
        title,
        subset_id: formData.value.subset_id ?? null,
        classify: 0,
        label: Array.isArray(formData.value.label)
          ? formData.value.label.join(",")
          : formData.value.label ?? "",
        introduce: formData.value.introduce,
        content: content.value,
        cover: formData.value.cover,
        state,
        moment: new Date().toISOString(),
      },
    };
    // 新建文章
    if (tackleCode(req.token)) {
      createArticleApi(req).then((res: any) => {
        if (tackleCode(res.code)) {
          if (res.code === 200) {
            proxy?.$message({ type: "success", message: "文章上传成功" });
          }
        }
      });
    }
  } catch (error) {
    proxy?.$message({ type: "warning", message: "封面上传失败，请重试" });
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  gainArticle();
})
</script>

<style scoped lang="less">
.edit-article {
  width: min(1070px, calc(100% - 48px));
  margin: 14px auto @space-xl;

  &__topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @space-l;
    margin-bottom: 14px;
    padding: @space-l @space-xl;
    border-radius: @radius-m;
    background: @bg-color-l;

    &__title {
      .font-xl();
      font-weight: 600;
    }
  }

  &__paper {
    min-height: 650px;
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: @space-xl;
  }

  &__inner {
    width: min(712px, 100%);
    margin: 0 auto;
  }

  &__body {
    border-top: 1px solid @line-color-s;
    padding-top: @space-s;
  }

  &__form {
    // 上方留出标题空间，压缩分类与简介之间的距离以贴合参考布局。
    padding-top: 20px;
    padding-bottom: @space-s;

    :deep(.form__introduce) {
      margin-top: -20px;
      border-bottom: 0;
    }

    :deep(.form__cover) {
      width: 144px;
    }

    :deep(.form__cover-button),
    :deep(.form__cover-preview) {
      width: 144px;
      height: 108px;
    }
  }
}

@media (max-width: 640px) {
  .edit-article {
    width: calc(100% - 24px);
    margin: @space-l auto;

    &__topbar {
      flex-wrap: wrap;
      padding: @space-l;
    }

    &__paper {
      padding: @space-l;
    }

    &__form {
      padding-right: 0;
      padding-top: 138px;

      :deep(.form__cover) {
        top: 0;
        right: auto;
        left: 0;
      }
    }
  }
}
</style>
