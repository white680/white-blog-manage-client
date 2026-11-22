// 分组 Pinia store：保存分组数据并计算未分组条目。
import { defineStore } from 'pinia';
import type { SubsetData } from '../utils/interface';
export const useSubsetStore = defineStore('subset', {
    state: () => {
        return {
            // 所有这些属性都将自动推断其类型
            count: 0,
            data: [] as SubsetData[]
        }
    },
    getters: {
        // 计算id，将其归入未分组的分类
        excludedSubset(state) {
            let arr: number[] = []
            let n = state.count
            // 拿到所有id，计算未分组数量
            for (let i = 0; i < state.data.length; i++) {
                arr[i] = state.data[i].id as number
                n = n - state.data[i].value
            }
            return {
                id: arr.join(','),
                name: '未分组',
                value: n
            }
        }
    },
    actions: {
        // 通过subsetId，去获取分组名
        subsetName(e?: number) {
            for (let i = 0; i < this.$state.data.length; i++) {
                if (this.$state.data[i].id === e) {
                    return this.$state.data[i].name
                }
            }
            return '未分组'
        }
    },
})