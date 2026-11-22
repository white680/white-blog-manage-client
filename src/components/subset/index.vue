<!-- 分组栏：展示全部、状态和自定义分组，并维护当前选中项。 -->
<template>
  <!-- 分组组件 subset-->
  <div class="subset">
    <!-- 左部分 -->
    <yk-space wrap>
      <!-- 全部 -->
      <div class="subset__menu" :class="{ 'subset__menu-actice': selected == '-1all' }"
        @click="changeOption(-1, 'all')">
        全部 {{ subsetStore.count }}
      </div>
      <!-- 发布和未发布 -->
      <template v-if="!props.groupsOnly">
        <div class="subset__menu" v-for="item in stateList" :key="item.id"
          :class="{ 'subset__menu-actice': selected == item.id + 'state' }" @click="changeOption(item.id, 'state')">
          {{ item.name }}：{{ item.value }}
        </div>
      </template>
      <!-- 用户自定义分组 -->
      <div class="subset__menu" v-for="item in subsetStore.data" :key="item.id"
        :class="{ 'subset__menu-actice': selected == item.id + 'subset' }" @click="changeOption(item.id, 'subset')">
        {{ item.name }}：{{ item.value }}
      </div>
      <!-- 未分组 -->
      <div v-if="!props.groupsOnly" class="subset__menu" :class="{
        'subset__menu-actice':
          selected == subsetStore.excludedSubset.id + 'excludedSubset',
      }" @click="changeOption(subsetStore.excludedSubset.id, 'excludedSubset')">
        {{ subsetStore.excludedSubset.name }}：{{ subsetStore.excludedSubset.value }}
      </div>
    </yk-space>
    <!-- 右部分 -->
    <yk-space v-if="!props.groupsOnly" size="xl" style="flex: none">
      <!-- 添加分组 -->
      <div @mouseenter="onBubbleEnter" @mouseleave="onBubbleLeave" @focusin="onBubbleFocusIn"
        @focusout="onBubbleFocusOut">
        <yk-popconfirm v-model:open="bubbleOpen" trigger="none" title="自定义分组" placement="bottom" :arrow="false"
          @cancel="cancel" @confirm="confirm">
          <yk-text type="primary">
            <IconCirclePlusOutline style="margin-right: 4px" />
            新建
          </yk-text>
          <template #content>
            <div style="margin: 8px 4px 16px">
              <yk-input show-counter :limit="6" placeholder="请输入..." style="width: 208px" v-model="inputValue" />
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
    <yk-modal v-if="!props.groupsOnly" v-model="visible" title="管理分组">
      <SubsetManage ref="subsetManageRef" />
      <template #footer>
        <yk-space>
          <yk-button @click="showModal" type="secondary">取消</yk-button>
          <yk-button @click="onConfirm"> 确认 </yk-button>
        </yk-space>
      </template>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { useSubsetStore } from "../../store/subset.ts";
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";
import SubsetManage from "./subset-manage/index.vue";
import { subsetApi, articleStateApi, addSubsetApi } from "../../api/index.ts";
import { useCode } from "../../hook/code.ts";
import { useUserStore } from "../../store/user.ts";

const userStore = useUserStore();
// token验证
const { tackleCode } = useCode();

// 向父组件传递数据
const emit = defineEmits(["nowSubset"]);

// store
const subsetStore = useSubsetStore();

// 存储气泡框中的input里的值
const inputValue = ref<number | string>();

let stateList = ref([
  { id: 0, name: "已发布", value: 0 },
  { id: 1, name: "未发布", value: 0 },
]);

const props = defineProps<{
  classify: number;
  groupsOnly?: boolean;
}>()

const subsetManageRef = ref<any>();

// 获取分组
const rawSubset = () => {
  let request = {
    token: userStore.token,
    classify: props.classify, //文章分组
  };
  if (tackleCode(request.token)) {
    subsetApi(request).then((res: any) => {
      if (tackleCode(res.code)) {
        subsetStore.data = res.data.list;
        subsetStore.count = res.data.count;
      }
    });
  }
};

// 根据当前类型获取已发布和未发布数量，避免图库显示文章的统计值。
const rawArticleState = () => {
  articleStateApi({ token: userStore.token, classify: props.classify }).then((res: any) => {
    if (!tackleCode(res.code)) return;

    stateList.value[0].value =
      res.data.find((item: { id: number; value: number }) => item.id === 1)?.value ?? 0;
    stateList.value[1].value =
      res.data.find((item: { id: number; value: number }) => item.id === 0)?.value ?? 0;
  });
};

// 当前选择
const selected = ref<string>("-1all");
// 选择切换方法
const changeOption = (id: number | string, type: string) => {
  if (props.groupsOnly && selected.value === id + type) {
    selected.value = "-1all";
    emit("nowSubset", { id: -1, type: "all" });
    return;
  }
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

// 清理上一次延迟关闭任务，避免鼠标重新进入后气泡被旧定时器关闭。
const clearCloseTimer = () => {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = undefined;
};
// 管理分组弹窗部分
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
// 新建分组确认按钮回调 addSubsetApi
function confirm() {
  closeBubble();
  let req = {
    token: userStore.token,
    value: {
      moment: new Date(),
      classify: props.classify,
      subset_name: inputValue.value,
    },
  };
  if (inputValue.value) {
    if (tackleCode(req.token)) {
      addSubsetApi(req).then((res: any) => {
        if (res.code === 200) {
          let data = {
            id: res.data,
            name: inputValue.value as string | number,
            value: 0,
          };
          subsetStore.data.push(data);
          inputValue.value = "";
          proxy.$message({ type: "primary", message: "添加成功" });
          rawSubset();
        }
      });
    }
  } else {
    proxy.$message({ type: "primary", message: "请输入内容" });
  }
}
// 管理窗口，确认按钮回调
const onConfirm = () => {
  subsetManageRef.value?.updateSubset(); // 提交改过的分组
  showModal();
};

onMounted(() => {
  rawSubset();
  if (!props.groupsOnly) rawArticleState();
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
