<!-- 新建摄影图库：左侧管理待上传照片，右侧复用图库分类表单。 -->
<template>
  <div class="edit-gallery">
    <div class="edit-gallery__topbar">
      <h1>{{ isEditing ? "修改摄影图库" : "新建摄影图库" }}</h1>
      <div class="edit-gallery__topbar-actions">
        <yk-button type="secondary" @click="router.push('/gallery')">取消</yk-button>
        <yk-button :disabled="submitting || loading || published" @click="publishGallery">
          {{ submitting ? "提交中..." : published ? (isEditing ? "已修改" : "已发布") : (isEditing ? "修改" : "发布") }}
        </yk-button>
      </div>
    </div>

    <div class="edit-gallery__content">
      <GalleryPhotos ref="photosRef" class="edit-gallery__photos" :disabled="submitting || loading || published" @invalid="showInvalidPhotos" />
      <div class="edit-gallery__form-panel" :inert="submitting || loading || published">
        <FormView v-model="formData" :classify="1" class="edit-gallery__form" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { createArticleApi, gainArticleApi, updateArticleApi, uploadApi } from "../api";
import { FILE_GROUP } from "../utils/fileGroups";
import GalleryPhotos from "../components/gallery/gallery-edit/index.vue";
import FormView from "../components/form/index.vue";
import { useCode } from "../hook/code";
import { useUserStore } from "../store/user";
import type { ArticleFormData } from "../utils/interface";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { tackleCode } = useCode();
const proxy: any = getCurrentInstance()?.proxy;
type GallerySelection = { photos: { file?: File; name: string }[]; coverIndex: number };
const photosRef = ref<{
  getSelection: () => GallerySelection;
  setExistingPhotos: (names: string[], cover: string) => void;
} | null>(null);
const submitting = ref(false);
const published = ref(false);
const loading = ref(false);
const loaded = ref(false);
const galleryId = computed(() => Number(route.query.id));
const isEditing = computed(() => route.query.id !== undefined);
let latestLoad = 0;
// 失败后重试时复用已上传文件名，避免同一图片重复写入文件表。
const uploadedFiles = new Map<File, string>();

// 图库与文章共用表单和 article 表，classify=1 表示摄影图库。
const formData = ref<ArticleFormData>({
  title: "",
  subset_id: -1,
  classify: 1,
  label: "",
  introduce: "",
  content: "",
  state: 1,
  moment: new Date(),
});

// 兼容当前 JSON 文件名数组，以及早期的逗号分隔数据。
const parsePhotos = (content: unknown): string[] => {
  if (Array.isArray(content)) return content.filter((name): name is string => typeof name === "string");
  if (typeof content !== "string" || !content) return [];
  try {
    const names: unknown = JSON.parse(content);
    if (Array.isArray(names)) return names.filter((name): name is string => typeof name === "string");
  } catch { /* 旧数据使用逗号分隔 */ }
  return content.split(",").map(name => name.trim()).filter(Boolean);
};

// 编辑场景按 ID 读取图库详情，先确认 classify，避免把文章填进图库编辑页。
const loadGallery = async () => {
  const requestId = ++latestLoad;
  loaded.value = false;
  if (!isEditing.value) {
    loading.value = false;
    photosRef.value?.setExistingPhotos([], "");
    formData.value = { title: "", subset_id: -1, classify: 1, label: "", introduce: "", content: "", state: 1, moment: new Date() };
    return;
  }
  if (!Number.isSafeInteger(galleryId.value) || galleryId.value <= 0 || !tackleCode(userStore.token)) {
    proxy?.$message({ type: "warning", message: "图库 ID 无效" });
    return;
  }
  loading.value = true;
  try {
    const res: any = await gainArticleApi({ token: userStore.token, id: galleryId.value });
    if (requestId !== latestLoad) return;
    const gallery = res.data?.[0];
    if (res.code !== 200 || !gallery || Number(gallery.classify) !== 1) {
      tackleCode(res.code);
      proxy?.$message({ type: "warning", message: "图库详情获取失败" });
      return;
    }
    formData.value = {
      title: gallery.title ?? "",
      subset_id: gallery.subset_id == null ? -1 : Number(gallery.subset_id),
      classify: 1,
      label: gallery.label ?? "",
      introduce: gallery.introduce ?? "",
      content: gallery.content ?? "",
      cover: gallery.cover ?? "",
      state: gallery.state,
      moment: new Date(gallery.moment),
    };
    const names = parsePhotos(gallery.content);
    // 兼容旧记录：封面单独存储而 content 未包含封面时也要回显。
    if (gallery.cover && !names.includes(gallery.cover)) names.unshift(gallery.cover);
    photosRef.value?.setExistingPhotos(names, gallery.cover ?? "");
    loaded.value = true;
  } catch {
    if (requestId === latestLoad) proxy?.$message({ type: "warning", message: "图库详情获取失败，请检查网络" });
  } finally {
    if (requestId === latestLoad) loading.value = false;
  }
};

// 同一编辑组件被不同 ID 复用时重新读取对应图库。
watch(() => route.query.id, () => { published.value = false; loadGallery(); }, { immediate: true, flush: "post" });

// 选图时提示与后端一致的格式和大小限制。
const showInvalidPhotos = (count: number) => {
  proxy?.$message({ type: "warning", message: `${count} 张图片未加入：仅支持 JPG、PNG、WebP，单张不超过 15 MB，最多 80 张` });
};

// 点击发布或修改后才上传新照片；旧照片沿用原文件名，然后创建或更新图库。
const publishGallery = async () => {
  if (submitting.value || loading.value || published.value) return;
  if (isEditing.value && !loaded.value) {
    proxy?.$message({ type: "warning", message: "请先成功加载图库详情" });
    return;
  }
  const title = formData.value.title.trim();
  const subsetId = formData.value.subset_id;
  const selection = photosRef.value?.getSelection();

  if (!title) {
    proxy?.$message({ type: "warning", message: "请输入标题" });
    return;
  }
  if (subsetId == null || subsetId < 0) {
    proxy?.$message({ type: "warning", message: "请选择分类" });
    return;
  }
  if (!selection?.photos.length || selection.coverIndex < 0) {
    proxy?.$message({ type: "warning", message: "请至少选择一张图片" });
    return;
  }
  if (!tackleCode(userStore.token)) return;

  submitting.value = true;
  try {
    const names: string[] = [];
    for (const photo of selection.photos) {
      const file = photo.file;
      if (!file) { names.push(photo.name); continue; }
      const savedName = uploadedFiles.get(file);
      if (savedName) { names.push(savedName); continue; }
      const data = new FormData();
      data.append("file", file);
      data.append("subsetId", String(FILE_GROUP.gallery));
      const result: any = await uploadApi(data);
      if (result.code !== 200 || !result.data?.url) {
        tackleCode(result.code);
        throw new Error("图片上传失败");
      }
      names.push(result.data.url);
      uploadedFiles.set(file, result.data.url);
    }

    // content 以 JSON 数组存文件名；cover 存当前选中照片对应的文件名。
    const value = {
      title,
      subset_id: subsetId,
      label: formData.value.label ?? "",
      introduce: formData.value.introduce ?? "",
      content: JSON.stringify(names),
      cover: names[selection.coverIndex],
      state: formData.value.state === 0 ? 0 : 1,
    };
    const req = {
      token: userStore.token,
      ...(isEditing.value ? { id: galleryId.value, classify: 1 } : {}),
      value: isEditing.value ? value : { ...value, classify: 1, moment: new Date().toISOString() },
    };
    const result: any = isEditing.value ? await updateArticleApi(req) : await createArticleApi(req);
    if (result.code !== 200) {
      tackleCode(result.code);
      throw new Error("图库提交失败");
    }
    published.value = true;
    proxy?.$message({ type: "success", message: isEditing.value ? "图库修改成功" : "图库发布成功" });
  } catch {
    proxy?.$message({ type: "warning", message: "提交失败，请检查图片和网络后重试" });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
.edit-gallery {
  width: min(1760px, calc(100% - 48px));
  margin: 16px auto @space-xl;

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @space-l;
    padding: @space-l @space-xl;
    margin-bottom: @space-l;
    border-radius: @radius-m;
    background: @bg-color-l;

    h1 { .font-xl(); margin: 0; font-weight: 600; }
  }

  &__topbar-actions { display: flex; gap: @space-m; }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
    gap: @space-l;
    align-items: stretch;
    min-height: 70vh;
  }

  &__photos { min-width: 0; }

  &__form-panel {
    min-width: 0;
    padding: @space-xl;
    border-radius: @radius-m;
    background: @bg-color-l;
  }

  &__form {
    width: 100%;
    padding: 0;

    :deep(.form__introduce) { border-bottom: 0; }
  }
}

@media (max-width: 900px) {
  .edit-gallery {
    &__content { grid-template-columns: 1fr; }
    &__form-panel { min-height: 380px; }
  }
}

@media (max-width: 480px) {
  .edit-gallery {
    width: calc(100% - 24px);
    &__topbar { padding: @space-l; flex-wrap: wrap; }
    &__content { gap: @space-m; }
  }
}
</style>
