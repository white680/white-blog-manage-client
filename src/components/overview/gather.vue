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
        width: 25%;
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
</style>
