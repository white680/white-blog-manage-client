// 分组 Pinia store：保存分组数据并计算未分组条目。
import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', {
    state: () => {
        return {
            // 所有这些属性都将自动推断其类型
            id:-1,
            name:'',
            token:''
        }
    },
    persist:{
        storage:sessionStorage,
    },
})