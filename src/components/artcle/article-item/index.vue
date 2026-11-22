<!-- 文章卡片：展示封面与统计数据，并向列表传递操作事件。 -->
<template>
  <div class="article-item">
    <yk-space size="xl">
      <!-- 封面（左边） -->
      <div class="article-item__cover">
        <yk-image v-if="cover" :src="cover" width="160" height="120" :is-lazy="true" :preview="false"
          fit="cover"></yk-image>
        <!-- mock 新文章未选封面时显示占位，不生成空图片请求 -->
        <div v-else class="article-item__cover__empty">无封面</div>
        <!-- 未发布 -->
        <p class="article-item__cover__unpublish" v-if="props.data?.state === 0">
          未发布
        </p>
      </div>
      <!-- 主要内容区（右边） -->
      <!-- 标题和简介 -->
      <div class="article-item__contain" style="width: 100%">
        <p class="article-item__contain__title">{{ props.data?.title }}</p>
        <p class="article-item__contain__introduce">{{ props.data?.introduce }}</p>
        <!-- 标签 -->
        <div class="article-item__contain__datas">
          <!-- 左侧 -->
          <yk-space>
            <yk-text type="secondary">
              {{ subsetStore.subsetName(props.data?.subsetId) }}
            </yk-text>
            <yk-text type="secondary" v-if="props.data!.label!.length > 0">
              /
              <span v-for="item in props.data?.label" style="padding-right: 4px">
                {{ item }}
              </span>
            </yk-text>
            <yk-text type="third">
              {{ momentm(props.data?.moment!) }}
            </yk-text>
            <!-- 数据 -->
            <yk-space size="l">
              <!-- 阅览次数 -->
              <yk-text type="third">
                <IconEyeOutline />
                {{ props.data?.views }}
              </yk-text>
              <!-- 点赞次数 -->
              <yk-text type="third">
                <IconLikeOutline />
                {{ props.data?.praise }}
              </yk-text>
              <!-- 评论次数 -->
              <yk-text type="third">
                <IconCommentOutline />
                {{ props.data?.comment }}
              </yk-text>
            </yk-space>
          </yk-space>
          <!-- 右侧 -->
          <yk-space class="article-item__contain__datas__controls" size="xl">
            <yk-tooltip palcement="TOP" title="发布" v-if="props.data?.state === 0">
              <IconSendOutline @click="updateState(1)" />
            </yk-tooltip>
            <yk-tooltip palcement="TOP" title="撤回" v-if="props.data?.state === 1">
              <IconRevokeOutline @click="updateState(0)" />
            </yk-tooltip>
            <!-- 带文章 id 打开同一个编辑页 -->
            <yk-tooltip palcement="TOP" title="编辑">
              <IconModifyOutline @click="editArticle" />
            </yk-tooltip>
            <yk-modal v-model="visible" title="删除" size="s" @onSubmit="deleteArticle">
              <span>你确定删除此文章吗？确认后不可撤回</span>
            </yk-modal>
            <IconDeleteOutline @click="showModal" />
          </yk-space>
        </div>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { ArticleData } from "../../../utils/interface";
import { useSubsetStore } from "../../../store/subset";
import { momentm } from "../../../utils/moment";
import { baseImgUrl } from "../../../utils/env";
// store
const subsetStore = useSubsetStore();
const router = useRouter();

// 传给父级
const emits = defineEmits(["delete", "state"])

const visible = ref<boolean>(false)
const showModal = () => {
  visible.value = !visible.value
}
type ArticleItemProps = {
  data?: ArticleData;
};
const props = defineProps<ArticleItemProps>();

// 本地选择的封面直接使用 data URL，mock 旧文章的文件名转为静态资源地址。
const cover = computed(() => {
  const value = props.data?.cover?.trim();
  if (!value) return "";

  // 兼容已有的完整 URL 或本地预览数据
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  // 当前上传接口把文件名写入 article.cover
  return `${baseImgUrl}/${encodeURIComponent(value)}`;
});
// 点击编辑图标时携带当前文章 id，供新建/编辑共用页面回填数据。
const editArticle = () => {
  if (props.data) router.push({ path: "/editarticle", query: { id: props.data.id, state: props.data.state } });
};
// 删除文章
const deleteArticle = () => {
  // 传递信息给父级，由父级去操作
  emits("delete", props.data!.id)
  // 关闭对话框
  showModal();
}
// 修改状态
const updateState = (e: number) => [
  emits("state", { id: props.data!.id, state: e })
]
</script>

<style scoped lang="less">
.article-item {
  width: 100%;
  border-radius: @radius-m;
  background: @bg-color-l;
  padding: @space-xl;

  &__cover {
    position: relative;
    border-radius: @radius-m;
    overflow: hidden;
    min-width: 160px;
    flex: none;

    &__empty {
      width: 160px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: @bg-color-s;
      color: @font-color-s;
    }

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

  &__contain {
    &__title {
      font-size: 20px;
      font-weight: 600;
      padding-bottom: @space-s;
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

      &__controls {
        .yk-icon {
          width: 20px;
          height: 20px;
          color: @font-color-s;
          cursor: pointer;

          &:hover {
            color: @pcolor;
          }
        }
      }
    }
  }
}
</style>
