<!-- 标签侧栏：展示标签并控制新建、管理弹窗。 -->
<template>
  <!-- 标签组件：显示当前可用标签及管理入口。 -->
  <div class="label">
    <div class="label__title">
      <yk-title :level="4" style="margin:0;">标签</yk-title>
      <yk-space size="xl" style="flex: none">
        <!-- 添加标签 -->
        <div @mouseenter="onBubbleEnter" @mouseleave="onBubbleLeave" @focusin="onBubbleFocusIn"
          @focusout="onBubbleFocusOut">
          <yk-popconfirm v-model:open="bubbleOpen" trigger="none" title="新建标签" placement="bottom" :arrow="false"
            @cancel="cancel" @confirm="confirm">
            <yk-text type="primary"> 新建 </yk-text>
            <template #content>
              <div style="margin: 8px 4px 16px">
                <yk-input show-counter :limit="6" placeholder="请输入..." style="width: 208px" v-model="inputValue" />
              </div>
            </template>
          </yk-popconfirm>
        </div>
        <!-- 管理标签 -->
        <yk-text type="primary" @click="showModal">
          <IconSettingsOutline />
          管理标签
        </yk-text>
      </yk-space>
    </div>
    <!-- 标签 main -->
    <yk-space wrap size="s">
      <yk-tag v-for="item in label" :key="item.id" :class="{ 'label__menu-actice': selected == item.id + 'label' }"
        @click="changeOption(item.id, 'label')">
        {{ item.label_name }}
      </yk-tag>
    </yk-space>
  </div>
  <!-- 管理标签弹窗 -->
  <yk-modal v-model="visible" title="管理标签">
    <labelManage :label="label" @label-deleted="rawlabel()" />
    <template #footer>
      <yk-button @click="showModal"> 确认 </yk-button>
    </template>
  </yk-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";
import type { LabelData } from "../../../utils/interface.ts";
import labelManage from "./label-manage/index.vue";
import { labelApi, addLabelApi } from "../../../api";
import { useCode } from "../../../hook/code";
import { useUserStore } from "../../../store/user.ts";

const userStore = useUserStore();

// code验证
const { tackleCode } = useCode();

// 向父组件传递数据
const emit = defineEmits(["nowlabel"]);

// 当前选择
const selected = ref<string>("-1all");
// 选择切换方法
const changeOption = (id: number | string, type: string) => {
  if (id + type != selected.value) {
    selected.value = id + type;
    emit("nowlabel", { id, type });
  }
};
// 存储标签数据
const label = ref<LabelData[]>([]);
// 获取标签
const rawlabel = () => {
  if (tackleCode(userStore.token)) {
    labelApi({
      token: userStore.token
    }).then((res: any) => {
      label.value = res.data
    })
  }
};

// 气泡弹框
const proxy: any = getCurrentInstance()?.proxy;
const bubbleOpen = ref(false);
const bubbleFocused = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

// 清理上一次延迟关闭任务，避免鼠标重新进入后气泡被旧定时器关闭。
const clearCloseTimer = () => {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = undefined;
};
// 管理标签弹窗的显隐状态。
const visible = ref<boolean>(false);
const showModal = () => {
  visible.value = !visible.value;
};

// 悬停时的气泡显示与焦点保持逻辑
// 悬停打开；鼠标经过触发区与气泡之间的间隙时，延迟关闭。
const onBubbleEnter = () => {
  clearCloseTimer();
  bubbleOpen.value = true;
};
// 鼠标离开触发区后延迟关闭；输入框仍有焦点时保持气泡打开。
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
// 焦点仍在气泡内部移动时不关闭；完全离开后再按悬停状态处理。
const onBubbleFocusOut = (event: FocusEvent) => {
  const container = event.currentTarget as HTMLElement;
  const next = event.relatedTarget;
  if (next instanceof Node && container.contains(next)) return;
  bubbleFocused.value = false;
  if (!container.matches(":hover")) onBubbleLeave();
};
// 确认或取消时统一重置定时器、焦点状态和气泡开关。
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
// 确认按钮回调（新建标签）
function confirm() {
  closeBubble();
  if (inputValue.value) {
    let req = {
      token: userStore.token,
      value: {
        moment: new Date(),
        label_name: inputValue.value,
      }
    };
    if (tackleCode(userStore.token)) {
      addLabelApi(req).then((res: any) => {
        if (res.code === 200) {
          proxy.$message({ type: "primary", message: "添加成功" });
          inputValue.value = "";
          rawlabel();
        }
      })
    }
  } else {
    proxy.$message({ type: "primary", message: "请输入内容" });
  }
}
// 存储气泡框中的input里的值
const inputValue = ref<number | string>();

onMounted(() => {
  rawlabel();
});
onBeforeUnmount(clearCloseTimer);
</script>

<style scoped lang="less">
.label {
  padding: @space-l @space-xl;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  .yk-text {
    cursor: pointer;
  }

  &__title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @space-l;
  }
}
</style>
