<!-- 文件列表：管理分组过滤、分页、批量选择与文件操作。 -->
<template>
  <div class="files">
    <div class="files__tool" v-show="selectFilesId.length > 0">
      <!-- 左边 -->
      <yk-space>
        <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
          全选
        </yk-checkbox>
        <yk-text> 已选择 {{ selectFilesId.length }} 项内容 </yk-text>
        <yk-text type="primary" style="cursor: pointer" @click="cancelSelect">
          取消选择
        </yk-text>
      </yk-space>
      <!-- 右边 -->
      <yk-space size="xl">
        <button type="button" class="files__tool__delete" aria-label="删除所选文件" @click="deleteFiles">
          <IconDeleteOutline size="18px" />
        </button>
        <yk-popconfirm placement="bottomRight" title="请选择分组" :arrow="false" @cancel="cancel" @confirm="confirm"
          trigger="click">
          <template #content>
            <yk-space dir="vertical">
              <yk-scrollbar ref="scrollbar" height="148px" class="subset" style="width: 100%">
                <div class="content">
                  <div v-for="item in subsetStore.data" :key="item.id" class="subset__item"
                    :class="{ subset__seleted: subsetSelectedId === item.id }" @click="changeSubset(item.id)">
                    {{ item.name }} {{ item.value }}
                  </div>
                </div>
              </yk-scrollbar>
            </yk-space>
          </template>
          <IconSwitchOutline size="18px" class="files__tool__switch" />
        </yk-popconfirm>
      </yk-space>
    </div>
    <div class="files__main">
      <FileItem v-for="item in files" :data="item" :key="item.id" @selected="selectFile" @delete="deleteFile"
        @renamed="onFileRenamed" />
    </div>
    <div class="files__Pagination">
      <yk-pagination size="m" :total="count" simple @change="changePage" />
    </div>
    <yk-modal v-model="deleteOpen" title="删除文件" size="s">
      <p>确定删除 {{ pendingDeleteIds.length }} 张未使用图片吗？删除后无法恢复。</p>
      <template #footer>
        <yk-space size="m">
          <yk-button type="secondary" @click="deleteOpen = false">取消</yk-button>
          <yk-button :loading="deleting" @click="confirmDelete">删除</yk-button>
        </yk-space>
      </template>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import "./files.less";
import { onMounted, ref, getCurrentInstance } from "vue";
import { mkfile } from "../../../mock/data";
import type { FileData } from "../../../utils/interface.ts"
import FileItem from "./files-items/index.vue";
import { useSubsetStore } from "../../../store/subset";
import { getFileApi, deleteFileApi, subsetApi } from "../../../api/index.ts";
import { useCode } from "../../../hook/code";
import { useUserStore } from "../../../store/user";

// store
const subsetStore = useSubsetStore();

const userStore = useUserStore();
const { tackleCode } = useCode();

type FileProps = {
  pageSize: number;
  subsetId: number;
};

const props = withDefaults(defineProps<FileProps>(), {
  pageSize: 8,
  subsetId: -1,
});

// 头部操作
/**
 * 选择逻辑：
 *  在用户选择图片之后，会将对应的图片id放置到一个新的数组当中，根据数组是否存在数据判断全选样式的显示
 */
// 被选择的id的数组
const selectFilesId = ref<number[]>([]);
//  半选
const indeterminate = ref(false);
// 全选
const checkedAll = ref(false);
// 全选按钮回调事件
const handleChangeAll = (value: boolean) => {
  indeterminate.value = false;
  selectFilesId.value = [];
  // 点击了全选按钮
  if (value) {
    checkedAll.value = true;
    for (let i = 0; i < files.value.length; i++) {
      files.value[i].selected = true;
      selectFilesId.value.push(files.value[i].id);
    }
  } else {
    checkedAll.value = false;
    for (let i = 0; i < files.value.length; i++) {
      files.value[i].selected = false;
    }
  }
};
// 选择操作
const selectFile = (e: number) => {
  for (let i = 0; i < files.value.length; i++) {
    if (files.value[i].id === e) {
      files.value[i].selected = !files.value[i].selected;
      if (files.value[i].selected) {
        selectFilesId.value.push(e);
      } else {
        // 从数组移除对应项
        selectFilesId.value = selectFilesId.value.filter((item) => {
          return item != e;
        });
      }
      // 半选和全选
      if (selectFilesId.value.length === 0) {
        indeterminate.value = false;
        checkedAll.value = false;
      } else if (selectFilesId.value.length === files.value.length) {
        indeterminate.value = false;
        checkedAll.value = true;
      } else {
        indeterminate.value = true;
        checkedAll.value = false;
      }
    }
  }
};
// 取消选择操作
const cancelSelect = () => {
  selectFilesId.value = [];
  for (let i = 0; i < files.value.length; i++) {
    files.value[i].selected = false;
  }
};
const deleteOpen = ref(false);
const pendingDeleteIds = ref<number[]>([]);
const deleting = ref(false);
// 删除单张操作
const deleteFile = (e: number) => {
  const file = files.value.find((item: any) => item.id === e);
  if (!file || file.inUse) return;
  pendingDeleteIds.value = [e];
  deleteOpen.value = true;
};
// 批量删除
const deleteFiles = () => {
  if (files.value.some((item: any) => item.inUse && selectFilesId.value.includes(item.id))) {
    proxy?.$message({ type: "warning", message: "所选图片包含使用中的文件，请取消选择后再删除" });
    return;
  }
  pendingDeleteIds.value = [...selectFilesId.value];
  deleteOpen.value = pendingDeleteIds.value.length > 0;
};
const confirmDelete = async () => {
  if (deleting.value || !pendingDeleteIds.value.length) return;
  deleting.value = true;
  try {
    const res: any = await deleteFileApi({ token: userStore.token, filesId: pendingDeleteIds.value });
    if (!tackleCode(res.code)) return;
    if (res.code !== 200) throw new Error(res.msg ?? "删除失败");
    deleteOpen.value = false;
    cancelSelect();
    await drwtData(true);
    if (!files.value.length && count.value > 0 && request.nowPage > 1) {
      request.nowPage--;
      await drwtData(true);
    }
    proxy?.$message({ type: "success", message: "文件已删除" });
    try {
      const groups: any = await subsetApi({ token: userStore.token, classify: 2 });
      if (groups.code === 200) {
        subsetStore.data = groups.data.list;
        subsetStore.count = groups.data.count;
      }
    } catch {
      proxy?.$message({ type: "warning", message: "分组数量刷新失败" });
    }
  } catch (error: any) {
    proxy?.$message({ type: "warning", message: error?.response?.data?.msg ?? error?.message ?? "删除失败" });
    if (error?.response?.status === 409) {
      deleteOpen.value = false;
      await drwtData(true);
    }
  } finally {
    deleting.value = false;
  }
};
// 修改成功后同步当前列表，翻页重新请求时仍以数据库结果为准。
const onFileRenamed = ({ id, fileName }: { id: number; fileName: string }) => {
  const file = files.value.find((item: FileData) => item.id === id);
  if (file) file.fileName = fileName;
};

// 总数
const count = ref<number>(64);
// 数据内容
const files = ref();
type Request = {
  token: string;
  pageSize: number;//单页条数；
  nowPage: number;//当前页
  subsetId?: number;//分组
  count?: boolean;
};
const request: Request = {
  token: userStore.token,
  pageSize: props.pageSize,
  nowPage: 1,
  subsetId: props.subsetId,//分组
  count: true

};
const fileList = ref<FileData[]>([]);
const loading = ref(false);
let latestRequest = 0;
// 获取数据
const drwtData = async (e: boolean) => {
  if (!tackleCode(userStore.token)) return;
  const requestId = ++latestRequest;
  loading.value = true;
  fileList.value = [];
  request.count = e;
  try {
    const res: any = await getFileApi(request);
    if (requestId !== latestRequest) return;
    if (res.code !== 200 || !Array.isArray(res.data?.result)) {
      tackleCode(res.code);
      proxy?.$message({ type: "warning", message: "文件获取失败" });
      return;
    }
    files.value = res.data.result.map((item: any) => ({
      id: item.id,
      url: item.url,
      fileName: item.file_name,
      format: item.format,
      subsetId: item.subset_id ?? -1,
      inUse: Boolean(item.in_use),
      selected: false,
    }));
    if (res.data.count >= 0) {
      count.value = res.data.count;
    }
  } catch {
    if (requestId === latestRequest) proxy?.$message({ type: "warning", message: "文件获取失败" });
  } finally {
    if (requestId === latestRequest) loading.value = false;
  }

};

//翻页操作
const changePage = (e: number) => {
  request.nowPage = e;
  drwtData(false);
};


// 气泡框部分
// 分类选择
const subsetSelectedId = ref<number | string>();
// 切换分组
const changeSubset = (e: number | string) => {
  subsetSelectedId.value = e;
};

// 取消按钮回调
const proxy: any = getCurrentInstance()?.proxy;
function cancel() {
  proxy.$message({ type: "warning", message: "你点击了取消按钮" });
}
// 确认按钮回调
function confirm() {
  proxy.$message({ type: "primary", message: "你点击了确认按钮" });
}

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

    &__delete,
    &__switch {
      cursor: pointer;
      color: @font-color-s;

      &:hover {
        color: @font-color-l;
      }
    }

    &__delete {
      border: 0;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      background: transparent;

      &:focus-visible {
        outline: 2px solid @pcolor;
      }
    }

    &__switch {
      cursor: pointer;
    }
  }

  &__main {
    padding: 24px 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
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

.subset__seleted {
  background-color: @pcolor-1;
  color: @pcolor;
  font-weight: 500;

  &:hover {
    background-color: @pcolor-1;
  }
}
</style>
