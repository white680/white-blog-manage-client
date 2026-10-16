<template>
  <!-- 图片组件 -->
  <div class="file-item">
    <div class="file-item__img">
      <yk-image
        :src="url"
        width="200"
        height="200 "
        :is-lazy="true"
        fit="cover"
      ></yk-image>
      <yk-space class="file-item__img__icontool" size="s">
        <IconDeleteOutline size="18px" class="files__tool__delete" />
        <IconSwitchOutline size="18px" class="files__tool__switch" />
      </yk-space>
      <div class="file-item__img__check">
        <IconTickMinOutline style="color:#FFF;font-size: 24px;"/>
      </div>
    </div>
    <yk-text>{{ props.data.fileName }}.{{ props.data.format }}</yk-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FileData } from "../../../../utils/interface";
type FileItemProps = {
  data: FileData;
};

const props = withDefaults(defineProps<FileItemProps>(), {});

// 图片路径
const url = computed(()=>{
    return `/src/assets/photos/${props.data?.url}`
})
</script>

<style scoped lang="less">
.file-item {
    &__img {
        position: relative ;
        border-radius: @radius-m;
        &__icontool{
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
                transition:all @animatb;
                &:hover {
                    color:@pcolor;
                    background: rgba(255, 255, 255, 1);
                    backdrop-filter: blur(2px);
                }
            }
        }
        &__check{
            width: 26px;
            height: 26px;
            border-radius: @radius-s;
            background: @gray-1;
            position: absolute;
            left: @space-s;
            top: @space-s;
            cursor: pointer;
            border:1px solid rgba(255, 255, 255, 0.56);
            opacity: 0;
            .yk-icon {}
        }
        &:hover {
            background: @pcolor-1;
            .file-item__img__check{
                opacity: 1;
            }
            .file-item__img__icontool{
                opacity: 1;
            }
        }
    }
}
</style>
