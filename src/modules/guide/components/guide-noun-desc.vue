<template>
  <article class="guide-noun-desc">
    <link-scroll-item>
      <p
        v-for="(item,index) in content"
        class="desc-item"
        :key="index">
        {{ item }}
      </p>
    </link-scroll-item>
  </article>
</template>
<script>
import stateMixin from '@/mixins/state.mixin';
import { LinkScrollItem } from '@/components/link-scroll';

export default {
  components: {
    LinkScrollItem
  },
  mixins: [stateMixin],
  data() {
    return {
      content: [
        '1.防控单元：需要进行重点防控、数据分析挖掘的区域，对应区域管理中创建的区域；',
        '2.网格：在用户给定范围内按照设定网格大小，生成矩形控件，当匹配到相机（不属于任一区域的相机）后称为网格；',
        '3.全息档案：利用人像抓拍进行聚类归档，对应真实世界的“一个人” ，并对档案进行深入分析，提供多维度的功能应用等；',
        '4.关注人员：经过战法计算后，符合战法计算规则的人员；',
        '5.群体：具有同一种战法的一类人员的集合，档案匹配战法超过阈值次数后加入群体；',
        '6.团伙：基于群体内的人员及亲密度积分模型，系统自动挖掘出具有嫌疑、相互之间有联系的一部分人员；',
        '7.人员管控战法：技战法分为系统默认技战法和自定义技战法。从用户到行业专家，都对大量应用案例进行分析，提炼出的一些经验规则；',
        '8.关系图谱：人和人之间由亲密度关系构成的关系拓扑，由人员（顶点）、亲密度（边）组成的图谱；',
        '9.亲密度：表示两个人之间的亲密关系，通过不同时段、不同地点的同行累计积分所得。 亲密度默认为 两个档案两张抓拍间隔不超过30S，且自然时间5分钟内只会记录一次；',
        '10.关注度：表示人员应受的关注程度，人员底库基础积分、异常行为积分三部分组成；',
        '11.活跃度：用来表示人员近期活动频次的数值，默认为近7天的活动次数之和；',
        '12.异常行为：选择某几个战法作为异常行为，每完成一次该战法及算，匹配该战法的人员记录一次异常行为；',
      ]
    };
  }
};
</script>
<style lang="scss" scoped>

</style>
