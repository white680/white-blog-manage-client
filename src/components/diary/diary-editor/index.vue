<!-- 日记编辑区：维护标题、天气和正文输入状态。 -->
<template>
  <div class="diary-editor">
    <div class="diary-editor__title">
      <input type="text" class="diary-editor__title__input" placeholder="请输入标题" aria-label="随笔标题"
        v-model="diaryFrom.title" />
      <yk-popover placement="bottomRight" title="选择天气">
        <template #content>
          <yk-space wrap :size="[32, 16]" style="padding: 16px 0 0 14px">
            <div class="diary-editor__title__weather" v-for="item in weather" :key="item.id"
              :class="{ selected: diaryFrom.weatherId == item.id }" @click="diaryFrom.weatherId = item.id">
              <img :src="`/src/assets/${item.icon}`" />
            </div>
          </yk-space>
        </template>
        <img :src="imgUrl" />
      </yk-popover>
    </div>
    <div class="diary-editor__textarea">
      <yk-text-area v-model="diaryFrom.content" placeholder="请输入..." showWordLimit :max-length="1600"></yk-text-area>
    </div>
    <div class="diary-editor__picture">
      <input ref="pictureInput" class="diary-editor__picture__input" type="file"
        accept="image/jpeg,image/png,image/webp" multiple @change="selectPictures" />
      <yk-space wrap size="s">
        <div v-for="(item, index) in pictureFiles" :key="item.preview" class="diary-editor__picture__item">
          <img :src="item.preview" :alt="item.file.name" />
          <button type="button" class="diary-editor__picture__remove" :disabled="submitting"
            :aria-label="`移除图片 ${item.file.name}`" @click="removePicture(index)">
            ×
          </button>
        </div>

        <button v-if="pictureFiles.length < 6" type="button" class="diary-editor__picture__add" :disabled="submitting"
          @click="pictureInput?.click()">
          +
        </button>
      </yk-space>
    </div>
    <div class="diary-editor__foot">
      <yk-space style="--pcolor: #8a3ee8" size="s">
        <yk-button type="secondary">取消</yk-button>
        <yk-button @click="confirm()">新建笔记</yk-button>
      </yk-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance, onBeforeUnmount } from "vue";
import { weather } from "../../../utils/weather";
import { createDiaryApi, uploadApi } from "../../../api/index";
import { FILE_GROUP } from "../../../utils/fileGroups";
import { YkMessage } from "@yike-design/ui";
import { useUserStore } from "../../../store/user";
import { useCode } from "../../../hook/code";

const userStore = useUserStore();
const { tackleCode } = useCode();
const proxy: any = getCurrentInstance()?.proxy;

const emit = defineEmits<{
  (e: "changeDiary"): void;
}>();

type DiaryForm = {
  title: string;
  weatherId: number;
  content: string;
};

type PendingPicture = {
  file: File;
  preview: string;
  // 图片已上传但随笔保存失败时，重试可复用文件名，避免重复上传。
  uploadedName?: string;
};

const diaryFrom = ref<DiaryForm>({
  title: "",
  weatherId: 0,
  content: "",
});

const pictureInput = ref<HTMLInputElement | null>(null);
const pictureFiles = ref<PendingPicture[]>([]);
const submitting = ref(false);

const MAX_PICTURES = 6;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const imgUrl = computed(() => {
  const current = weather.find(
    (item) => item.id === diaryFrom.value.weatherId
  );
  return `/src/assets/${current?.icon ?? weather[0].icon}`;
});

// 只保存用户选中的文件并生成本地预览，此时不调用上传接口。
const selectPictures = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  for (const file of files) {
    if (pictureFiles.value.length >= MAX_PICTURES) {
      YkMessage({ type: "warning", message: "最多添加 6 张图片" });
      break;
    }

    if (!allowedTypes.includes(file.type)) {
      YkMessage({ type: "warning", message: "只支持 JPG、PNG、WebP 图片" });
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      YkMessage({ type: "warning", message: "单张图片不能超过 15 MB" });
      continue;
    }

    pictureFiles.value.push({
      file,
      preview: URL.createObjectURL(file),
    });
  }

  // 清空 input，使用户移除后还能重新选择同一个文件。
  input.value = "";
};

// 移除预览并释放浏览器创建的临时 URL。
const removePicture = (index: number) => {
  const [removed] = pictureFiles.value.splice(index, 1);
  if (removed) URL.revokeObjectURL(removed.preview);
};

const clearPictures = () => {
  for (const item of pictureFiles.value) {
    URL.revokeObjectURL(item.preview);
  }
  pictureFiles.value = [];
  if (pictureInput.value) pictureInput.value.value = "";
};

const resetForm = () => {
  diaryFrom.value = {
    title: "",
    weatherId: 0,
    content: "",
  };
  clearPictures();
};

onBeforeUnmount(clearPictures);

// 点击“新建笔记”后上传图片，再将文件名写入 diary.picture。
const createDiary = async () => {
  if (submitting.value) return;

  const title = diaryFrom.value.title.trim();
  const content = diaryFrom.value.content.trim();

  if (!title || !content) {
    YkMessage({ type: "warning", message: "请填写标题和正文" });
    return;
  }

  submitting.value = true;

  try {
    for (const item of pictureFiles.value) {
      if (item.uploadedName) continue;

      const uploadData = new FormData();
      uploadData.append("file", item.file);
      uploadData.append("subsetId", String(FILE_GROUP.diary));

      const uploadRes: any = await uploadApi(uploadData);
      if (!tackleCode(uploadRes.code)) return;

      if (uploadRes.code !== 200 || !uploadRes.data?.url) {
        YkMessage({
          type: "error",
          message: uploadRes.msg ?? "图片上传失败",
        });
        return;
      }

      item.uploadedName = uploadRes.data.url;
    }

    // 后端 diary.picture 是字符串列；读取列表时后端会按逗号拆成数组。
    const picture = pictureFiles.value.length
      ? pictureFiles.value.map((item) => item.uploadedName).join(",")
      : null;

    const req = {
      token: userStore.token,
      value: {
        title,
        content,
        weather_id: diaryFrom.value.weatherId,
        picture,
        moment: new Date().toISOString(),
      },
    };

    const res: any = await createDiaryApi(req);
    if (!tackleCode(res.code)) return;

    if (res.code !== 200) {
      YkMessage({
        type: "error",
        message: res.msg ?? "新建失败",
      });
      return;
    }

    proxy.$notification.success({
      title: "消息",
      message: "新增成功",
      duration: 2000,
    });

    resetForm();
    emit("changeDiary");
  } catch (error) {
    // Axios 拦截器已显示网络错误；这里保留日志。
    console.error("上传图片或新建随笔失败", error);
  } finally {
    submitting.value = false;
  }
};

const confirm = () => {
  createDiary();
};
</script>

<style scoped lang="less">
.diary-editor {
  background-color: @bg-color-l;
  border-radius: @radius-m;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  align-self: stretch;
  display: flex;
  flex-direction: column;

  &__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @space-m;
    padding: @space-l @space-l 0;

    &__input {
      flex: 1;
      min-width: 0;
      height: 48px;
      box-sizing: border-box;
      padding: 0 @space-m;
      border: 1px solid @line-color-m;
      border-radius: @radius-m;
      background-color: @bg-color-s;
      font-size: 20px;
      font-weight: 600;
      color: @font-color-l;
      transition: border-color @animatb ease-in-out, box-shadow @animatb ease-in-out;

      &:hover {
        border-color: @pcolor;
      }

      &:focus {
        border-color: @pcolor;
        outline: 2px solid @pcolor;
        outline-offset: 2px;
      }
    }

    input {
      outline: none;

      &::placeholder {
        color: @font-color-s;
      }
    }

    img {
      width: 24px;
    }

    &__weather {
      position: relative;
      display: flex;
      justify-content: center;
      padding-bottom: 8px;
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 2px;
        border-radius: 2px;
        background-color: @pcolor;
        transform: scaleX(0);
        transform-origin: center;
        transition: transform 350ms ease;
      }

      &:hover::after,
      &.selected::after {
        transform: scaleX(1);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .diary-editor__title__weather::after {
      transition: none;
    }
  }

  &__textarea {
    // 正文占用剩余高度，避免固定 25 行把编辑区撑得比左侧列表更高。
    flex: 1;
    min-height: 0;
    display: flex;
    padding: @space-l;
  }

  &__picture {
    padding: 0 @space-l @space-l;

    &__input {
      display: none;
    }

    &__item {
      position: relative;
      width: 76px;
      height: 76px;

      img {
        width: 100%;
        height: 100%;
        border-radius: @radius-m;
        object-fit: cover;
      }
    }

    &__remove {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      cursor: pointer;
    }

    &__add {
      min-width: 76px;
      height: 76px;
      padding: 0 @space-s;
      border: 1px dashed @line-color-m;
      border-radius: @radius-m;
      background: @bg-color-s;
      color: @font-color-l;
      cursor: pointer;

      &:hover {
        border-color: @pcolor;
      }
    }
  }

  &__foot {
    display: flex;
    justify-content: end;
    padding: @space-m @space-l;
    border-top: 1px solid @line-color-m;
  }
}
</style>
<style lang="less">
.diary-editor {
  .yk-text-area {
    height: 100%;
    min-height: 200px;
    box-sizing: border-box;
    padding: @space-m;
    border: 1px solid @line-color-m;
    background-color: @bg-color-s;

    &:hover,
    &.yk-text-area--focus {
      border-color: @pcolor;
    }

    &.yk-text-area--focus {
      outline: 2px solid @pcolor;
      outline-offset: 2px;
    }
  }

  .yk-text-area__inner {
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    padding-bottom: @space-l;
    font-size: @size-m;
    line-height: 1.6;
    resize: none;

    &::placeholder {
      color: @font-color-s;
    }
  }
}
</style>
