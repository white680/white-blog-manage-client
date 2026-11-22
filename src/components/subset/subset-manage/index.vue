<!-- 分组管理表格：编辑分组名称并处理新增、删除操作。 -->
<template>
  <yk-table>
    <yk-table-column property="name" label="分组序号"></yk-table-column>
    <yk-table-column property="value" label="关联文章数"></yk-table-column>
    <yk-table-column property="moment" label="创建时间"></yk-table-column>
    <yk-table-column property="manage" label="操作" align="right"></yk-table-column>
    <template #tbody>
      <tr v-for="item in subsetStore.data" :key="item.id" class="yk-table__row">
        <td class="yk-table__cell">
          <yk-input v-model="item.name" @focus="focueSubset(item)" @blur="blurSubset(item)" />
        </td>
        <td class="yk-table__cell">
          {{ item.value }}
        </td>
        <td class="yk-table__cell">
          {{ item.moment }}
        </td>
        <td class="yk-table__cell text-right">
          <yk-text type="primary" style="cursor: pointer" @click="openDeleteModal(item.id)">删除</yk-text>
        </td>
      </tr>
    </template>
  </yk-table>
  <!-- 只保留一个删除弹窗，避免每行遮罩叠加；外层管理弹窗已有遮罩。 -->
  <yk-modal v-model="deleteVisible" title="删除分组" size="s" :show-mask="false" @onSubmit="confirmDelete"
    @onCloseModal="closeDeleteModal">
    确定删除这个分组吗？确认后不可撤回。
  </yk-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useSubsetStore } from "../../../store/subset";
import { useUserStore } from "../../../store/user";
import { useCode } from "../../../hook/code";
import { updateSubsetApi, deleteSubsetApi } from "../../../api";
import type { SubsetData } from "../../../utils/interface";
import { YkMessage } from '@yike-design/ui';

// store
const subsetStore = useSubsetStore();
const userStore = useUserStore();

// token验证
const { tackleCode } = useCode();

// 每行编辑前的名称 key是id
const originNames = new Map<number | string, string | number>();
// 本次弹窗里改动过的行（存的是 store 里的同一个对象，取到的永远是最新值）
const changedRows = ref<SubsetData[]>([]);
// 是否有改动
let isUpdata = computed(() => changedRows.value.length > 0);

// 当前只打开一个删除弹窗，并记录被点击的分组 id。
const deleteVisible = ref(false);
const deletingId = ref<string | number | null>(null);
const openDeleteModal = (id: string | number) => {
  deletingId.value = id;
  deleteVisible.value = true;
};
// 关闭时清理选中 id，避免下一次误删旧分组。
const closeDeleteModal = () => {
  deleteVisible.value = false;
  deletingId.value = null;
};
// 用户确认后，才向后端提交当前分组的删除请求。
const confirmDelete = () => {
  if (deletingId.value === null) return;
  deleteSubSet(deletingId.value);
};
// 聚焦时事件
const focueSubset = (item: SubsetData) => {
  // 去匹配仓库中是否存在相同项
  if (!originNames.has(item.id)) {
    originNames.set(item.id, item.name);
  }
};
// 失去焦点的事件
const blurSubset = (item: SubsetData) => {
  const origin = originNames.get(item.id);
  if (origin === undefined) return;
  const isChanged = String(origin).trim() !== String(item.name).trim();
  const exists = changedRows.value?.some((row) => row.id === item.id);

  if (isChanged && !exists) {
    changedRows.value?.push(item);
  } else if (!isChanged && exists) {
    changedRows.value = changedRows.value?.filter((row) => row.id !== item.id);
  }
};

/// 提交所有改动过的分组名称，由父组件「确认」按钮调用
const updateSubset = async () => {
  if (!changedRows.value.length) return;
  try {
    const rows = [...changedRows.value];
    const resList: any[] = await Promise.all(
      rows.map((item) =>
        updateSubsetApi({ subsetID: item.id, subsetName: item.name })
      )
    );
    if (!resList.every((res) => tackleCode(res.code) && res.code === 200)) return;
    for (const item of rows) originNames.set(item.id, item.name);
    changedRows.value = [];
    YkMessage({ type: "success", message: "修改成功" });
  } catch (error) {
    console.error("修改分组失败", error);
  }
};
// 把方法暴露给父组件
defineExpose({ updateSubset, isUpdata });

// 删除分组
const deleteSubSet = async (id: string | number) => {
  try {
    const res: any = await deleteSubsetApi({ subsetID: id });
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) return;
    subsetStore.data = subsetStore.data.filter(item => item.id !== id);
    originNames.delete(id);
    changedRows.value = changedRows.value.filter(row => row.id !== id);
    closeDeleteModal();
  } catch (error) {
    console.error("删除分组失败", error);
  }
};
</script>

<style scoped lang="less"></style>
