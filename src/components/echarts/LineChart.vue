<template>
  <div ref="chart" :style="{ height: chartHeight }" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw, watch, onBeforeUnmount } from "vue";
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
//引入折线图、饼图组件
import { LineChart } from "echarts/charts";
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";
// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);
const chart = ref<HTMLDivElement>();
const myChart = ref<echarts.ECharts>();
// 接受父组件传过来的option，和echarts的高度
// 可以根据父组件传过来的option对象生成折线图
const props = defineProps(["data", "chartHeight"]);

const xAxisD = ref<string[]>([]);
const seriesD = ref<number[]>([]);
const option = ref();
const visit = (e: any) => {
  xAxisD.value = [];
  seriesD.value = [];
  for (let i = 0; i < e.length; i++) {
    xAxisD.value.push(e[i].date);
    seriesD.value.push(e[i].count);
  }
  // option 只需构建一次
  option.value = {
    color: ["#2B5AED"],
    grid: {
      top: "4%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      // ECharts 6 起 containLabel 已废弃（告警一的来源），等价写法如下：
      // containLabel: true  ===  outerBoundsMode: 'same' + outerBoundsContain: 'axisLabel'
      outerBoundsMode: "same",
      outerBoundsContain: "axisLabel",
    },
    tooltip:{
        trigger:'item',
        formatter:(params: { name: any; value: any; })=>`${params.name}访问量：${params.value}`
    },
    xAxis: {
      type: "category",
      data: xAxisD.value,
    },
    yAxis: {
      type: "value",
    },
    series: {
      data: seriesD.value,
      type: "line",
      smooth: true,
    },
  };
};

// 统一的渲染入口：有实例就复用，没有才 init（这是告警二的解法）
const renderChart = () => {
  if (!chart.value) return;
  if (!myChart.value || myChart.value.isDisposed()) {
    // ！！！这里必须使用markRaw包裹，否装当页面宽度发生变化的时候控制台会报错
    myChart.value = markRaw(echarts.init(chart.value));
  }
  // 第二个参数 notMerge = true：数据变化时按新 option 完全重绘，避免残留旧系列
  myChart.value.setOption(option.value, true);
};

// 必须是具名函数，否则 removeEventListener 移除不掉
const handleResize = () => myChart.value?.resize();

onMounted(() => {
  visit(props.data);
  renderChart();
  // 监听页面视图变化echart图的宽度变化
  window.addEventListener("resize", handleResize);
});
watch(
  () => props.data,
  (n) => {
    visit(n);
    renderChart();
  }
);

// 组件销毁前一定要取消监听的事件，否则会影响性能和占用内存
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  // 销毁实例，释放 canvas / 内部监听器，避免 DOM 上残留实例
  myChart.value?.dispose();
  myChart.value = undefined;
});
</script>

<style scoped lang="less">
.chart {
  width: 100%;
}
</style>
