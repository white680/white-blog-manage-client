<template>
  <div class="files">
    <div class="files__tool">
      <!-- 左边 -->
      <yk-space>
        <yk-checkbox
          :checked="checkedAll"
          :indeterminate="indeterminate"
          @change="handleChangeAll"
        >
          全选
        </yk-checkbox>
        <yk-text> 已选择3项内容 </yk-text>
        <yk-text type="primary" style="cursor: pointer"> 取消选择 </yk-text>
      </yk-space>
      <!-- 右边 -->
      <yk-space size="xl">
        <IconDeleteOutline size="18px" class="files__tool__delete" />
        <IconSwitchOutline size="18px" class="files__tool__switch" />
      </yk-space>
    </div>
    <div class="files__main">
      <FileItem v-for="item in files" :data="item" :key="item.id" />
    </div>
    <div class="files__Pagination">
      <yk-pagination size="m" :total="count" simple @change="changePage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { mkfile } from "../../../mock/data";
import FileItem from "./files-items/index.vue";
type FileProps = {
  pageSize: number;
  subsetId: number | string;
};

const props = withDefaults(defineProps<FileProps>(), {
  pageSize: 8,
  subsetId: -1,
});

// 头部操作
//  半选
const indeterminate = ref(false);
// 全选
const checkedAll = ref(false);
const handleChangeAll = (value: boolean) => {
  indeterminate.value = false;
  if (value) {
    checkedAll.value = true;
  } else {
    checkedAll.value = false;
  }
};

// 总数
const count = ref<number>(64);
// 数据内容
const files = ref();
type Request = {
  token?: string;
  pageSize: number;
  nowPage: number;
};
const request: Request = {
  pageSize: props.pageSize,
  nowPage: 1,
};

// 获取数据
const drwtData = (e: boolean) => {
  let data = mkfile;
  if (e) {
    count.value = data.count;
  }
  files.value = data.list.slice(
    (request.nowPage - 1) * request.pageSize,
    request.nowPage * request.pageSize
  );
  console.log(files.value);
};
//翻页操作
const changePage = (e: number) => {
  request.nowPage = e;
  drwtData(false);
};

onMounted(() => {
  drwtData(true);
});
</script>

<style scoped lang="less">
.files {
  padding: @space-l;
  background: @bg-color-l;
  border-radius: @radius-m;
  width: 100%;
  &__tool {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: @radius-m;
    padding: @space-l;
    border-radius: @radius-m;
    background: @bg-color-m;
    &__delete {
      cursor: pointer;
      color: @font-color-s;
      &:hover {
        color: @font-color-l;
      }
    }
    &__switch {
      cursor: pointer;
    }
  }
  &__main {
    padding: 24px 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 200px);
    row-gap: 32px;
    column-gap: 24px;
    justify-content: center;
  }
  &__Pagination {
    padding: @space-l 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // border-top: 1px solid @line-color-s;
  }
}
</style>
