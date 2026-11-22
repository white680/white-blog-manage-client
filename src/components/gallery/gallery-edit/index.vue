<!-- 图库选图区域：仅预览本地文件，发布时由父页面上传。 -->
<template>
  <div class="gallery-edit">
    <label class="gallery-edit__dropzone" :class="{ 'gallery-edit__dropzone--disabled': disabled }" @dragover.prevent @drop.prevent="dropPhotos">
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple :disabled="disabled" @change="selectPhotos" />
      <IconUploadOutline class="gallery-edit__upload-icon" />
      <span>单击或拖动图片到此区域</span>
    </label>

    <div v-if="photos.length" class="waterfall">
      <div v-for="photo in photos" :key="photo.id" class="waterfall__item">
        <img :src="photo.url" :alt="photo.file?.name ?? photo.name" />
        <IconStarFill v-if="photo.id === coverId" class="waterfall__cover-icon" aria-label="当前封面" />
        <div class="waterfall__actions">
          <button v-if="photo.id !== coverId" type="button" :disabled="disabled" @click="setCover(photo.id)">设为封面</button>
          <button type="button" aria-label="移除图片" :disabled="disabled" @click="removePhoto(photo.id)">
            <IconDeleteOutline />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { baseImgUrl } from "../../../utils/env";

type PreviewPhoto = { id: number; file?: File; name: string; url: string };
const { disabled = false } = defineProps<{ disabled?: boolean }>();
const photos = ref<PreviewPhoto[]>([]);
const coverId = ref<number | null>(null);
let nextId = 0;

// 与后端上传限制保持一致，避免发布时才发现文件不能上传。
const isValidPhoto = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const types: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
  };
  return !!extension && types[file.type]?.includes(extension) && file.size <= 15 * 1024 * 1024;
};

// 把有效文件加入本地预览；无效文件忽略并反馈给用户。
const addPhotos = (files: FileList | File[]) => {
  if (disabled) return 0;
  let rejected = 0;
  for (const file of Array.from(files)) {
    if (!isValidPhoto(file)) { rejected++; continue; }
    if (photos.value.length >= 80) { rejected++; continue; }
    photos.value.push({ id: ++nextId, file, name: file.name, url: URL.createObjectURL(file) });
  }
  if (coverId.value === null && photos.value.length) coverId.value = photos.value[0].id;
  return rejected;
};

const emit = defineEmits<{ invalid: [count: number] }>();

// 处理文件选择，并清空输入值以便再次选择同一张图片。
const selectPhotos = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const rejected = addPhotos(input.files);
    if (rejected) emit("invalid", rejected);
  }
  input.value = "";
};

// 拖入图片时使用与文件选择相同的预览逻辑。
const dropPhotos = (event: DragEvent) => {
  if (disabled) return;
  if (!event.dataTransfer?.files) return;
  const rejected = addPhotos(event.dataTransfer.files);
  if (rejected) emit("invalid", rejected);
};

// 指定图库封面，发布时父页面会使用这张照片的上传结果。
const setCover = (id: number) => { coverId.value = id; };

// 从预览列表移除图片；旧图片只从待提交内容中移除，不立即删除后端文件。
const removePhoto = (id: number) => {
  const photo = photos.value.find(item => item.id === id);
  if (photo?.file) URL.revokeObjectURL(photo.url);
  photos.value = photos.value.filter(item => item.id !== id);
  if (coverId.value === id) coverId.value = photos.value[0]?.id ?? null;
};

// 编辑时回填已有图片；图片 URL 只供预览，提交时仍使用原始文件名。
const setExistingPhotos = (names: string[], cover: string) => {
  photos.value.forEach(item => { if (item.file) URL.revokeObjectURL(item.url); });
  photos.value = names.map(name => ({
    id: ++nextId,
    name,
    url: /^(https?:\/\/|\/)/.test(name) ? name : `${baseImgUrl}/${encodeURIComponent(name)}`,
  }));
  coverId.value = photos.value.find(item => item.name === cover)?.id ?? photos.value[0]?.id ?? null;
};

// 向父页面提供按界面顺序排列的旧图文件名或新 File，以及封面位置。
const getSelection = () => ({
  photos: photos.value.map(item => ({ file: item.file, name: item.name })),
  coverIndex: photos.value.findIndex(item => item.id === coverId.value),
});
defineExpose({ getSelection, setExistingPhotos });

// 离开页面时释放尚未发布的本地预览地址。
onBeforeUnmount(() => photos.value.forEach(item => { if (item.file) URL.revokeObjectURL(item.url); }));
</script>

<style scoped lang="less">
.gallery-edit {
  min-width: 0;
  min-height: 100%;
  padding: @space-xl;
  border-radius: @radius-m;
  background: @bg-color-l;

  &__dropzone {
    display: flex;
    min-height: 240px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: @space-m;
    border: 1px dashed @line-color-l;
    border-radius: @radius-m;
    background: @bg-color-s;
    color: @font-color-m;
    cursor: pointer;

    &:focus-within { outline: 2px solid @pcolor; outline-offset: 2px; }
    input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  }

  &__upload-icon { width: 42px; height: 42px; color: @gray-4; }
  &__dropzone--disabled { opacity: .6; pointer-events: none; }
}

.waterfall {
  column-count: 3;
  column-gap: @space-xl;
  margin-top: @space-xl;

  &__item {
    position: relative;
    break-inside: avoid;
    overflow: hidden;
    margin-bottom: @space-xl;
    border-radius: @radius-m;

    img { display: block; width: 100%; height: auto; }
  }

  &__cover-icon {
    position: absolute;
    top: @space-l;
    left: @space-l;
    width: 24px;
    height: 24px;
    color: #ffad16;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .45));
  }

  &__actions {
    position: absolute;
    top: @space-s;
    right: @space-s;
    display: flex;
    gap: @space-s;
    opacity: 0;
    pointer-events: none;
    transition: opacity .18s ease;

    button {
      min-height: 32px;
      padding: 0 @space-s;
      border: 0;
      border-radius: @radius-s;
      background: rgba(255, 255, 255, .92);
      color: #333;
      cursor: pointer;

      &:hover { color: @pcolor; }
    }
  }

  &__item:hover &__actions,
  &__item:focus-within &__actions { opacity: 1; pointer-events: auto; }
}

@media (hover: none) { .waterfall__actions { opacity: 1; pointer-events: auto; } }
@media (max-width: 760px) { .waterfall { column-count: 2; } }
@media (max-width: 480px) { .waterfall { column-count: 1; } }
</style>
