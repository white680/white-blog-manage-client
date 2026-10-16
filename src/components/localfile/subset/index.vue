<template>
  <!-- 分组组件 subset-->
  <div class="subset">
    <!-- 左部分 -->
    <yk-space>
      <!-- 全部 -->
      <div
        class="subset__menu"
        :class="{ 'subset__menu-actice': selected == '-1all' }"
        @click="changeOption(-1, 'all')"
      >
        全部 {{ subsetStore.count }}
      </div>
      <!-- 发布和未发布 -->
      <div
        class="subset__menu"
        v-for="item in state.data"
        :key="item.id"
        :class="{ 'subset__menu-actice': selected == item.id + 'state' }"
        @click="changeOption(item.id, 'state')"
      >
        {{ item.name }}：{{ item.value }}
      </div>
      <!-- 用户自定义分组 -->
      <div
        class="subset__menu"
        v-for="item in subsetStore.data"
        :key="item.id"
        :class="{ 'subset__menu-actice': selected == item.id + 'subset' }"
        @click="changeOption(item.id, 'subset')"
      >
        {{ item.name }}：{{ item.value }}
      </div>
      <!-- 未分组 -->
      <div
        class="subset__menu"
        :class="{
          'subset__menu-actice':
            selected == subsetStore.excludedSubset.id + 'excludedSubset',
        }"
        @click="changeOption(subsetStore.excludedSubset.id, 'excludedSubset')"
      >
        {{ subsetStore.excludedSubset.name }}：{{ subsetStore.excludedSubset.value }}
      </div>
    </yk-space>
    <!-- 右部分 -->
    <yk-space size="xl">
      <!-- 添加分组 -->
      <div
        @mouseenter="onBubbleEnter"
        @mouseleave="onBubbleLeave"
        @focusin="onBubbleFocusIn"
        @focusout="onBubbleFocusOut"
      >
        <yk-popconfirm
          v-model:open="bubbleOpen"
          trigger="none"
          title="自定义分组"
          placement="bottom"
          :arrow="false"
          @cancel="cancel"
          @confirm="confirm"
        >
          <yk-text type="primary">
            <IconCirclePlusOutline style="margin-right: 4px" />
            新建
          </yk-text>
          <template #content>
            <div style="margin: 8px 4px 16px">
              <yk-input
                show-counter
                :limit="6"
                placeholder="请输入..."
                style="width: 208px"
                v-model="inputValue"
              />
            </div>
          </template>
        </yk-popconfirm>
      </div>
      <!-- 管理分组 -->
      <yk-text type="primary" @click="showModal">
        <IconSettingsOutline />
        管理分组
      </yk-text>
    </yk-space>
    <yk-modal v-model="visible" title="管理分组">
      <SubsetManage />
      <template #footer>
        <yk-space>
          <yk-button @click="showModal" type="secondary">取消</yk-button>
          <yk-button @click="showModal"> 确认 </yk-button>
        </yk-space>
      </template>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { subset, state } from "../../../mock/data";
import { useSubsetStore } from "../../../store/subset";
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";
import SubsetManage from '../subset-manage/index.vue'
// 向父组件传递数据
const emit = defineEmits(["nowSubset"]);

// store
const subsetStore = useSubsetStore();

// 获取分组
const rawSubset = () => {
  subsetStore.data = subset.data.list;
  subsetStore.count = subset.data.count;
};

// 当前选择
const selected = ref<string>("-1all");
// 选择切换方法
const changeOption = (id: number | string, type: string) => {
  if (id + type != selected.value) {
    selected.value = id + type;
    emit("nowSubset", { id, type });
  }
};

// 气泡弹框
const proxy: any = getCurrentInstance()?.proxy;
const bubbleOpen = ref(false);
const bubbleFocused = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const clearCloseTimer = () => {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = undefined;
};
// 管理分组弹窗部分
const visible = ref<boolean>(false);
const showModal = () => {
  visible.value = !visible.value;
};

// 悬停部分codex编写
// 悬停打开；鼠标经过触发区与气泡之间的间隙时，延迟关闭。
const onBubbleEnter = () => {
  clearCloseTimer();
  bubbleOpen.value = true;
};
const onBubbleLeave = () => {
  clearCloseTimer();
  if (bubbleFocused.value) return;
  closeTimer = setTimeout(() => {
    if (!bubbleFocused.value) bubbleOpen.value = false;
  }, 300);
};
// 气泡内有焦点时，鼠标离开也不关闭。
const onBubbleFocusIn = () => {
  bubbleFocused.value = true;
  clearCloseTimer();
  bubbleOpen.value = true;
};
const onBubbleFocusOut = (event: FocusEvent) => {
  const container = event.currentTarget as HTMLElement;
  const next = event.relatedTarget;
  if (next instanceof Node && container.contains(next)) return;
  bubbleFocused.value = false;
  if (!container.matches(":hover")) onBubbleLeave();
};
const closeBubble = () => {
  clearCloseTimer();
  bubbleFocused.value = false;
  bubbleOpen.value = false;
};
// 取消按钮回调
function cancel() {
  closeBubble();
  proxy.$message({ type: "warning", message: "你点击了取消按钮" });
  inputValue.value = "";
}
// 确认按钮回调
function confirm() {
  closeBubble();
  if (inputValue.value) {
    // 模拟数据
    let obj = {
      id: -2,
      name: inputValue.value,
      value: 0,
    };
    subsetStore.data.push(obj);
    inputValue.value = "";
    proxy.$message({ type: "primary", message: "添加成功" });
  } else {
    proxy.$message({ type: "primary", message: "请输入内容" });
  }
}
// 存储气泡框中的input里的值
const inputValue = ref<number | string>();

onMounted(() => {
  rawSubset();
});
onBeforeUnmount(clearCloseTimer);
</script>

<style scoped lang="less">
.subset {
  padding: @space-l @space-xl;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .yk-text {
    cursor: pointer;
  }
  &__menu {
    padding: 0 @space-l;
    background-color: @bg-color-s;
    border-radius: @radius-r;
    line-height: 32px;
    // 用户不可以选中文字
    user-select: none;
    cursor: pointer;
    &-actice {
      background: @pcolor-1;
      color: @pcolor;
      font-weight: 500;
    }
  }
}
</style>
