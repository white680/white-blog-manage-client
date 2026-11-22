<!-- 总览图表区：根据时间范围切换访问数据的图表展示。 -->
<template>
  <yk-space dir="vertical" size="xl" class="datas" style="width: 100%; --pcolor: #8a3ee8">
    <div class="data-card">
      <div class="data-card__title">
        <p>访问量</p>
        <yk-radio-group
          v-model="LineRadio"
          type="button"
          :solid="true"
          @change="getVisit"
        >
          <yk-radio value="week">近一周</yk-radio>
          <yk-radio value="moon">近一月</yk-radio>
        </yk-radio-group>
      </div>
      <LineChart :data="visitData" chart-height="300px" />
    </div>
    <div class="data-card data-card--pie">
      <div class="data-card__title">
        <p>数据检测</p>
        <yk-radio-group v-model="PieRadio" type="button" :solid="true">
          <yk-radio value="week">近一周</yk-radio>
          <yk-radio value="moon">近一月</yk-radio>
        </yk-radio-group>
      </div>
      <div class="piechart">
        <PieChart :data="survey.data.device" title="设备总数" chart-height="208px" class="pie"/>
        <PieChart :data="survey.data.website" title="访问总数" chart-height="208px" class="pie"/>
      </div>
    </div>
  </yk-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LineChart, PieChart } from "../echarts/index";
import { visit, survey } from "../../mock/data";
const LineRadio = ref("week");
const PieRadio = ref("week");
// 访问量
const visitData = ref([]);

// 根据单选值决定展示近 7 天还是完整的 Mock 访问记录，并交给折线图渲染。
const getVisit = (e: string) => {
  let data = visit.data;
  if (e === "week") {
    data = data.slice(0, 7);
  }
  visitData.value = data;
};

onMounted(() => {
  getVisit(LineRadio.value);
});
</script>

<style scoped lang="less">
.datas {
  height: 100%;

  /* 两块卡片等高：高度取父级 .main-contain 上定义的 --block-h
     （16×2 padding + 标题行 + 400px 折线图 ≈ 486px），且禁止被拉伸/压缩 */
  .data-card {
    height: var(--block-h, 486px);
    box-sizing: border-box; // 含 padding，保证两块渲染高度严格一致
    flex: none;
  }

  // 饼图卡片：图表区撑满标题行以外的空间，两个饼图垂直居中
  .data-card--pie {
    display: flex;
    flex-direction: column;

    .piechart {
      flex: 1;
    }
  }
}

.data-card {
  padding: @space-l;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 100%;

  .data-card__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: @space-l;

    p {
      .font-xl();
      font-weight: 600;
      color: font-color-l;
    }
  }
  .piechart {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .pie {
      flex: 1;
    }
  }
}
</style>
