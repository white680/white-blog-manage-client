<!-- 通用表单：文章与图库共用标题、分类、标签和简介字段。 -->
<template>
  <div class="form">
    <yk-space dir="vertical" size="xl">
      <input v-model="formData.title" class="form__title" type="text" maxlength="100" placeholder="请输入标题" />

      <yk-space align="center" wrap>
        <!-- 分类字段沿用当前项目的 subsetId，选项按文章或图库类型从接口获取。 -->
        <div class="form__subset">
          <yk-dropdown :title="String(subsetName)" trigger="click" @selected="selectSubset">
            <yk-dropdown-item v-for="item in subsetList" :key="item.id" :value="item.id">
              {{ item.name }}
            </yk-dropdown-item>
          </yk-dropdown>
        </div>
        <!-- 已选标签最多三个，按完整标签名称显示。 -->
        <yk-space align="center" size="s" wrap>
          <yk-tag v-for="item in selectedLabels" :key="item" shape="round" closeable @close="removeLabel(item)">
            {{ item }}
          </yk-tag>
          <yk-text v-if="selectedLabels.length < 3" type="primary" class="form__add-label" @click="labelVisible = true">
            插入标签
          </yk-text>
        </yk-space>
      </yk-space>

      <div class="form__introduce">
        <!-- 图库简介保留长输入区；文章简介用三行，让正文更早进入视野。 -->
        <yk-text-area v-model="formData.introduce" :max-length="800"
          :auto-size="classify === 1 ? { minRows: 20, maxRows: 22 } : { minRows: 3, maxRows: 10 }"
          placeholder="请输入简介" />
      </div>
    </yk-space>

    <!-- 选图时仅预览，父页面点击保存或发布后才上传封面。 -->
    <div v-if="classify === 0" class="form__cover">
      <input ref="coverInput" class="form__file" type="file" accept="image/jpeg,image/png,image/webp"
        @change="selectCover" />
      <div v-if="coverPreview" class="form__cover-preview">
        <img :src="coverPreview" alt="文章封面" />
        <button type="button" class="form__cover-remove" @click="removeCover">移除</button>
      </div>
      <button v-else type="button" class="form__cover-button" @click="coverInput?.click()">
        <IconPlusOutline />
        <span>添加封面</span>
        <small>建议 800 × 600</small>
      </button>
      <button v-if="coverPreview" type="button" class="form__cover-change" @click="coverInput?.click()">
        更换封面
      </button>
    </div>

    <yk-modal v-model="labelVisible" title="插入标签" size="s" :show-footer="false">
      <yk-space dir="vertical" size="l">
        <yk-input v-model="newLabel" placeholder="输入标签后按回车" style="width: 280px" @submit="addLabel(newLabel)" />
        <yk-space wrap size="s">
          <yk-tag v-for="item in labelOptions" :key="item" shape="round" class="form__label-option"
            @click="addLabel(item)">
            {{ item }}
          </yk-tag>
        </yk-space>
      </yk-space>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { subsetApi, uploadApi, labelApi } from "../../api";
import { FILE_GROUP } from "../../utils/fileGroups";
import { useUserStore } from "../../store/user";
import type { ArticleFormData, SubsetData, LabelData } from "../../utils/interface";
import { baseImgUrl } from "../../utils/env";


type FormProps = { classify?: 0 | 1 };
const { classify = 0 } = defineProps<FormProps>();

// 父页面用 v-model 同步表单，图库页面不传时也可独立使用
const formData = defineModel<ArticleFormData>({
  default: () => ({
    title: "",
    subset_id: -1,
    classify: 0,
    label: "",
    introduce: "",
    content: "",
    state: -1,
    moment: new Date(),
  }),
});


const userStore = useUserStore();

// 标签数据
const labelList = ref<LabelData[]>([]);
const labelVisible = ref(false);
const newLabel = ref("");

// 表单独立获取对应类型的分类，刷新页面时不再回退到随机 Mock 数据。
const subsetList = ref<SubsetData[]>([]);
// 获取分类列表
const getSubset = () => {
  subsetApi({ token: userStore.token, classify })
    .then((res: any) => {
      if (res.code === 200 && Array.isArray(res.data?.list)) {
        subsetList.value = res.data.list;
      }
    })
    .catch(() => {
      // Axios 拦截器已提示请求错误，保持分类列表为空。
      subsetList.value = [];
    });
}

// 根据表单里的分类 id 生成下拉框显示的名称。
const subsetName = computed(() =>
  subsetList.value.find((item) => item.id === formData.value.subset_id)?.name ?? "选择分类"
);
// 用户选择分类后，把选项 id 写回父页面共享的表单数据。
const selectSubset = (id: number | string) => {
  formData.value.subset_id = Number(id);
};


// 后端保存字符串；界面显示时拆成标签数组
const selectedLabels = computed(() =>
  (formData.value.label ?? "").split(",").map(name => name.trim()).filter(Boolean)
);

const getLabels = async () => {
  try {
    const res: any = await labelApi({ token: userStore.token });
    labelList.value = res.code === 200 && Array.isArray(res.data) ? res.data : [];
  } catch {
    labelList.value = [];
  }
};

const labelOptions = computed(() =>
  labelList.value
    .map(item => String(item.label_name))
    .filter(name => !selectedLabels.value.includes(name))
);
// 将输入或点击的标签加入表单；空值、重复项和超过三个的选择会被忽略。
const addLabel = (value: string) => {
  const name = value.trim();
  if (!name || selectedLabels.value.length >= 3 || selectedLabels.value.includes(name)) return;
  formData.value.label = [...selectedLabels.value, name].join(",");
  newLabel.value = "";
};
// 按标签名称从表单中移除已选标签。
const removeLabel = (value: string) => {
  formData.value.label = selectedLabels.value.filter(name => name !== value).join(",");
};

/**
 * 
 * 图片文件处理部分
 */
const coverInput = ref<HTMLInputElement>();
const localCoverUrl = ref("");
let selectedCoverFile: File | null = null;

// 选图后先显示本地预览；已有后端文件名时使用静态文件地址。
const coverPreview = computed(() => {
  if (localCoverUrl.value) return localCoverUrl.value;
  return formData.value.cover
    ? `${baseImgUrl}/${formData.value.cover}`
    : "";
});

const clearLocalPreview = () => {
  if (!localCoverUrl.value) return;
  URL.revokeObjectURL(localCoverUrl.value);
  localCoverUrl.value = "";
};

// 选图时只保存待上传的文件并创建本地预览，不请求后端。
const selectCover = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  clearLocalPreview();
  selectedCoverFile = file;
  formData.value.cover = "";
  localCoverUrl.value = URL.createObjectURL(file);
};

// 由父页面在保存或发布时调用；上传成功后才将文件名写入文章表单。
const uploadCover = async (): Promise<string> => {
  if (!selectedCoverFile) return formData.value.cover as string;
  const data = new FormData();
  data.append("file", selectedCoverFile); // 必须与后端 single("file") 一致
  data.append("subsetId", String(FILE_GROUP.article));
  const res: any = await uploadApi(data);
  if (res.code !== 200 || !res.data?.url) throw new Error(res.msg || "封面上传失败");

  formData.value.cover = res.data.url;
  selectedCoverFile = null;
  clearLocalPreview();
  if (coverInput.value) coverInput.value.value = "";
  return formData.value.cover as string;
};

// 清空封面字段和文件输入框，使同一张图片也能再次选择。
const removeCover = () => {
  selectedCoverFile = null;
  clearLocalPreview();
  formData.value.cover = "";
  if (coverInput.value) coverInput.value.value = "";
};
defineExpose({ uploadCover });
onBeforeUnmount(clearLocalPreview);
onMounted(() => {
  getSubset();
  getLabels();
});
</script>

<style scoped lang="less">
.form {
  position: relative;
  width: 100%;
  padding: @space-xl 190px @space-xl 0;

  input {
    border: 0;
    background: transparent;
    outline: none;
    color: @font-color-l;

    &::placeholder {
      color: @gray-4;
    }
  }

  &__title {
    width: 100%;
    font-size: @space-xl;
    font-weight: 600;
  }

  &__subset {
    position: relative;
    min-width: 120px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @space-s;
    color: @font-color-m;
    cursor: pointer;

    :deep(.yk-dropdown__title) {
      min-width: 120px;
    }
  }

  &__add-label,
  &__label-option {
    cursor: pointer;
  }

  &__introduce {
    width: 100%;
    border-bottom: 1px solid @line-color-s;

    :deep(.yk-text-area) {
      border: 0;
      background: transparent;
      padding: 0;
    }

    :deep(textarea) {
      background: transparent;
    }
  }

  &__cover {
    position: absolute;
    top: 0;
    right: 0;
    width: 160px;
  }

  &__file {
    display: none;
  }

  &__cover-button,
  &__cover-preview {
    width: 160px;
    height: 120px;
    border: 1px dashed @line-color-l;
    border-radius: @radius-m;
    background: @bg-color-s;
  }

  &__cover-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    color: @font-color-m;
    cursor: pointer;

    .yk-icon {
      font-size: 22px;
    }

    small {
      color: @font-color-s;
    }
  }

  &__cover-preview {
    position: relative;
    overflow: hidden;
    border-style: solid;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__cover-remove {
    position: absolute;
    right: 4px;
    bottom: 4px;
    border: 0;
    border-radius: @radius-s;
    padding: 2px 6px;
    color: @white;
    background: rgba(0, 0, 0, .6);
    cursor: pointer;
  }

  &__cover-change {
    display: block;
    margin: @space-s auto 0;
    border: 0;
    background: transparent;
    color: @pcolor;
    cursor: pointer;
  }
}
</style>
