/**
  * TODO 后续写一个render组件渲染文字模板
 */
<template>
  <div>
    <article
      v-if="renderSection(0)"
      class="guide-base">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          一：配置常用功能
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>进入左上角工作台设置，点击编辑按钮，进入“我的常用功能设置”，自定义您经常使用的功能，您可从系统内任意界面进行功能快速跳转</p>
          </div>
          <div class="img-wrapper">
            <meg-img-container :img-src="baseGifConf.commonUse"></meg-img-container>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          二：快速收藏线索
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>可使用暂存架完成线索的暂存，也可基于收藏内容进行进一步研判，暂存架可以在任意页面打开</p>
          </div>
          <div class="content-desc">
            <meg-img-container :img-src="baseGifConf.shelf"></meg-img-container>
          </div>
        </section>
      </link-scroll-item>
    </article>
    <article
      v-if="renderSection(1)"
      class="guide-control">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          一：配置相机
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              进入资源-相机管理页面
              <!-- 相机管理 -->
              <guide-btn
                :path="controlBtnConf.cameraManage.path"
                :name="controlBtnConf.cameraManage.name">
              </guide-btn>
              ，可单个添加、批量添加（Excel导入，国标平台拉取、视图库拉取）的方式添加相机。
            </p>
            <p>支持对相机的批量激活、停用、变更属性、批量Excel导入变更、批量删除等操作。</p>
            <p>在国标平台拉取时，支持同步国标平台的设备组织，支持过滤已拉取完成的相机。相机同步时，支持对相同国标设备ID的设备进行信息更新。</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.cameraManage"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          二：设置相机小时空
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            经纬度信息正确配置的人脸卡口类型相机具备小时空配置功能，进入相机列表
            <!-- 相机检索 -->
            <guide-btn
              :path="controlBtnConf.cameraManage.path"
              :name="controlBtnConf.cameraManage.name">
            </guide-btn>
            ，点击更多，进入小时空配置界面，可点击圈选，编辑小时空的范围。
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.addCamera"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
    </article>
    <article
      v-if="renderSection(2)"
      class="guide-control">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          使用综合检索
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              当掌握了目标的图片、目标姓名或身份证信息、车牌号码或者目标的其它特点描述，均可使用综合检索完成您想要的信息搜索
              <!-- 综合检索 -->
              <guide-btn
                :path="controlBtnConf.mutipleSearch.path"
                :name="controlBtnConf.mutipleSearch.name">
              </guide-btn>
            </p>
            <p>
              您可使用“有图检索”上传图片，获取相似人车等目标，形成轨迹；也可以通过人脸找到一个人的全息档案或获取到一个人的真实身份；
            </p>
            <p>当您有其它信息时，比如对一个人的特点描述、车牌号码、身份证号等，均可以使用“无图检索”，基于掌握的信息，可以找到对应的目标或真实身份；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.search"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
    </article>
    <article
      v-if="renderSection(3)"
      class="guide-control">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          查看实时报警
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              在这里您可获取到实时报警情况及监控视频信息，能够实时预警可疑人员，快速人工比对预警信息，及时发布警情信息，掌握警情处理进度；
              <!-- 实时报警 -->
              <guide-btn
                :path="controlBtnConf.alarmRealtime.path"
                :name="controlBtnConf.alarmRealtime.name">
              </guide-btn>
            </p>
            <p>您可以订阅您所关注的报警类型或任务，您也可以按需选择地图模式、卡口模式、视频模式、警情模式、结构化模式等监控的方式；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.alarm"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
    </article>
    <article
      v-if="renderSection(4) && cropState"
      class="guide-control">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          一：管控基础操作
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1.底库中导入重点人员
              <!-- 底库管理 -->
              <guide-btn
                :path="controlBtnConf.portraitLibrary.path"
                :name="controlBtnConf.portraitLibrary.name">
              </guide-btn>
            </p>
            <p>（重要）根据关注的、需要分析挖掘的重点人员类型，导入对应的底库，并选择底库业务属性；</p>
            <p>数据关联：重点人员自动匹配档案，档案根据底库业务属性自动关联战法；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.libraryManage"></meg-img-container>
            </div>
            <p>
              2.创建区域
              <!-- 区域管理 -->
              <guide-btn
                :path="controlBtnConf.deviceRegion.path"
                :name="controlBtnConf.deviceRegion.name">
              </guide-btn>
            </p>
            <p>（重要）根据前期和用户沟通，将需要分析关注的重点区域在系统里标注并创建，如三站一场、娱乐场所、商圈、医院等，系统将根据您选择的区域类型匹配和计算；</p>
            <p>数据关联：新建区域方便模型规则的配置；区域信息影响防控单元业务的使用；区域标签则影响防控单元类型的数据计算；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.areaManage"></meg-img-container>
            </div>
            <p>
              3.调整内置战法参数
              <!-- 大数据战法 -->
              <guide-btn
                :path="controlBtnConf.tactics.path"
                :name="controlBtnConf.tactics.name">
              </guide-btn>
            </p>
            <p>（重要）根据掌握的重点人员类型选择相应的人员底库，并根据他们的行为特征调整战法参数配置；</p>
            <p>具体参数填写说明见编辑战法内页；</p>
            <p>数据关联：战法参数配置会影响人员识别战法、团伙识别等模型的后续挖掘；战法的防控单元属性会影响防控单元数据的计算；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.tactics"></meg-img-container>
            </div>
            <p>
              4.（资深用户）新建自定义战法
              <!-- 新建战法 -->
              <guide-btn
                :path="controlBtnConf.tactics1.path"
                :name="controlBtnConf.tactics1.name">
              </guide-btn>
            </p>
            <p>（重要）如内置战法不满足使用，则可以通过新建战法配置，从而挖掘其他行为特征的重点人员；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.addTctics"></meg-img-container>
            </div>
            <p>
              5.设置团伙规则模型
              <!-- 群体管理 -->
              <guide-btn
                :path="controlBtnConf.groupSetting.path"
                :name="controlBtnConf.groupSetting.name">
              </guide-btn>
            </p>
            <p>（重要）团伙在对应的群体下设置，规则有默认值，可根据实际情况对参数进行调整；</p>
            <p>数据关联：系统根据团伙模型自动从群体中识别团伙，在团伙管控中查看分析结果；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.groupManage"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          二、挖掘可疑团伙
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1、查看群体规律以及团伙情况
              <!-- 群体管控 团伙管控 -->
              <guide-btn
                :path="controlBtnConf.focusGroup.path"
                :name="controlBtnConf.focusGroup.name">
              </guide-btn>
              <guide-btn
                :path="controlBtnConf.gangControl.path"
                :name="controlBtnConf.gangControl.name">
              </guide-btn>
            </p>
            <p>查找您要关注的群体，详情页可查看相应的规律及当前群体关联的团伙信息；</p>
            <p>也可在团伙管控中直接查看系统自动推荐的团伙，详情页可查看团伙成员之间的关联和规律，必要时，可对单个团伙进行标记并持续关注；</p>
            <p>数据关联：战法匹配的人员行为配置影响群体和团伙的人员构成；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.groupControl"></meg-img-container>
            </div>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.gangControl"></meg-img-container>
            </div>
            <p>
              2、调整群体及团伙模型参数
              <!-- 群体设置 -->
              <guide-btn
                :path="controlBtnConf.groupSetting.path"
                :name="controlBtnConf.groupSetting.name">
              </guide-btn>
            </p>
            <p>如果系统无自动匹配数据或数据不准确，可根据实际情况调整群体和团伙的配置参数；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.groupSetting"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          三、管控关注人员
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1、查看辖区关注人员活动趋势
              <!-- 人员管控 -->
              <guide-btn
                :path="controlBtnConf.focusSituation.path"
                :name="controlBtnConf.focusSituation.name">
              </guide-btn>
            </p>
            <p>系统提供了对匹配战法关注人员的总体活动趋势页面，可以通过查看不同时间段，整体掌握其活动规律；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.peopleControl"></meg-img-container>
            </div>
            <p>
              2、查找具体关注人员档案
              <!-- 关注人员档案 -->
              <guide-btn
                :path="controlBtnConf.focusDocument.path"
                :name="controlBtnConf.focusDocument.name">
              </guide-btn>
            </p>
            <p>通过不同的条件查找辖区内需要管控的关注人员，从而定位具体的人员档案，查看档案可掌握单个人员的活动情况；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.attentionRecord"></meg-img-container>
            </div>
            <p>
              3、调整关注人员参数、阈值
              <!-- 大数据研判 -->
              <guide-btn
                :path="controlBtnConf.tactics.path"
                :name="controlBtnConf.tactics.name">
              </guide-btn>
            </p>
            <p>如未搜索到想要关注的关注人员，或者数据与实际情况有出入，可以通过在人员管控战法中查找到相关的战法，并编辑调整关注人员的参数和阈值；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.dataJudge"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          四、管控重点区域
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1、管控辖区整体态势
              <!-- 防空单元管控 -->
              <guide-btn
                :path="controlBtnConf.unitSituation.path"
                :name="controlBtnConf.unitSituation.name">
              </guide-btn>
            </p>
            <p>系统提供了整个辖区态势情况的概览页面，分析区域内整体治安风险情况；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.unitState"></meg-img-container>
            </div>
            <p>
              2、聚焦高关注指数的防空单元
              <!--  防控单元档案 -->
              <guide-btn
                :path="controlBtnConf.unitDocument.path"
                :name="controlBtnConf.unitDocument.name">
              </guide-btn>
            </p>
            <p>高关注指数的防空单元意味着治安风险高，需要特别关注，可查看具体防控单元档案，进一步分析和研判区域内治安风险情况；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.unitRecord"></meg-img-container>
            </div>
            <p>
              3、调整防控单元关联配置
              <!-- 区域管理 -->
              <guide-btn
                :path="controlBtnConf.deviceRegion.path"
                :name="controlBtnConf.deviceRegion.name">
              </guide-btn>
            </p>
            <p>如果防控单元数据与实际情况有出入，首先可以查看区域内是否加入了对应的相机；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.unitManage1"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          五、管控潜在风险网格
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1、关注高关注指数网格
              <!-- 网格管控 -->
              <guide-btn
                :path="controlBtnConf.gridControl.path"
                :name="controlBtnConf.gridControl.name">
              </guide-btn>
            </p>
            <p>系统根据对辖区网格化，自动识别出高关注指数网格，可重点关注高关注指数的网格，并标记创建区域（防控单元），加强治安管控措施；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.gridManage"></meg-img-container>
            </div>
            <p>
              2、网格调整
              <!--  网格配置 -->
              <guide-btn
                :path="controlBtnConf.gridSetting.path"
                :name="controlBtnConf.gridSetting.name">
              </guide-btn>
            </p>
            <p>网格大小和边界有默认值，可以手动调整网格的大小，重新生成并计算网格内的数据；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.gridSetting"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
    </article>
    <article
      v-if="renderSection(5) && cropState"
      class="guide-control">
      <link-scroll-item class="content-section">
        <h2 class="content-title">
          一：可疑人员深挖扩线
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1.查找档案
              <!--  全息档案 -->
              <guide-btn
                :path="controlBtnConf.document.path"
                :name="controlBtnConf.document.name">
              </guide-btn>
            </p>
            <p>如果已经掌握部分嫌疑人线索，可以通过档案检索，找出这些嫌疑人的档案；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.record"></meg-img-container>
            </div>
            <p>
              2.档案详情、深度研判
            </p>
            <p>查看嫌疑人的档案，查看其活动规律和关系网络，进一步进行深度研判，找出更多的线索或相关人员；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.recordDetail"></meg-img-container>
            </div>
          </div>
        </section>
      </link-scroll-item>
      <link-scroll-item>
        <h2 class="content-title">
          二：易发案区域治安防控
        </h2>
        <section class="menu-section-1 content-body">
          <div class="content-desc">
            <p>
              1.查找防控单元
              <!--  防控单元档案 -->
              <guide-btn
                :path="controlBtnConf.unitDocument.path"
                :name="controlBtnConf.unitDocument.name">
              </guide-btn>
            </p>
            <p>对于案件频发的区域，可以通过使用防控单元档案定向查找；</p>
            <div class="img-wrapper">
              <meg-img-container :img-src="baseGifConf.unitRecord1"></meg-img-container>
            </div>
            <p>
              2.辅助分析、治安防控
            </p>
            <p>查看案件频发区域的档案，分析其中活动人员行为规律，系统提供了该区域的多维度特征信息，辅助针对性地对区域进行治安防控；</p>
          </div>
        </section>
      </link-scroll-item>
    </article>
  </div>
</template>
<script>
import stateMixin from '@/mixins/state.mixin';
import { LinkScrollItem } from '@/components/link-scroll';
import GuideBtn from './guide-btn';
import { baseGifConf, controlGifConf } from './guide-gif';
import {
  controlBtnConf, sectionEnum
} from './const';

export default {
  components: {
    LinkScrollItem,
    GuideBtn
  },
  mixins: [stateMixin],
  props: {
    activeSection: {
      type: String,
      default: sectionEnum[0]
    }
  },
  state() {
    return {
      controlBtnConf,
      baseGifConf,
      controlGifConf
    };
  },
  computed: {
    cropState() {
      return (+this.$store.getters.systemByType('dualPlatformType').value) === 1 && (+this.$store.getters.systemByType('cropScene').value) === 0;
    }
  },
  created() {

  },
  methods: {
    renderSection(index) {
      console.log(index, sectionEnum[index], this.activeSection);
      return sectionEnum[index] === this.activeSection;
    }
  }
};
</script>
<style lang="scss" scoped>
.img-wrapper {
  margin-top: 20px;
}
</style>
