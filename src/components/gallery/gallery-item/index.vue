<!-- 图库卡片：展示封面、缩略图和管理操作。 -->
<template>
  <div class="gallery-item">
    <yk-space size="s" dir="vertical">
      <!-- 大图使用封面，下面展示其余照片的前三张。 -->
      <div class="gallery-item__image" tabindex="0" aria-label="图库图片与操作">
        <!-- 鼠标悬停或键盘聚焦时显示操作；删除必须经过二次确认。 -->
        <div class="gallery-item__actions">
          <button type="button" aria-label="编辑图库" title="编辑图库" @click="editGallery">
            <IconModifyOutline />
          </button>
          <button type="button" aria-label="删除图库" title="删除图库" @click="visible = true">
            <IconDeleteOutline />
          </button>
        </div>
        <div class="gallery-item__cover">
          <yk-image
            v-if="cover"
            :src="cover"
            width="238"
            height="160"
            :is-lazy="true"
            :preview="false"
            fit="cover"
          ></yk-image>
        </div>
        <yk-space :size="2">
          <div v-for="index in 3" :key="index" class="image_div"
            :class="{ 'gallery-item__image__left': index === 1, 'gallery-item__image__right': index === 3 }">
            <yk-image v-if="thumbnailNames[index - 1]" :src="fileUrl(thumbnailNames[index - 1])"
              width="78" height="78" :is-lazy="true" :preview="false" fit="cover" />
          </div>
        </yk-space>
      </div>
      <yk-modal v-model="visible" title="删除图库" size="s" @onSubmit="confirmDelete">
        <span>确定删除图库“{{ props.data?.title }}”吗？图库中的照片展示将消失，原始图片仍保留在文件库。</span>
      </yk-modal>
      <!-- 主要内容区（右边） -->
      <!-- 标题和简介 -->
      <div class="gallery-item__contain" style="width: 100%">
        <p class="gallery-item__contain__title">{{ props.data?.title }}</p>
        <!-- 标签 -->
        <div class="gallery-item__contain__datas">
          <!-- 左侧 -->
          <yk-space>
            <!-- 数据 -->
            <yk-space size="l">
              <!-- 阅览次数 -->
              <yk-text type="third">
                查看
                {{ props.data?.views }}
              </yk-text>
              <!-- 点赞次数 -->
              <yk-text type="third">
                喜欢
                {{ props.data?.praise }}
              </yk-text>
            </yk-space>
          </yk-space>
          <yk-text type="third">
            {{ momentm( props.data?.moment!)  }}
          </yk-text>
        </div>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { ArticleData } from "../../../utils/interface";
import { momentm } from "../../../utils/moment";
import { baseImgUrl } from "../../../utils/env";

type ArticleItemProps = {
  data?: ArticleData;
};
const props = defineProps<ArticleItemProps>();
const emit = defineEmits<{ delete: [id: number] }>();
const router = useRouter();
const visible = ref(false);

// 编辑时携带图库 ID，复用新建图库页面。
const editGallery = () => {
  if (props.data) router.push({ path: "/editgallery", query: { id: props.data.id } });
};

// 确认框点击确定后通知列表发起删除请求。
const confirmDelete = () => {
  if (!props.data) return;
  emit("delete", props.data.id);
  visible.value = false;
};

// 将后端文件名转换为图片地址，也兼容已有的绝对 URL。
const fileUrl = (name: string) => /^(https?:\/\/|\/)/.test(name) ? name : `${baseImgUrl}/${name}`;
const cover = computed(() => props.data?.cover ? fileUrl(props.data.cover) : "");

// 新图库的 content 是 JSON 文件名数组；兼容较早的逗号分隔内容。
const photoNames = computed(() => {
  const content = props.data?.content;
  if (Array.isArray(content)) return content;
  if (!content) return [];
  try {
    const parsed: unknown = JSON.parse(content);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return content.split(",").map(item => item.trim()).filter(Boolean);
  }
});

// 缩略图区不重复展示封面。
const thumbnailNames = computed(() => photoNames.value.filter(name => name !== props.data?.cover).slice(0, 3));

</script>

<style scoped lang="less">
.gallery-item {
  width: 238px;
  border-radius: @radius-m;
  background: @bg-color-l;
  &__cover {
    position: relative;
    border-radius: @radius-m @radius-m 0 0;
    overflow: hidden;
    min-width: 160px;
    flex: none;
    padding-bottom: 2px;
    &__unpublish {
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: center;
      background: rgba(43, 90, 237, 0.8);
      line-height: 36px;
      color: @white;
      font-weight: 400;
    }
  }
  &__image {
    position: relative;
    &:focus-visible { outline: 2px solid @pcolor; outline-offset: 2px; }
  }
  &__actions {
    position: absolute;
    z-index: 2;
    top: @space-s;
    right: @space-s;
    display: flex;
    gap: @space-s;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity .18s ease, visibility .18s ease;

    button {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: @radius-s;
      background: rgba(255, 255, 255, .94);
      color: #333;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, .14);
      &:hover, &:focus-visible { color: @pcolor; }
      &:focus-visible { outline: 2px solid @pcolor; outline-offset: 2px; }
    }
  }
  &__image:hover &__actions,
  &__image:focus-within &__actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  &__image__left {
    border-radius: 0 0 0 @radius-m;
    overflow: hidden;
  }
  &__image__right {
    border-radius: 0 0 @radius-m 0;
    overflow: hidden;
  }
  .image_div {
    width: 78px;
    height: 78px;
    background: @gray-2;
  }
  &__contain {
    &__title {
      .font-l();
      overflow: 600;
      font-weight: 600;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
    }
    &__introduce {
      .font-m();
      height: 48px;
      //限制行数
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      color: @font-color-l;
      margin-bottom: @space-m;
      max-width: 1020px;
    }
    &__datas {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
@media (hover: none) {
  .gallery-item__actions { opacity: 1; visibility: visible; pointer-events: auto; }
}
</style>
<style lang="less">
.gallery-item {
  .yk-image__img {
    border-radius: 0;
  }
}
</style>
