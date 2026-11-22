<!-- 标签管理表格：复制传入数据后在弹窗内编辑，避免直接改动父级数组。 -->
<template>
  <yk-table>
    <yk-table-column property="name" label="标签名称"></yk-table-column>
    <yk-table-column property="moment" label="创建时间"></yk-table-column>
    <yk-table-column property="manage" label="操作" align="right"></yk-table-column>
    <template #tbody>
      <tr v-for="(item, index) in labelData" :key="index" class="yk-table__row">
        <td class="yk-table__cell">
          {{ item.label_name }}
        </td>
        <td class="yk-table__cell">
          {{ item.moment }}
        </td>
        <td class="yk-table__cell text-right">
          <yk-text type="primary" style="cursor: pointer" @click="deletelabel(item.id)">删除</yk-text>
        </td>
      </tr>
    </template>
  </yk-table>
</template>

<script setup lang="ts">
import type { LabelData } from "../../../../utils/interface";
import { deleteLabelApi } from "../../../../api/index";
import { ref, watch, getCurrentInstance } from "vue";
import { useCode } from "../../../../hook/code";
import { useUserStore } from "../../../../store/user";

const userStore = useUserStore();

// code验证
const { tackleCode } = useCode();

// 气泡弹框
const proxy: any = getCurrentInstance()?.proxy;
// 传递子组件删除标签成功的信号
const emit = defineEmits(["label-deleted"]);
type labelProps = {
  // 父组件传入的是整个标签数组。
  label: LabelData[];
};
const props = withDefaults(defineProps<labelProps>(), {});
// 当前标签数组
const labelData = ref<LabelData[]>([]);
// 删除标签
const deletelabel = (e: string | number) => {
  if (tackleCode(userStore.token)) {
    let req = {
      token: userStore.token,
      labelId: e
    }
    deleteLabelApi(req).then((res: any) => {
      if (res.code === 200) {
        labelData.value = labelData.value.filter((obj: { id: string | number }) => {
          return obj.id !== e;
        });
        proxy.$message({ type: "success", message: "删除成功" });
        // 通知父组件，删除成功
        emit("label-deleted");
      } else {
        proxy.$message({ type: "success", message: "删除失败" });
      }
    })
  }
};

watch(
  () => props.label,
  (e) => {
    // 逐项复制，弹窗内删除时不直接修改父组件的数组。
    labelData.value = e.map((item) => ({ ...item }));
  },
  { immediate: true, deep: true }
);
</script>

<style scoped lang="less"></style>
