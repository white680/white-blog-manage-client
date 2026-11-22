<!-- 饼图封装：按传入数据绘制图表并在组件销毁时释放实例。 -->
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
  LegendComponent,
} from "echarts/components";
//引入折线图、饼图组件
import { PieChart } from "echarts/charts";
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
  LegendComponent,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);
const chart = ref<HTMLDivElement>();
const myChart = ref<echarts.ECharts>();
// 接受父组件传过来的option，和echarts的高度
// 可以根据父组件传过来的option对象生成折线图
const props = defineProps(["data", "title", "chartHeight"]);

const option = ref();
// 汇总扇区数值作为中心标题，并根据传入数据生成饼图配置。
const survey = (e: any) => {
  let total: number = 0;
  for (let i = 0; i < e.length; i++) {
    total += e[i].value;
  }
  option.value = {
    color: ["#2B5AED", "#FA5247", "#1CCBB6", "#F625AF", "#FFB435"],
    title: {
      text: total, //主标题文本
      subtext: props.title, //副标题文本
      left: "center",
      top: "34%",
      textStyle: {
        fontSize: 32,
        color: "#686B73",
        align: "center",
      },
      subtextStyle: {
        fontSize: 14,
        color: "#686B73",
      },
    },
    tooltip:{
        trigger:'item'
    },
    legend:{
        show:false,
        // orient:'vertical',
        bottom:0,
        // right:0,
        icon:'circle'
    },
    series:[
        {
            // name:'设备总数',
            type:'pie',
            radius:['60%','76%'],
            avoidLabelOverlap:true,
            // ECharts 4.0+ 取消了 label.normal 层级，样式直接写在 label 上
            label:{
                show:true,
            },
            // 4.0+ 改为 emphasis.label，高亮态样式统一挂在 emphasis 里
            emphasis:{
                label:{
                    show:true,
                    fontSize:40,
                    fontWeight:'bold'
                }
            },
            labelLine:{
                show:false
            },
            data:e,
        }
    ]
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
  survey(props.data);
  renderChart();
  // 监听页面视图变化echart图的宽度变化
  window.addEventListener("resize", handleResize);
});
watch(
  () => props.data,
  (n) => {
    survey(n);
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
