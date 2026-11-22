<!-- 单个文件卡片：处理图片选择、删除和显示名修改。 -->
<template>
  <!-- 图片组件 -->
  <div class="file-item">
    <div class="file-item__img" :class="{ 'file-item__selected': props.data?.selected }">
      <yk-image :src="url" width="250" height="250" :is-lazy="true" fit="cover"></yk-image>
      <!-- 图片选中后移除操作区，透明按钮不再接收点击 -->
      <yk-space v-if="!props.data?.selected" class="file-item__img__icontool" size="s">
        <button type="button" class="file-item__delete-trigger" :disabled="props.data.inUse"
          :title="props.data.inUse ? '使用中的图片不可删除' : '删除文件'" aria-label="删除文件" @click="deleteItem">
          <IconDeleteOutline size="18px" />
        </button>
        <button class="file-item__rename-trigger" type="button" aria-label="修改文件名称" @click="renameOpen = true">
          <IconEditFill size="18px" />
        </button>
      </yk-space>
      <button type="button" class="file-item__img__check" :aria-pressed="Boolean(props.data.selected)"
        :aria-label="props.data.selected ? '取消选择文件' : '选择文件'" @click="checkFile">
        <IconTickMinOutline style="color: #fff; font-size: 24px" />
      </button>
    </div>
    <p class="file-item__name">{{ props.data.fileName }}.{{ props.data.format }}</p>
    <p class="file-item__status">{{ props.data.inUse ? '使用中' : '未使用' }}</p>
    <yk-modal v-model="renameOpen" title="修改文件名称" size="s">
      <label class="file-item__rename-label" :for="`rename-file-${props.data.id}`">文件名称</label>
      <yk-input :id="`rename-file-${props.data.id}`" v-model="draftName" :limit="100" placeholder="请输入文件名称" style="width: 100%" @submit="saveRename" />
      <p v-if="renameError" class="file-item__rename-error" role="alert">{{ renameError }}</p>
      <template #footer>
        <yk-space size="m">
          <yk-button type="secondary" @click="renameOpen = false">取消</yk-button>
          <yk-button :loading="saving" @click="saveRename">保存</yk-button>
        </yk-space>
      </template>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FileData } from "../../../../utils/interface";
import { baseImgUrl } from "../../../../utils/env";
import { renameFileApi } from "../../../../api";
import { useCode } from "../../../../hook/code";
import { useUserStore } from "../../../../store/user";

// emit（传递给父级，统一让他进行操作）
const emits = defineEmits(["renamed", "delete", "selected"]);
type FileItemProps = {
  data: FileData & { inUse: boolean };
};

const props = withDefaults(defineProps<FileItemProps>(), {});

// 计算图片路径
const url = computed(
  () => `${baseImgUrl}/${encodeURIComponent(props.data.url)}`
);

const userStore = useUserStore();
const { tackleCode } = useCode();
const renameOpen = ref(false);
const draftName = ref(props.data.fileName);
const renameError = ref("");
const saving = ref(false);

watch(renameOpen, (open) => {
  if (open) {
    draftName.value = props.data.fileName;
    renameError.value = "";
  }
});

const saveRename = async () => {
  if (saving.value) return;
  const fileName = draftName.value.trim();
  if (!fileName || fileName.length > 100) {
    renameError.value = "名称须为 1 到 100 个字符";
    return;
  }
  if (fileName === props.data.fileName) {
    renameOpen.value = false;
    return;
  }

  saving.value = true;
  renameError.value = "";
  try {
    const res: any = await renameFileApi({ token: userStore.token, fileId: props.data.id, fileName });
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) {
      renameError.value = res.msg ?? "修改失败，请重试";
      return;
    }
    emits("renamed", { id: props.data.id, fileName });
    renameOpen.value = false;
  } catch (error: any) {
    renameError.value = error?.response?.data?.msg ?? "修改失败，请重试";
  } finally {
    saving.value = false;
  }
};

// 删除
const deleteItem = () => {
  if (props.data.inUse) return;
  emits("delete", props.data?.id);
};
// 选择
const checkFile = () => {
  emits("selected", props.data?.id);
};

// 选中图片时关闭改名弹窗。
watch(
  () => props.data?.selected,
  (selected) => {
    if (selected) renameOpen.value = false;
  },
);
</script>

<style scoped lang="less">
.file-item {
  &__img {
    position: relative;
    border-radius: @radius-s;
    border: 2px solid @bg-color-l;

    &__icontool {
      position: absolute;
      right: @space-s;
      bottom: @space-s;
      opacity: 0;

      .yk-icon {
        width: 32px;
        height: 32px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.56);
        border-radius: @radius-m;
        cursor: pointer;
        transition: all @animatb;

        &:hover {
          color: @pcolor;
          background: rgba(255, 255, 255, 1);
          backdrop-filter: blur(2px);
        }
      }
    }

    &__check {
      width: 36px;
      height: 36px;
      border-radius: @radius-s;
      background: @gray-1;
      position: absolute;
      left: @space-s;
      top: @space-s;
      cursor: pointer;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.56);
      opacity: 0;

      &:focus-visible {
        outline: 2px solid @pcolor;
        outline-offset: 2px;
      }

      .yk-icon {
        opacity: 0;
      }
    }

    &:hover {
      background: @pcolor-1;

      .file-item__img__check {
        opacity: 1;
      }

      .file-item__img__icontool {
        opacity: 1;
      }
    }

    &:focus-within {
      .file-item__img__check,
      .file-item__img__icontool {
        opacity: 1;
      }
    }
  }

  .file-item__selected {
    background: @pcolor-1;
    border: 2px solid @pcolor-3;

    .file-item__img__check {
      opacity: 1;
      background: @pcolor;

      .yk-icon {
        opacity: 1;
      }
    }

    .file-item__img__icontool {
      opacity: 0;
    }

    &:hover {
      .file-item__img__icontool {
        opacity: 0;
      }
    }
  }

  &__name {
    width: 100%;
    padding: @space-l @space-l 0;
    text-align: center;
    overflow-wrap: anywhere;
  }

  &__status {
    margin: 4px 0 @space-l;
    text-align: center;
    color: @font-color-s;
  }

  &__delete-trigger {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;

    &:focus-visible {
      outline: 2px solid @pcolor;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;

      .yk-icon {
        cursor: not-allowed;
      }
    }
  }

  &__rename-trigger {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;

    &:focus-visible {
      outline: 2px solid @pcolor;
      outline-offset: 2px;
    }
  }

  &__rename-label {
    display: block;
    margin-bottom: 8px;
  }

  &__rename-error {
    color: #d03050;
    margin-top: 8px;
  }

}
</style>
