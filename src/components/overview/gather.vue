<template>
  <yk-space class="gather">
    <div v-for="(item,index) in gathers" :key="index" class="gather__list" :style="{ background: item.bgColor }">
        <yk-space dir="vertical" size="s">
            <yk-text type="secondary">{{ item.name }}</yk-text>
            <yk-title :level="2">{{ item.total }}</yk-title>
        </yk-space>
        <yk-button v-if="index>0" type="secondary" size="xl" shape="square">
            <IconPlusOutline />
        </yk-button>
    </div>
  </yk-space>

</template>

<script setup lang="ts">
import {ref,onMounted} from 'vue' 
import { overLink } from '../../utils/meun';
import { overview } from '../../mock/data';
const gathers = ref(overLink)
onMounted(()=>{
    // 组件加载完毕后渲染数据
    drawGatherData()
})
//模拟获取数据
const drawGatherData = () =>{
    const data = Object.values(overview.data)
    gathers.value.forEach((item, i) => {
        item.total = data[i] as string | number
    })
}
</script>

<style scoped lang="less">
.gather{
    width: 100%;
    .gather__list{
        /* flex:1 = flex:1 1 0%，剩余空间（已扣除 gap）被平均分配，
           不会再出现 4×25% + 3×16px 超出容器宽度的问题 */
        flex: 1;
        min-width: 0; // 防止内部内容把子项撑破
        background: #6d6c6c;
        display: flex;
        justify-content: space-between;
        padding: @space-xl;
        border-radius: @radius-m;
        align-items: center;
        &:first-child {
            .yk-title,.yk-text{
                color: @white;
            }
        }
    }
}

// Codex 添加：仅暗色模式下，后三张卡片的名称和数字使用黑色
[data-theme='dark'] .gather__list:not(:first-child) {
    :deep(.yk-text),
    :deep(.yk-title) {
        color: #000;
    }
}
</style>
