<template>
  <yk-table>
    <yk-table-column property="name" label="分组序号"></yk-table-column>
    <yk-table-column property="value" label="关联文章数"></yk-table-column>
    <yk-table-column property="moment" label="创建时间"></yk-table-column>
    <yk-table-column property="manage" label="操作" align="right"></yk-table-column>
    <template #tbody>
      <tr v-for="(item, index) in subsetStore.data" :key="index" class="yk-table__row">
        <td class="yk-table__cell">
          <yk-input v-model="item.name" @focus="focueSubset(item.id)" @blur="blurSubset(item.id)"/>
        </td>
        <td class="yk-table__cell">
          {{ item.value }}
        </td>
        <td class="yk-table__cell">
          {{ item.moment }}
        </td>
        <td class="yk-table__cell text-right">
          <yk-text type="primary" style="cursor: pointer" @click="deleteSubSet(item.id)">删除</yk-text>
        </td>
      </tr>
    </template>
  </yk-table>
</template>

<script setup lang="ts">
import { useSubsetStore } from "../../../store/subset";
// store
const subsetStore = useSubsetStore();

/**
 * 
 * 这里留到后期修改，聚焦和失焦就修改数据太过草率，后期可以修改成点击确定按钮后，再提交数据给后端
 */
// 存储当前分组名称
let nowName:string | number 
// 聚焦时事件
const focueSubset = (id:number | string) =>{
    // 去匹配仓库中是否存在相同项
    let result = subsetStore.data.find((item:{id:number | string})=>item.id === id)
    if(result){
        nowName = result.name
    }
}
// 失去焦点的事件
const blurSubset = (id:number | string) =>{
    // 去匹配仓库中是否存在相同项
    let result = subsetStore.data.find((item:{id:number | string})=>item.id === id)
    if(result && nowName != result.name){
        // 这里就进行提交后端处理修改的信息
        console.log('修改成功')
    }
}

// 删除分组
const deleteSubSet = (id:string | number) =>{
    
}
</script>

<style scoped lang="less"></style>
