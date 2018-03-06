<template>
  <div class="my_echarts" :id="id" :style="echartStyle" @mousedown="handlerStart">
    <div class="dragTitle">
      <h2 class="dragHandler"></h2>
      <div>
        <a class="min" @click="MinBtn" href="javascript:;" title="最小化"></a>
        <a class="max" @click="MaxBtn" href="javascript:;" title="最大化"></a>
        <a class="revert" @click="RevertBtn" href="javascript:;" title="还原"></a>
        <a class="close" @click="close" href="javascript:;" title="关闭"></a>
      </div>
    </div>
    <div class="resizeL" @mousedown="resize($event,true, false, false, true)"></div>
    <div class="resizeT" @mousedown="resize($event,false, true, true, false)"></div>
    <div class="resizeR" @mousedown="resize($event,false, false, false, true)"></div>
    <div class="resizeB" @mousedown="resize($event,false, false, true, false)"></div>
    <div class="resizeLT" @mousedown="resize($event,true, true, false, false)"></div>
    <div class="resizeTR" @mousedown="resize($event,false, true, false, false)"></div>
    <div class="resizeBR" @mousedown="resize($event,false, false, false, false)"></div>
    <div class="resizeLB" @mousedown="resize($event,true, false, false, false)"></div>
    <!--echarts实例容器-->
    <div class="content" :data-type="type"></div>
  </div>
</template>

<script>
/*echarts主题导入*/
import echartsGl from 'echarts-gl'
import theme from 'echarts/theme/dark'
import world from 'echarts/map/js/world'
import china from 'echarts/map/js/china'
export default {
  props: {
    data: {/*原始数据信息*/
      /**list与data的区别,data需要props属性传入,list是拖拽绑定的数组*/
      type: Object,
      default() {
        return {};
      }
    },
    type: {/*图表类型*/
      type: String,
      default: "scatter"
    },
    css: {
      type: Object,
      default() {
        return {
          width: "100%",
          height: "100%"
        };
      }
    },
    option: {/*修改,以及外部调节的图表样式传入*/
      type: Object
    }
  },
  data() {
    return {
      id: "echart_" + Number(Math.random().toString().substr(3, 12) + Date.now()).toString(36),
      parentDom: null,
      instanceId: null,
      isData: false,
      list: [],
      echartsOption: {},
      /*需要坐标轴的图形*/
      axis: ["scatter", "line", "bar", "parallel", "candlestick", "area", "table"],
      /*需要的图形*/
      /*需要的图形*/
      axis1: ["tree"],/*一列数据,树状图,(组织结构树)*/
      axis2: ["scatter", "line", "bar"],/*两列数据,散点,折线,柱状图,(x,y)*/
      axis3: ["pie", "gauge"],/*两列数据,饼图,仪表,(name,value)*/
      axis4: ["radar", "heatmap", "map"],/*两列数据,雷达图,热力图,地图(坐标,value)*/
      axis5: ["parallel", "candlestick", "calendar"],/*未分类,K线图,平行坐标,日历图*/
      map3D: ["map3D", "time", "surface", "bar3D", "scatter3D"],/**平面3D地图,动态时间图,3D面图,3D柱图,3D散点图*/
      screenX: null,
      screenY: null,
      resizeFlag: [],/**target,isLeft,isTop,lockX,lockY*/
    };
  },
  computed: {
    echartStyle: {
      get() {
        var html = "";
        for (let key in this.css) {
          html += key + ":" + this.css[key] + ";";
        }
        return html;
      }
    },
    localData: {
      get() {
        return this.data
      }
    }
  },
  created() {
    /*创建时判断是否传入数据,使用默认图表,只执行一次*/
  },
  mounted() {
    if (!this.option) {
      this.parentDom = document.getElementById(this.id).parentElement;
      this.parentDom.style.zIndex = 999;/*起始让新增的容器标签位于最高*/
      this.parentDom.style.position = "absolute";
      var length = this.parentDom.parentElement.children.length - 1;
      this.parentDom.style.top = (Math.floor(length / 3) * 25) + "%";
      this.parentDom.style.left = (length % 3 * 33.33332) + "%";
      this.parentDom.style.width = "33.33333%";
      this.parentDom.style.height = "25%";
      /**注册主题*/
      if (this.map3D.some((item) => item == this.type)) {
        this.instanceId = this.$echarts.init(document.querySelector("#" + this.id + " .content"), "dark");
      } else {
        this.instanceId = this.$echarts.init(document.querySelector("#" + this.id + " .content"));
      }
      this.$emit("creatCanvas", (() => {
        return {
          instance: this.instanceId,
          type: this.type
        }
      })());
    } else {
      this.instanceId = this.$echarts.init(document.querySelector("#" + this.id + " .content"));
    }
    this.instanceId.showLoading();
    this.echartsOption = this.option || (this.genOption());
    this.instanceId.setOption(this.echartsOption);
    this.instanceId.hideLoading();
    /**窗口重置的监听*/
    window.addEventListener("resize", () => {
      throttle(this.instanceId.resize(), 100);
    })
    var throttle = function(fn, delay) {
      var timer = null;
      return function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
          fn();
        }, delay);
      }
    };
    /**鼠标弹起,移除事件 */
    window.addEventListener("mouseup", () => {
      this.handlerEnd();
    })
  },
  methods: {
    selectedEchart() {
      this.selected(this.instanceId);
    },
    genOption() {/*赋予设置*/
      /*在这里依据sType的类型实现不同类型的渲染*/
      let me = this;
      if (!me.list) {
        /*如果list没有传入过数值,使用默认数据*/
      }
      var option = {};
      if (this.map3D.some((item) => item == this.type)) {

      } else {
        option = {
          title: { /**标题 */
            text: me.type,
            subtext: "",
            subtextStyle: {
              fontWeight: "lighter"
            }
          },
          grid: {/**/
            left: "10%",
            top: "30",
            right: "10%",
            bottom: "20"
          },
          legend: { /**图例组件标记 */
            right: 5,
            top: 20,
            bottom: 5,
            data: ["销量"]
          },
          tooltip: { /**提示框组件 */
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}",
            axisPointer: {
              type: 'line'
            }
          },
          xAxis: {
            show: false,
            boundaryGap: "5%",
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            splitNumber: 20,
            name: "分类",
            nameLocation: "end",
            nameGap: 2,
            minInterval: 1,
            data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
          },
          yAxis: {
            show: false,
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          series: [/**数据系列,指定图表类型 */
            {
              name: "销量",
              type: this.type,
              data: [5, 20, 36, 10, 10, 20]
            }
          ]
        };
      }
      /*在坐标轴类型数组中查找是否需要某些功能*/
      if (this.axis.some((item) => item == this.type)) {
        option.xAxis.show = true;
        option.yAxis.show = true;
        option.tooltip.axisPointer.type = "cross"
      }
      if (this[this.type + "Option"]) {/**根据对应的type生成option*/
        option = this[this.type + "Option"](option);
      }
      return option;
    },
    selected(item) {/**当前实例被选中*/
      // console.log(this.list);
    },
    treeOption(option) {/**树状图 */
      option.tooltip = {
        trigger: 'item',
        triggerOn: 'mousemove'
      };
      option.series = [
        {
          type: 'tree',
          data: [{
            "name": "flare",
            "children": [
              {
                "name": "analytics",
                "children": [
                  {
                    "name": "cluster",
                    "children": [
                      { "name": "AgglomerativeCluster", "value": 3938 },
                      { "name": "CommunityStructure", "value": 3812 },
                      { "name": "HierarchicalCluster", "value": 6714 },
                      { "name": "MergeEdge", "value": 743 }
                    ]
                  },
                  {
                    "name": "graph",
                    "children": [
                      { "name": "BetweennessCentrality", "value": 3534 },
                      { "name": "LinkDistance", "value": 5731 },
                      { "name": "MaxFlowMinCut", "value": 7840 },
                      { "name": "ShortestPaths", "value": 5914 },
                      { "name": "SpanningTree", "value": 3416 }
                    ]
                  },
                  {
                    "name": "optimization",
                    "children": [
                      { "name": "AspectRatioBanker", "value": 7074 }
                    ]
                  }
                ]
              },
              {
                "name": "animate",
                "children": [
                  { "name": "Easing", "value": 17010 },
                  { "name": "FunctionSequence", "value": 5842 },
                  {
                    "name": "interpolate",
                    "children": [
                      { "name": "ArrayInterpolator", "value": 1983 },
                      { "name": "ColorInterpolator", "value": 2047 },
                      { "name": "DateInterpolator", "value": 1375 },
                      { "name": "Interpolator", "value": 8746 }
                    ]
                  }
                ]
              },
              {
                "name": "display",
                "children": [
                  { "name": "DirtySprite", "value": 8833 },
                  { "name": "LineSprite", "value": 1732 },
                  { "name": "RectSprite", "value": 3623 },
                  { "name": "TextSprite", "value": 10066 }
                ]
              },
              {
                "name": "flex",
                "children": [
                  { "name": "FlareVis", "value": 4116 }
                ]
              }
            ]
          }],
          top: '1%',
          left: '7%',
          bottom: '1%',
          right: '20%',
          symbolSize: 7,
          label: {
            normal: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 9
            }
          },
          leaves: {
            label: {
              normal: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
              }
            }
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
      return option;
    },
    scatterOption(option) {/**散点图 */
      option.title.text = "销售业绩分布"
      return option;
    },
    lineOption(option) {/**折线图 */
      option.title.text = "销售业绩变化"
      return option;
    },
    areaOption(option) {/*面积图*/
      option.title.text = "销售业绩变化"
      option.xAxis = {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
      option.yAxis = {
        type: 'value'
      }
      option.series = [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        areaStyle: {
          normal: {}
        }
      }]
      return option;
    },
    barOption(option) {/**柱状图 */
      option.title.text = "销售业绩变化";
      return option;
    },
    pieOption(option) {/**饼图 */
      // option.tooltip = {
      //   trigger: 'item',
      //   formatter: "{a} <br/>{b} : {c} ({d}%)"
      // }
      option.title.text = "业绩占比"
      option.legend.data = ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
      option.series = [
        {
          name: '袜子',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 5, name: '衬衫' },
            { value: 20, name: '羊毛衫' },
            { value: 36, name: '雪纺衫' },
            { value: 10, name: '裤子' },
            { value: 10, name: '高跟鞋' },
            { value: 20, name: '袜子' }
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
      return option;
    },
    gaugeOption(option) {/**仪表图 */
      option.title.text = "业绩完成率"
      option.tooltip = {
        formatter: "{a} <br/>{b} : {c}%"
      }
      // option.toolbox={
      //   feature: {
      //       restore: {},
      //       saveAsImage: {}
      //   }
      // }
      option.series = [
        {
          name: '业务指标',
          type: 'gauge',
          detail: { formatter: '{value}%' },
          data: [{ value: 50, name: '完成率' }]
        }
      ]
      return option;
    },
    radarOption(option) {/**雷达图 */
      option.title.text = '成本分析雷达图';
      option.legend.data = ['预算分配（Allocated Budget）', '实际开销（Actual Spending）'];
      option.radar = {
        name: {
          textStyle: {
            color: '#fff',
            backgroundColor: '#999',
            borderRadius: 3,
            padding: [3, 5]
          }
        },
        indicator: [
          { name: '销售（sales）', max: 6500 },
          { name: '管理（Administration）', max: 16000 },
          { name: '信息技术（Information Techology）', max: 30000 },
          { name: '客服（Customer Support）', max: 38000 },
          { name: '研发（Development）', max: 52000 },
          { name: '市场（Marketing）', max: 25000 }
        ]
      }
      option.series = [{
        name: '预算 vs 开销',
        type: 'radar',
        // areaStyle: {normal: {}},
        data: [
          {
            value: [4300, 10000, 28000, 35000, 50000, 19000],
            name: '预算分配（Allocated Budget）'
          },
          {
            value: [5000, 14000, 28000, 31000, 42000, 21000],
            name: '实际开销（Actual Spending）'
          }
        ]
      }]
      return option;
    },
    heatmapOption(option) {/**热力图 */
      var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
        '7a', '8a', '9a', '10a', '11a',
        '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'];
      var days = ['Saturday', 'Friday', 'Thursday',
        'Wednesday', 'Tuesday', 'Monday', 'Sunday'];
      var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];
      data = data.map(function(item) {
        return [item[1], item[0], item[2] || '-'];
      });
      option.tooltip = {
        position: 'top'
      }
      option.animation = false,
        option.grid = {
          height: '50%',
          y: '10%'
        }
      option.xAxis = {
        type: 'category',
        data: hours,
        splitArea: {
          show: true
        }
      }
      option.yAxis = {
        type: 'category',
        data: days,
        splitArea: {
          show: true
        }
      }
      option.visualMap = {
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      }
      option.series = [{
        name: 'Punch Card',
        type: 'heatmap',
        data: data,
        label: {
          normal: {
            show: true
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
      return option;
    },
    mapOption(option) {/**地图 */
      option.title.text = "业绩地域分布"
      option.backgroundColor = {
        color: "#fff"
      }
      option.tooltip = {
        trigger: 'item'
      }
      option.toolbox = {
        top: 20,
        feature: {
          restore: {}
        }
      }
      option.legend = {
        right: 5,
        top: 5,
        bottom: 5,
        data: [""]
      }
      option.geo = {
        type: 'map',
        map: "china",
        roam: true,
        zoom: 1.2,
        itemStyle: {
          normal: {
            areaColor: '#E6A23C',
            borderColor: '#fff'
          },
          emphasis: {
            areaColor: '#67C23A'
          }
        }
      }
      option.series = [{
        name: '业务分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: [
          { name: '海门', value: [121.15, 31.89, 90], id: 1 },
          { name: '青岛', value: [120.33, 36.07, 180], id: 2 },
          { name: '广东迪奥', value: [113.31, 23.14, 500], id: 3 }
        ],
        symbolSize: function(val) {
          return val[2] / 20;
        },
        label: {
          normal: {
            formatter: '{b}:{c}',
            position: 'right',
            show: false
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: 'red'
          }
        }
      }]
      return option;
    },
    parallelOption(option) {/**平行坐标图 */
      var dataBJ = [
        [1, 55, 9, 56, 0.46, 18, 6, "良"],
        [2, 25, 11, 21, 0.65, 34, 9, "优"],
        [3, 56, 7, 63, 0.3, 14, 5, "良"],
        [4, 33, 7, 29, 0.33, 16, 6, "优"],
        [5, 42, 24, 44, 0.76, 40, 16, "优"],
        [6, 82, 58, 90, 1.77, 68, 33, "良"],
        [7, 74, 49, 77, 1.46, 48, 27, "良"],
        [8, 78, 55, 80, 1.29, 59, 29, "良"],
        [9, 267, 216, 280, 4.8, 108, 64, "重度污染"],
        [10, 185, 127, 216, 2.52, 61, 27, "中度污染"],
        [11, 39, 19, 38, 0.57, 31, 15, "优"],
        [12, 41, 11, 40, 0.43, 21, 7, "优"],
        [13, 64, 38, 74, 1.04, 46, 22, "良"],
        [14, 108, 79, 120, 1.7, 75, 41, "轻度污染"],
        [15, 108, 63, 116, 1.48, 44, 26, "轻度污染"],
        [16, 33, 6, 29, 0.34, 13, 5, "优"],
        [17, 94, 66, 110, 1.54, 62, 31, "良"],
        [18, 186, 142, 192, 3.88, 93, 79, "中度污染"],
        [19, 57, 31, 54, 0.96, 32, 14, "良"],
        [20, 22, 8, 17, 0.48, 23, 10, "优"],
        [21, 39, 15, 36, 0.61, 29, 13, "优"],
        [22, 94, 69, 114, 2.08, 73, 39, "良"],
        [23, 99, 73, 110, 2.43, 76, 48, "良"],
        [24, 31, 12, 30, 0.5, 32, 16, "优"],
        [25, 42, 27, 43, 1, 53, 22, "优"],
        [26, 154, 117, 157, 3.05, 92, 58, "中度污染"],
        [27, 234, 185, 230, 4.09, 123, 69, "重度污染"],
        [28, 160, 120, 186, 2.77, 91, 50, "中度污染"],
        [29, 134, 96, 165, 2.76, 83, 41, "轻度污染"],
        [30, 52, 24, 60, 1.03, 50, 21, "良"],
        [31, 46, 5, 49, 0.28, 10, 6, "优"]
      ];

      var dataGZ = [
        [1, 26, 37, 27, 1.163, 27, 13, "优"],
        [2, 85, 62, 71, 1.195, 60, 8, "良"],
        [3, 78, 38, 74, 1.363, 37, 7, "良"],
        [4, 21, 21, 36, 0.634, 40, 9, "优"],
        [5, 41, 42, 46, 0.915, 81, 13, "优"],
        [6, 56, 52, 69, 1.067, 92, 16, "良"],
        [7, 64, 30, 28, 0.924, 51, 2, "良"],
        [8, 55, 48, 74, 1.236, 75, 26, "良"],
        [9, 76, 85, 113, 1.237, 114, 27, "良"],
        [10, 91, 81, 104, 1.041, 56, 40, "良"],
        [11, 84, 39, 60, 0.964, 25, 11, "良"],
        [12, 64, 51, 101, 0.862, 58, 23, "良"],
        [13, 70, 69, 120, 1.198, 65, 36, "良"],
        [14, 77, 105, 178, 2.549, 64, 16, "良"],
        [15, 109, 68, 87, 0.996, 74, 29, "轻度污染"],
        [16, 73, 68, 97, 0.905, 51, 34, "良"],
        [17, 54, 27, 47, 0.592, 53, 12, "良"],
        [18, 51, 61, 97, 0.811, 65, 19, "良"],
        [19, 91, 71, 121, 1.374, 43, 18, "良"],
        [20, 73, 102, 182, 2.787, 44, 19, "良"],
        [21, 73, 50, 76, 0.717, 31, 20, "良"],
        [22, 84, 94, 140, 2.238, 68, 18, "良"],
        [23, 93, 77, 104, 1.165, 53, 7, "良"],
        [24, 99, 130, 227, 3.97, 55, 15, "良"],
        [25, 146, 84, 139, 1.094, 40, 17, "轻度污染"],
        [26, 113, 108, 137, 1.481, 48, 15, "轻度污染"],
        [27, 81, 48, 62, 1.619, 26, 3, "良"],
        [28, 56, 48, 68, 1.336, 37, 9, "良"],
        [29, 82, 92, 174, 3.29, 0, 13, "良"],
        [30, 106, 116, 188, 3.628, 101, 16, "轻度污染"],
        [31, 118, 50, 0, 1.383, 76, 11, "轻度污染"]
      ];

      var dataSH = [
        [1, 91, 45, 125, 0.82, 34, 23, "良"],
        [2, 65, 27, 78, 0.86, 45, 29, "良"],
        [3, 83, 60, 84, 1.09, 73, 27, "良"],
        [4, 109, 81, 121, 1.28, 68, 51, "轻度污染"],
        [5, 106, 77, 114, 1.07, 55, 51, "轻度污染"],
        [6, 109, 81, 121, 1.28, 68, 51, "轻度污染"],
        [7, 106, 77, 114, 1.07, 55, 51, "轻度污染"],
        [8, 89, 65, 78, 0.86, 51, 26, "良"],
        [9, 53, 33, 47, 0.64, 50, 17, "良"],
        [10, 80, 55, 80, 1.01, 75, 24, "良"],
        [11, 117, 81, 124, 1.03, 45, 24, "轻度污染"],
        [12, 99, 71, 142, 1.1, 62, 42, "良"],
        [13, 95, 69, 130, 1.28, 74, 50, "良"],
        [14, 116, 87, 131, 1.47, 84, 40, "轻度污染"],
        [15, 108, 80, 121, 1.3, 85, 37, "轻度污染"],
        [16, 134, 83, 167, 1.16, 57, 43, "轻度污染"],
        [17, 79, 43, 107, 1.05, 59, 37, "良"],
        [18, 71, 46, 89, 0.86, 64, 25, "良"],
        [19, 97, 71, 113, 1.17, 88, 31, "良"],
        [20, 84, 57, 91, 0.85, 55, 31, "良"],
        [21, 87, 63, 101, 0.9, 56, 41, "良"],
        [22, 104, 77, 119, 1.09, 73, 48, "轻度污染"],
        [23, 87, 62, 100, 1, 72, 28, "良"],
        [24, 168, 128, 172, 1.49, 97, 56, "中度污染"],
        [25, 65, 45, 51, 0.74, 39, 17, "良"],
        [26, 39, 24, 38, 0.61, 47, 17, "优"],
        [27, 39, 24, 39, 0.59, 50, 19, "优"],
        [28, 93, 68, 96, 1.05, 79, 29, "良"],
        [29, 188, 143, 197, 1.66, 99, 51, "中度污染"],
        [30, 174, 131, 174, 1.55, 108, 50, "中度污染"],
        [31, 187, 143, 201, 1.39, 89, 53, "中度污染"]
      ];

      var schema = [
        { name: 'date', index: 0, text: '日期' },
        { name: 'AQIindex', index: 1, text: 'AQI' },
        { name: 'PM25', index: 2, text: 'PM2.5' },
        { name: 'PM10', index: 3, text: 'PM10' },
        { name: 'CO', index: 4, text: ' CO' },
        { name: 'NO2', index: 5, text: 'NO2' },
        { name: 'SO2', index: 6, text: 'SO2' },
        { name: '等级', index: 7, text: '等级' }
      ];

      var lineStyle = {
        normal: {
          width: 1,
          opacity: 0.5
        }
      };

      option = {
        title: {
          text: "平行坐标图"
        },
        backgroundColor: '#333',
        legend: {
          bottom: 10,
          data: ['北京', '上海', '广州'],
          itemGap: 20,
          textStyle: {
            color: '#fff',
            fontSize: 14
          }
        },
        // tooltip: {
        //   padding: 10,
        //   backgroundColor: '#222',
        //   borderColor: '#777',
        //   borderWidth: 1,
        //   formatter: function(obj) {
        //     var value = obj[0].value;
        //     return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
        //       + obj[0].seriesName + ' ' + value[0] + '日期：'
        //       + value[7]
        //       + '</div>'
        //       + schema[1].text + '：' + value[1] + '<br>'
        //       + schema[2].text + '：' + value[2] + '<br>'
        //       + schema[3].text + '：' + value[3] + '<br>'
        //       + schema[4].text + '：' + value[4] + '<br>'
        //       + schema[5].text + '：' + value[5] + '<br>'
        //       + schema[6].text + '：' + value[6] + '<br>';
        //   }
        // },
        // dataZoom: {
        //     show: true,
        //     orient: 'vertical'
        // },
        parallelAxis: [
          { dim: 0, name: schema[0].text, inverse: true, max: 31, nameLocation: 'start' },
          { dim: 1, name: schema[1].text },
          { dim: 2, name: schema[2].text },
          { dim: 3, name: schema[3].text },
          { dim: 4, name: schema[4].text },
          { dim: 5, name: schema[5].text },
          { dim: 6, name: schema[6].text },
          {
            dim: 7, name: schema[7].text,
            type: 'category', data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']
          }
        ],
        visualMap: {
          show: true,
          min: 0,
          max: 150,
          dimension: 2,
          inRange: {
            color: ['#d94e5d', '#eac736', '#50a3ba'].reverse(),
            // colorAlpha: [0, 1]
          }
        },
        parallel: {
          left: '5%',
          right: '18%',
          bottom: 60,
          parallelAxisDefault: {
            type: 'value',
            name: 'AQI指数',
            nameLocation: 'end',
            nameGap: 20,
            nameTextStyle: {
              color: '#fff',
              fontSize: 12
            },
            axisLine: {
              lineStyle: {
                color: '#aaa'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#777'
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              textStyle: {
                color: '#fff'
              }
            }
          }
        },
        series: [
          {
            name: '北京',
            type: 'parallel',
            lineStyle: lineStyle,
            data: dataBJ
          },
          {
            name: '上海',
            type: 'parallel',
            lineStyle: lineStyle,
            data: dataSH
          },
          {
            name: '广州',
            type: 'parallel',
            lineStyle: lineStyle,
            data: dataGZ
          }
        ]
      };
      return option;
    },
    candlestickOption(option) {/**K线图 */
      var rawData = [['2015/12/31', '3570.47', '3539.18', '-33.69', '-0.94%', '3538.35', '3580.6', '176963664', '25403106', '-'], ['2015/12/30', '3566.73', '3572.88', '9.14', '0.26%', '3538.11', '3573.68', '187889600', '26778766', '-'], ['2015/12/29', '3528.4', '3563.74', '29.96', '0.85%', '3515.52', '3564.17', '182551920', '25093890', '-'], ['2015/12/28', '3635.77', '3533.78', '-94.13', '-2.59%', '3533.78', '3641.59', '269983264', '36904280', '-'], ['2015/12/25', '3614.05', '3627.91', '15.43', '0.43%', '3601.74', '3635.26', '198451120', '27466004', '-'], ['2015/12/24', '3631.31', '3612.49', '-23.6', '-0.65%', '3572.28', '3640.22', '227785216', '31542126', '-'], ['2015/12/23', '3653.28', '3636.09', '-15.68', '-0.43%', '3633.03', '3684.57', '298201792', '41990292', '-'], ['2015/12/22', '3645.99', '3651.77', '9.3', '0.26%', '3616.87', '3652.63', '261178752', '36084604', '-'], ['2015/12/21', '3568.58', '3642.47', '63.51', '1.77%', '3565.75', '3651.06', '299849280', '39831696', '-'], ['2015/12/18', '3574.94', '3578.96', '-1.03', '-0.03%', '3568.16', '3614.7', '273707904', '36538580', '-'], ['2015/12/17', '3533.63', '3580', '63.81', '1.81%', '3533.63', '3583.41', '283856480', '38143960', '-'], ['2015/12/16', '3522.09', '3516.19', '5.83', '0.17%', '3506.29', '3538.69', '193482304', '26528864', '-'], ['2015/12/15', '3518.13', '3510.35', '-10.31', '-0.29%', '3496.85', '3529.96', '200471344', '27627494', '-'], ['2015/12/14', '3403.51', '3520.67', '86.09', '2.51%', '3399.28', '3521.78', '215374624', '27921354', '-'], ['2015/12/11', '3441.6', '3434.58', '-20.91', '-0.61%', '3410.92', '3455.55', '182908880', '24507642', '-'], ['2015/12/10', '3469.81', '3455.5', '-16.94', '-0.49%', '3446.27', '3503.65', '200427520', '27949970', '-'], ['2015/12/9', '3462.58', '3472.44', '2.37', '0.07%', '3454.88', '3495.7', '195698848', '26785488', '-'], ['2015/12/8', '3518.65', '3470.07', '-66.86', '-1.89%', '3466.79', '3518.65', '224367312', '29782174', '-'], ['2015/12/7', '3529.81', '3536.93', '11.94', '0.34%', '3506.62', '3543.95', '208302576', '28056158', '-'], ['2015/12/4', '3558.15', '3524.99', '-59.83', '-1.67%', '3510.41', '3568.97', '251736416', '31976682', '-'], ['2015/12/3', '3525.73', '3584.82', '47.92', '1.35%', '3517.23', '3591.73', '281111232', '33885908', '-'], ['2015/12/2', '3450.28', '3536.91', '80.6', '2.33%', '3427.66', '3538.85', '301491488', '36918304', '-'], ['2015/12/1', '3442.44', '3456.31', '10.9', '0.32%', '3417.54', '3483.41', '252390752', '33025674', '-'], ['2015/11/30', '3433.85', '3445.4', '9.1', '0.26%', '3327.81', '3470.37', '304197888', '38750364', '-'], ['2015/11/27', '3616.54', '3436.3', '-199.25', '-5.48%', '3412.43', '3621.9', '354287520', '46431124', '-'], ['2015/11/26', '3659.57', '3635.55', '-12.38', '-0.34%', '3629.86', '3668.38', '306761600', '42624744', '-'], ['2015/11/25', '3614.07', '3647.93', '31.82', '0.88%', '3607.52', '3648.37', '273024864', '38080292', '-'], ['2015/11/24', '3602.89', '3616.11', '5.79', '0.16%', '3563.1', '3616.48', '248810512', '32775852', '-'], ['2015/11/23', '3630.87', '3610.31', '-20.18', '-0.56%', '3598.87', '3654.75', '315997472', '41414824', '-'], ['2015/11/20', '3620.79', '3630.5', '13.44', '0.37%', '3607.92', '3640.53', '310801984', '41391088', '-'], ['2015/11/19', '3573.78', '3617.06', '48.59', '1.36%', '3561.04', '3618.21', '247915584', '32844260', '-'], ['2015/11/18', '3605.06', '3568.47', '-36.33', '-1.01%', '3558.7', '3617.07', '297580736', '39233876', '-'], ['2015/11/17', '3629.98', '3604.8', '-2.16', '-0.06%', '3598.07', '3678.27', '383575456', '52152036', '-'], ['2015/11/16', '3522.46', '3606.96', '26.12', '0.73%', '3519.42', '3607.61', '276187040', '36942184', '-'], ['2015/11/13', '3600.76', '3580.84', '-52.06', '-1.43%', '3564.81', '3632.56', '345870944', '46866864', '-'], ['2015/11/12', '3656.82', '3632.9', '-17.35', '-0.48%', '3603.23', '3659.31', '361717600', '48283260', '-'], ['2015/11/11', '3635', '3650.25', '9.76', '0.27%', '3605.62', '3654.88', '360972672', '46782220', '-'], ['2015/11/10', '3617.4', '3640.49', '-6.4', '-0.18%', '3607.89', '3669.53', '429746592', '56005512', '-'], ['2015/11/9', '3588.5', '3646.88', '56.85', '1.58%', '3588.5', '3673.76', '503016704', '63618404', '-'], ['2015/11/6', '3514.44', '3590.03', '67.21', '1.91%', '3508.83', '3596.38', '429167040', '54328220', '-'], ['2015/11/5', '3459.22', '3522.82', '63.18', '1.83%', '3455.53', '3585.66', '553254976', '67867464', '-'], ['2015/11/4', '3325.62', '3459.64', '142.94', '4.31%', '3325.62', '3459.65', '339078752', '42610440', '-'], ['2015/11/3', '3330.32', '3316.7', '-8.39', '-0.25%', '3302.18', '3346.27', '192897440', '24436056', '-'], ['2015/11/2', '3337.58', '3325.08', '-57.48', '-1.70%', '3322.31', '3391.06', '230951136', '28601932', '-'], ['2015/10/30', '3380.28', '3382.56', '-4.75', '-0.14%', '3346.59', '3417.2', '243595120', '30726678', '-'], ['2015/10/29', '3387.77', '3387.32', '12.12', '0.36%', '3362.51', '3411.71', '235676016', '29450842', '-'], ['2015/10/28', '3417.01', '3375.2', '-59.14', '-1.72%', '3367.23', '3439.76', '293523296', '36165620', '-'], ['2015/10/27', '3409.14', '3434.34', '4.76', '0.14%', '3332.62', '3441.57', '328172768', '40888724', '-'], ['2015/10/26', '3448.65', '3429.58', '17.15', '0.50%', '3402', '3457.52', '365560864', '45394252', '-'], ['2015/10/23', '3377.55', '3412.43', '43.7', '1.30%', '3360.22', '3422.02', '347372864', '42526308', '-'], ['2015/10/22', '3292.29', '3368.74', '48.06', '1.45%', '3282.99', '3373.78', '323739328', '37545200', '-'], ['2015/10/21', '3428.56', '3320.68', '-104.65', '-3.06%', '3265.44', '3447.26', '458455424', '51850924', '-'], ['2015/10/20', '3377.55', '3425.33', '38.63', '1.14%', '3357.86', '3425.52', '318973760', '38358252', '-'], ['2015/10/19', '3401.63', '3386.7', '-4.65', '-0.14%', '3355.57', '3423.4', '378112160', '45330364', '-'], ['2015/10/16', '3358.3', '3391.35', '53.28', '1.60%', '3334.85', '3393.02', '395460576', '45944784', '-'], ['2015/10/15', '3255.03', '3338.07', '75.63', '2.32%', '3254.39', '3338.3', '316283840', '36256556', '-'], ['2015/10/14', '3280.02', '3262.44', '-30.79', '-0.93%', '3256.25', '3307.32', '295077760', '33027752', '-'], ['2015/10/13', '3262.16', '3293.23', '5.57', '0.17%', '3253.25', '3298.63', '297153120', '33480608', '-'], ['2015/10/12', '3193.54', '3287.66', '104.51', '3.28%', '3188.41', '3318.71', '386294688', '43554100', '-'], ['2015/10/9', '3146.64', '3183.15', '39.79', '1.27%', '3137.79', '3192.72', '234851456', '25637910', '-'], ['2015/10/8', '3156.07', '3143.36', '90.58', '2.97%', '3133.13', '3172.28', '234276048', '25883034', '-'], ['2015/9/30', '3052.84', '3052.78', '14.64', '0.48%', '3039.74', '3073.3', '146642448', '15656919', '-'], ['2015/9/29', '3055.22', '3038.14', '-62.62', '-2.02%', '3021.16', '3068.3', '163222672', '16968660', '-'], ['2015/9/28', '3085.57', '3100.76', '8.41', '0.27%', '3042.31', '3103.07', '156727536', '16642240', '-'], ['2015/9/25', '3130.85', '3092.35', '-50.34', '-1.60%', '3063', '3149.95', '236263872', '24897112', '-'], ['2015/9/24', '3126.49', '3142.69', '26.8', '0.86%', '3109.69', '3151.16', '212887712', '23136904', '-'], ['2015/9/23', '3137.72', '3115.89', '-69.73', '-2.19%', '3104.74', '3164.04', '236322672', '25756004', '-'], ['2015/9/22', '3161.32', '3185.62', '29.08', '0.92%', '3152.48', '3213.48', '274786176', '30507132', '-'], ['2015/9/21', '3072.09', '3156.54', '58.62', '1.89%', '3060.86', '3159.88', '239897360', '25979668', '-'], ['2015/9/18', '3100.28', '3097.92', '11.86', '0.38%', '3070.34', '3122.05', '209175392', '21844244', '-'], ['2015/9/17', '3131.98', '3086.06', '-66.2', '-2.10%', '3085.31', '3204.7', '317602912', '33739328', '-'], ['2015/9/16', '2998.04', '3152.26', '147.09', '4.89%', '2983.54', '3182.93', '277524512', '28199226', '-'], ['2015/9/15', '3043.8', '3005.17', '-109.63', '-3.52%', '2983.92', '3081.7', '249194448', '24390460', '-'], ['2015/9/14', '3221.17', '3114.8', '-85.44', '-2.67%', '3049.23', '3229.48', '346631168', '37357680', '-'], ['2015/9/11', '3189.48', '3200.23', '2.34', '0.07%', '3163.45', '3223.76', '224557808', '25276946', '-'], ['2015/9/10', '3190.55', '3197.89', '-45.2', '-1.39%', '3178.9', '3243.28', '273261760', '29958108', '-'], ['2015/9/9', '3182.55', '3243.09', '72.64', '2.29%', '3165.7', '3256.74', '375328000', '41299144', '-'], ['2015/9/8', '3054.44', '3170.45', '90.03', '2.92%', '3011.12', '3174.71', '255415456', '26391038', '-'], ['2015/9/7', '3149.38', '3080.42', '-79.75', '-2.52%', '3066.3', '3217.58', '296468096', '30268972', '-'], ['2015/9/2', '3027.68', '3160.17', '-6.46', '-0.20%', '3019.09', '3194.48', '438170176', '42326236', '-'], ['2015/9/1', '3157.83', '3166.62', '-39.36', '-1.23%', '3053.74', '3180.33', '432432448', '42041164', '-'], ['2015/8/31', '3203.56', '3205.99', '-26.36', '-0.82%', '3109.16', '3207.86', '397431392', '43106860', '-'], ['2015/8/28', '3125.26', '3232.35', '148.76', '4.82%', '3102.95', '3235.84', '443136928', '47463100', '-'], ['2015/8/27', '2978.03', '3083.59', '156.3', '5.34%', '2906.49', '3085.42', '400308384', '40428928', '-'], ['2015/8/26', '2980.79', '2927.29', '-37.68', '-1.27%', '2850.71', '3092.04', '466699680', '46178896', '-'], ['2015/8/25', '3004.13', '2964.97', '-244.94', '-7.63%', '2947.94', '3123.03', '352325088', '35873576', '-'], ['2015/8/24', '3373.48', '3209.91', '-297.84', '-8.49%', '3191.88', '3388.36', '334671776', '35881888', '-'], ['2015/8/21', '3609.96', '3507.74', '-156.55', '-4.27%', '3490.54', '3652.84', '369920480', '45061648', '-'], ['2015/8/20', '3754.57', '3664.29', '-129.82', '-3.42%', '3663.61', '3788.01', '390063072', '50119500', '-'], ['2015/8/19', '3646.8', '3794.11', '45.95', '1.23%', '3558.38', '3811.43', '475396224', '59951332', '-'], ['2015/8/18', '3999.13', '3748.16', '-245.5', '-6.15%', '3743.39', '4006.34', '543770816', '72246720', '-'], ['2015/8/17', '3947.84', '3993.67', '28.33', '0.71%', '3907.4', '3994.54', '460432064', '62632768', '-']]
      function calculateMA(dayCount, data) {
        var result = [];
        for (var i = 0, len = data.length; i < len; i++) {
          if (i < dayCount) {
            result.push('-');
            continue;
          }
          var sum = 0;
          for (var j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
          }
          result.push(sum / dayCount);
        }
        return result;
      }
      var dates = rawData.map(function(item) {
        return item[0];
      });

      var data = rawData.map(function(item) {
        return [+item[1], +item[2], +item[5], +item[6]];
      });
      var option = {
        title: {
          text: "K线图"
        },
        backgroundColor: '#21202D',
        legend: {
          data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
          inactiveColor: '#777',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
            type: 'cross',
            lineStyle: {
              color: '#376df4',
              width: 2,
              opacity: 1
            }
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#8392A5' } }
        },
        yAxis: {
          scale: true,
          axisLine: { lineStyle: { color: '#8392A5' } },
          splitLine: { show: false }
        },
        grid: {
          bottom: 80
        },
        dataZoom: [{
          textStyle: {
            color: '#8392A5'
          },
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          dataBackground: {
            areaStyle: {
              color: '#8392A5'
            },
            lineStyle: {
              opacity: 0.8,
              color: '#8392A5'
            }
          },
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }, {
          type: 'inside'
        }],
        animation: false,
        series: [
          {
            type: 'candlestick',
            name: '日K',
            data: data,
            itemStyle: {
              normal: {
                color: '#FD1050',
                color0: '#0CF49B',
                borderColor: '#FD1050',
                borderColor0: '#0CF49B'
              }
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA10',
            type: 'line',
            data: calculateMA(10, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: calculateMA(20, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA30',
            type: 'line',
            data: calculateMA(30, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          }
        ]
      };
      var option = {
        // backgroundColor: '#21202D',
        backgroundColor: '#fff',
        legend: {
          data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
          inactiveColor: '#777',
          textStyle: {
            color: '#000'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
            type: 'cross',
            lineStyle: {
              color: '#376df4',
              width: 2,
              opacity: 1
            }
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#8392A5' } }
        },
        yAxis: {
          scale: true,
          axisLine: { lineStyle: { color: '#8392A5' } },
          splitLine: { show: false }
        },
        grid: {
          bottom: 80
        },
        dataZoom: [{
          textStyle: {
            color: '#8392A5'
          },
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          dataBackground: {
            areaStyle: {
              color: '#8392A5'
            },
            lineStyle: {
              opacity: 0.8,
              color: '#8392A5'
            }
          },
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }, {
          type: 'inside'
        }],
        animation: false,
        series: [
          {
            type: 'candlestick',
            name: '日K',
            data: data,
            itemStyle: {
              normal: {
                color: '#FD1050',
                color0: '#0CF49B',
                borderColor: '#FD1050',
                borderColor0: '#0CF49B'
              }
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA10',
            type: 'line',
            data: calculateMA(10, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: calculateMA(20, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          },
          {
            name: 'MA30',
            type: 'line',
            data: calculateMA(30, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          }
        ]
      };
      return option;
    },
    calendarOption(option) {/**日历图 */
      function getVirtulData() {
        var date = ["2017-01-01", "2017-01-02", "2017-01-03", "2017-01-04", "2017-01-05", "2017-01-06", "2017-01-07", "2017-01-08", "2017-01-09", "2017-01-10", "2017-01-11", "2017-01-12", "2017-01-13", "2017-01-14", "2017-01-15", "2017-01-16", "2017-01-17", "2017-01-18", "2017-01-19", "2017-01-20", "2017-01-21", "2017-01-22", "2017-01-23", "2017-01-24", "2017-01-25", "2017-01-26", "2017-01-27", "2017-01-28", "2017-01-29", "2017-01-30", "2017-01-31", "2017-02-01", "2017-02-02", "2017-02-03", "2017-02-04", "2017-02-05", "2017-02-06", "2017-02-07", "2017-02-08", "2017-02-09", "2017-02-10", "2017-02-11", "2017-02-12", "2017-02-13", "2017-02-14", "2017-02-15", "2017-02-16", "2017-02-17", "2017-02-18", "2017-02-19", "2017-02-20", "2017-02-21", "2017-02-22", "2017-02-23", "2017-02-24", "2017-02-25", "2017-02-26", "2017-02-27", "2017-02-28", "2017-03-01", "2017-03-02", "2017-03-03", "2017-03-04", "2017-03-05", "2017-03-06", "2017-03-07", "2017-03-08", "2017-03-09", "2017-03-10", "2017-03-11", "2017-03-12", "2017-03-13", "2017-03-14", "2017-03-15", "2017-03-16", "2017-03-17", "2017-03-18", "2017-03-19", "2017-03-20", "2017-03-21", "2017-03-22", "2017-03-23", "2017-03-24", "2017-03-25", "2017-03-26", "2017-03-27", "2017-03-28", "2017-03-29", "2017-03-30", "2017-03-31", "2017-04-01", "2017-04-02", "2017-04-03", "2017-04-04", "2017-04-05", "2017-04-06", "2017-04-07", "2017-04-08", "2017-04-09", "2017-04-10"];
        var val = [595, 302, 4, 800, 188, 748, 693, 42, 747, 743, 87, 681, 508, 891, 259, 784, 80, 280, 349, 374, 877, 842, 392, 225, 922, 965, 64, 299, 253, 875, 502, 614, 929, 35, 258, 475, 133, 58, 755, 221, 815, 268, 205, 99, 363, 801, 509, 779, 896, 714, 813, 277, 580, 429, 499, 610, 476, 724, 302, 71, 443, 379, 932, 926, 181, 398, 881, 971, 797, 536, 674, 453, 461, 356, 245, 529, 302, 626, 713, 366, 233, 323, 131, 450, 696, 146, 104, 223, 457, 147, 101, 386, 25, 258, 900, 149, 765, 915, 972, 543269, 86, 1, 539, 310, 472, 676, 175, 499, 570, 311, 477, 257, 619, 125, 281, 672, 28, 164, 46, 657, 838, 969, 313, 398, 922, 235, 513, 148, 189, 630, 401, 973, 333, 674, 471, 537, 232, 888, 403, 387, 533, 278, 753, 480, 389, 480, 227, 1, 682, 745, 590, 581, 997, 568, 343, 194, 68, 181, 196, 974, 363, 585, 912, 817, 601, 840, 414, 977, 235, 714, 422, 530, 427, 560, 326, 189, 247, 860, 400, 673, 117, 151, 728, 191, 141, 330, 269, 662, 967, 291, 338, 31, 94, 300, 449, 134, 96, 984, 981525, 784, 746, 279, 574, 340, 163, 191, 345, 410, 887, 67, 250, 707, 525, 655, 11, 617, 785, 950, 721, 528, 771, 831, 931, 375, 4, 780, 699, 367, 978, 957, 341, 276, 956, 923, 486, 726, 163, 430, 100, 995, 912, 113, 55, 918, 827, 826, 598, 217, 800, 33, 972, 732, 107, 87, 677, 351, 935, 386, 556, 895, 563, 31, 353, 208, 379, 900, 437, 228, 863, 820, 10, 309, 972, 119, 236, 476, 391, 717, 785, 768, 93, 706, 715, 588, 106, 764, 181, 814, 862, 250, 152, 66, 515, 849, 149, 987, 111, 404567, 775, 799, 27, 557, 246, 106, 629, 711, 42, 370, 780, 548, 679, 224, 870, 66, 479, 554, 696, 424, 95, 307, 230, 234, 337, 75, 783, 77, 698, 550, 261, 382, 554, 943, 466, 595, 527, 865, 847, 234, 859, 261, 888, 931, 121, 855, 639, 107, 716, 463, 560, 790, 47, 629, 255, 816, 805, 903, 395, 173, 199, 964, 956, 840, 984, 997, 278, 464, 856, 984, 331, 162, 210, 967, 479, 342, 714, 137, 935, 822, 398, 811, 793, 907, 925, 618, 754, 876, 720, 330, 233, 886, 828, 307, 70, 173, 494, 132, 612];
        var data = [];
        for (let i = 0; i < date.length; i++) {
          data.push([date[i], Math.floor(Math.random() * 1000)]);
        }
        return data;
      }
      option.title.text = "业绩安排"
      option.tooltip = {
        position: 'top'
      }
      option.visualMap = [{
        min: 0,
        max: 1000,
        calculable: true,
        seriesIndex: [0],
        orient: 'horizontal',
        left: 'center',
        bottom: 5
      }]
      option.calendar = [{
        orient: 'vertical',
        // yearLabel: {
        //   margin: 40
        // },
        monthLabel: {
          margin: 20
        },
        cellSize: 35,
        left: 0,
        right: 0,
        top: 50,
        bottom: 5,
        range: '2017-01'
      }]
      option.series = [{
        type: 'effectScatter',
        coordinateSystem: 'calendar',
        calendarIndex: 0,
        symbolSize: function(val) {
          return val[1] / 40;
        },
        data: getVirtulData(2017)
      }]
      return option;
    },
    tableOption(option) {/**表格图,用散点图绘制 */
      let tempData = [
        {
          "title": "地区",
          "dataid": 10,
          "data": ["广州", "深圳", "惠州", "长沙", "沈阳"]
        },
        {
          "title": "GDP",
          "dataid": 10,
          "data": ["9876", "6541", "1236", "3214", "5463"]
        },
        {
          "title": "钢铁产量",
          "dataid": 10,
          "data": ["741", "852", "963", "795", "321"]
        }
      ]
      option.grid = {
        top: 30,
        left: 1,
        bottom: 5,
        right: 1
      }
      option.xAxis = {
        show: true,
        position: "top",
        boundaryGap: "center",
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: "#000"
          }
        },
        interval: 1,
        axisTick: {
          length: 0
        },
        axisLabel: {
          show: false
        },
        minInterval: 1,
        data: function() {
          var arr = [];
          tempData.forEach((item) => {
            arr.push(item.title);
          });
          return arr
        }()/*x轴data长度决定列表列数(宽度)*/
      };
      option.yAxis = {
        show: true,
        type: 'value',
        inverse: true,/**反转y轴 */
        axisTick: {
          length: 0
        },
        axisLabel: {
          show: false
        },
        max: 5,
        min: 0,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: "#000"
          }
        }
      };
      option.tooltip = {
        show: false/**取消提示框 */
      };
      option.legend = {
        show: false/**隐藏图例组件标记 */
      };
      option.series = function() {
        let arr = [];
        tempData.forEach((item, index) => {
          arr.push({
            name: "A",
            type: "scatter",
            data: function() {
              let brr = [[index, 0, item.title]];
              item.data.forEach((bitem, bindex) => {
                brr.push([index, bindex + 1, bitem])
              });
              return brr;
            }(),
            hoverAnimation: false,
            cursor: "default",
            dimensions: ["x", "y", "name"],
            encode: {
              x: "x",      // 表示维度 3、1、5 映射到 x 轴。
              y: "y",              // 表示维度 2 映射到 y 轴。
              label: "name"           // 表示 label 使用维度 3。
            },
            itemStyle: {
              normal: {
                show: true,
                color: "transparent"
              }
            },
            label: {
              normal: {
                show: true,
                position: "bottom",
                color: "#000"
              }
            }
          });
        });
        return arr;
      }();
      return option;
    },
    /*3D系列*/
    timeOption(option) {/*动态时间图*/
      var dataMap = {};
      function dataFormatter(obj) {
        var pList = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];
        var temp;
        for (var year = 2008; year <= 2011; year++) {
          var max = 0;
          var sum = 0;
          temp = obj[year];
          for (var i = 0, l = temp.length; i < l; i++) {
            max = Math.max(max, temp[i]);
            sum += temp[i];
            obj[year][i] = {
              name: pList[i],
              value: temp[i]
            }
          }
          obj[year + 'max'] = Math.floor(max / 100) * 100;
          obj[year + 'sum'] = sum;
        }
        return obj;
      }

      dataMap.dataGDP = dataFormatter({
        //max : 60000,
        2011: [16251.93, 11307.28, 24515.76, 11237.55, 14359.88, 22226.7, 10568.83, 12582, 19195.69, 49110.27, 32318.85, 15300.65, 17560.18, 11702.82, 45361.85, 26931.03, 19632.26, 19669.56, 53210.28, 11720.87, 2522.66, 10011.37, 21026.68, 5701.84, 8893.12, 605.83, 12512.3, 5020.37, 1670.44, 2102.21, 6610.05],
        2010: [14113.58, 9224.46, 20394.26, 9200.86, 11672, 18457.27, 8667.58, 10368.6, 17165.98, 41425.48, 27722.31, 12359.33, 14737.12, 9451.26, 39169.92, 23092.36, 15967.61, 16037.96, 46013.06, 9569.85, 2064.5, 7925.58, 17185.48, 4602.16, 7224.18, 507.46, 10123.48, 4120.75, 1350.43, 1689.65, 5437.47],
        2009: [12153.03, 7521.85, 17235.48, 7358.31, 9740.25, 15212.49, 7278.75, 8587, 15046.45, 34457.3, 22990.35, 10062.82, 12236.53, 7655.18, 33896.65, 19480.46, 12961.1, 13059.69, 39482.56, 7759.16, 1654.21, 6530.01, 14151.28, 3912.68, 6169.75, 441.36, 8169.8, 3387.56, 1081.27, 1353.31, 4277.05],
        2008: [11115, 6719.01, 16011.97, 7315.4, 8496.2, 13668.58, 6426.1, 8314.37, 14069.87, 30981.98, 21462.69, 8851.66, 10823.01, 6971.05, 30933.28, 18018.53, 11328.92, 11555, 36796.71, 7021, 1503.06, 5793.66, 12601.23, 3561.56, 5692.12, 394.85, 7314.58, 3166.82, 1018.62, 1203.92, 4183.21]
      });

      dataMap.dataPI = dataFormatter({
        //max : 4000,
        2011: [136.27, 159.72, 2905.73, 641.42, 1306.3, 1915.57, 1277.44, 1701.5, 124.94, 3064.78, 1583.04, 2015.31, 1612.24, 1391.07, 3973.85, 3512.24, 2569.3, 2768.03, 2665.2, 2047.23, 659.23, 844.52, 2983.51, 726.22, 1411.01, 74.47, 1220.9, 678.75, 155.08, 184.14, 1139.03],
        2010: [124.36, 145.58, 2562.81, 554.48, 1095.28, 1631.08, 1050.15, 1302.9, 114.15, 2540.1, 1360.56, 1729.02, 1363.67, 1206.98, 3588.28, 3258.09, 2147, 2325.5, 2286.98, 1675.06, 539.83, 685.38, 2482.89, 625.03, 1108.38, 68.72, 988.45, 599.28, 134.92, 159.29, 1078.63],
        2009: [118.29, 128.85, 2207.34, 477.59, 929.6, 1414.9, 980.57, 1154.33, 113.82, 2261.86, 1163.08, 1495.45, 1182.74, 1098.66, 3226.64, 2769.05, 1795.9, 1969.69, 2010.27, 1458.49, 462.19, 606.8, 2240.61, 550.27, 1067.6, 63.88, 789.64, 497.05, 107.4, 127.25, 759.74],
        2008: [112.83, 122.58, 2034.59, 313.58, 907.95, 1302.02, 916.72, 1088.94, 111.8, 2100.11, 1095.96, 1418.09, 1158.17, 1060.38, 3002.65, 2658.78, 1780, 1892.4, 1973.05, 1453.75, 436.04, 575.4, 2216.15, 539.19, 1020.56, 60.62, 753.72, 462.27, 105.57, 118.94, 691.07]
      });

      dataMap.dataSI = dataFormatter({
        //max : 26600,
        2011: [3752.48, 5928.32, 13126.86, 6635.26, 8037.69, 12152.15, 5611.48, 5962.41, 7927.89, 25203.28, 16555.58, 8309.38, 9069.2, 6390.55, 24017.11, 15427.08, 9815.94, 9361.99, 26447.38, 5675.32, 714.5, 5543.04, 11029.13, 2194.33, 3780.32, 208.79, 6935.59, 2377.83, 975.18, 1056.15, 3225.9],
        2010: [3388.38, 4840.23, 10707.68, 5234, 6367.69, 9976.82, 4506.31, 5025.15, 7218.32, 21753.93, 14297.93, 6436.62, 7522.83, 5122.88, 21238.49, 13226.38, 7767.24, 7343.19, 23014.53, 4511.68, 571, 4359.12, 8672.18, 1800.06, 3223.49, 163.92, 5446.1, 1984.97, 744.63, 827.91, 2592.15],
        2009: [2855.55, 3987.84, 8959.83, 3993.8, 5114, 7906.34, 3541.92, 4060.72, 6001.78, 18566.37, 11908.49, 4905.22, 6005.3, 3919.45, 18901.83, 11010.5, 6038.08, 5687.19, 19419.7, 3381.54, 443.43, 3448.77, 6711.87, 1476.62, 2582.53, 136.63, 4236.42, 1527.24, 575.33, 662.32, 1929.59],
        2008: [2626.41, 3709.78, 8701.34, 4242.36, 4376.19, 7158.84, 3097.12, 4319.75, 6085.84, 16993.34, 11567.42, 4198.93, 5318.44, 3554.81, 17571.98, 10259.99, 5082.07, 5028.93, 18502.2, 3037.74, 423.55, 3057.78, 5823.39, 1370.03, 2452.75, 115.56, 3861.12, 1470.34, 557.12, 609.98, 2070.76]
      });

      dataMap.dataTI = dataFormatter({
        //max : 25000,
        2011: [12363.18, 5219.24, 8483.17, 3960.87, 5015.89, 8158.98, 3679.91, 4918.09, 11142.86, 20842.21, 14180.23, 4975.96, 6878.74, 3921.2, 17370.89, 7991.72, 7247.02, 7539.54, 24097.7, 3998.33, 1148.93, 3623.81, 7014.04, 2781.29, 3701.79, 322.57, 4355.81, 1963.79, 540.18, 861.92, 2245.12],
        2010: [10600.84, 4238.65, 7123.77, 3412.38, 4209.03, 6849.37, 3111.12, 4040.55, 9833.51, 17131.45, 12063.82, 4193.69, 5850.62, 3121.4, 14343.14, 6607.89, 6053.37, 6369.27, 20711.55, 3383.11, 953.67, 2881.08, 6030.41, 2177.07, 2892.31, 274.82, 3688.93, 1536.5, 470.88, 702.45, 1766.69],
        2009: [9179.19, 3405.16, 6068.31, 2886.92, 3696.65, 5891.25, 2756.26, 3371.95, 8930.85, 13629.07, 9918.78, 3662.15, 5048.49, 2637.07, 11768.18, 5700.91, 5127.12, 5402.81, 18052.59, 2919.13, 748.59, 2474.44, 5198.8, 1885.79, 2519.62, 240.85, 3143.74, 1363.27, 398.54, 563.74, 1587.72],
        2008: [8375.76, 2886.65, 5276.04, 2759.46, 3212.06, 5207.72, 2412.26, 2905.68, 7872.23, 11888.53, 8799.31, 3234.64, 4346.4, 2355.86, 10358.64, 5099.76, 4466.85, 4633.67, 16321.46, 2529.51, 643.47, 2160.48, 4561.69, 1652.34, 2218.81, 218.67, 2699.74, 1234.21, 355.93, 475, 1421.38]
      });

      dataMap.dataEstate = dataFormatter({
        //max : 3600,
        2011: [1074.93, 411.46, 918.02, 224.91, 384.76, 876.12, 238.61, 492.1, 1019.68, 2747.89, 1677.13, 634.92, 911.16, 402.51, 1838.14, 987, 634.67, 518.04, 3321.31, 465.68, 208.71, 396.28, 620.62, 160.3, 222.31, 17.44, 398.03, 134.25, 29.05, 79.01, 176.22],
        2010: [1006.52, 377.59, 697.79, 192, 309.25, 733.37, 212.32, 391.89, 1002.5, 2600.95, 1618.17, 532.17, 679.03, 340.56, 1622.15, 773.23, 564.41, 464.21, 2813.95, 405.79, 188.33, 266.38, 558.56, 139.64, 223.45, 14.54, 315.95, 110.02, 25.41, 60.53, 143.44],
        2009: [1062.47, 308.73, 612.4, 173.31, 286.65, 605.27, 200.14, 301.18, 1237.56, 2025.39, 1316.84, 497.94, 656.61, 305.9, 1329.59, 622.98, 546.11, 400.11, 2470.63, 348.98, 121.76, 229.09, 548.14, 136.15, 205.14, 13.28, 239.92, 101.37, 23.05, 47.56, 115.23],
        2008: [844.59, 227.88, 513.81, 166.04, 273.3, 500.81, 182.7, 244.47, 939.34, 1626.13, 1052.03, 431.27, 506.98, 281.96, 1104.95, 512.42, 526.88, 340.07, 2057.45, 282.96, 95.6, 191.21, 453.63, 104.81, 195.48, 15.08, 193.27, 93.8, 19.96, 38.85, 89.79]
      });

      dataMap.dataFinancial = dataFormatter({
        //max : 3200,
        2011: [2215.41, 756.5, 746.01, 519.32, 447.46, 755.57, 207.65, 370.78, 2277.4, 2600.11, 2730.29, 503.85, 862.41, 357.44, 1640.41, 868.2, 674.57, 501.09, 2916.13, 445.37, 105.24, 704.66, 868.15, 297.27, 456.23, 31.7, 432.11, 145.05, 62.56, 134.18, 288.77],
        2010: [1863.61, 572.99, 615.42, 448.3, 346.44, 639.27, 190.12, 304.59, 1950.96, 2105.92, 2326.58, 396.17, 767.58, 241.49, 1361.45, 697.68, 561.27, 463.16, 2658.76, 384.53, 78.12, 496.56, 654.7, 231.51, 375.08, 27.08, 384.75, 100.54, 54.53, 97.87, 225.2],
        2009: [1603.63, 461.2, 525.67, 361.64, 291.1, 560.2, 180.83, 227.54, 1804.28, 1596.98, 1899.33, 359.6, 612.2, 165.1, 1044.9, 499.92, 479.11, 402.57, 2283.29, 336.82, 65.73, 389.97, 524.63, 194.44, 351.74, 23.17, 336.21, 88.27, 45.63, 75.54, 198.87],
        2008: [1519.19, 368.1, 420.74, 290.91, 219.09, 455.07, 147.24, 177.43, 1414.21, 1298.48, 1653.45, 313.81, 497.65, 130.57, 880.28, 413.83, 393.05, 334.32, 1972.4, 249.01, 47.33, 303.01, 411.14, 151.55, 277.66, 22.42, 287.16, 72.49, 36.54, 64.8, 171.97]
      });


      option = {
        baseOption: {
          timeline: {
            // y: 0,
            axisType: 'category',
            // realtime: false,
            // loop: false,
            autoPlay: true,
            // currentIndex: 2,
            playInterval: 1000,
            // controlStyle: {
            //     position: 'left'
            // },
            data: [
              '2008-01-01', '2009-01-01', '2010-01-01',
              {
                value: '2011-01-01',
                tooltip: {
                  formatter: function(params) {
                    return params.name + 'GDP达到又一个高度';
                  }
                },
                symbol: 'diamond',
                symbolSize: 18
              },
            ],
            label: {
              formatter: function(s) {
                return (new Date(s)).getFullYear();
              }
            }
          },
          title: {
            subtext: '数据来自国家统计局'
          },
          tooltip: {},
          legend: {
            x: 'right',
            data: ['第一产业', '第二产业', '第三产业'],
            selected: {
              'GDP': false, '金融': false, '房地产': false
            }
          },
          calculable: true,
          grid: {
            top: 80,
            bottom: 100
          },
          xAxis: [
            {
              'type': 'category',
              'axisLabel': { 'interval': 0 },
              'data': [
                '北京', '\n天津', '河北', '\n山西', '内蒙古', '\n辽宁', '吉林', '\n黑龙江',
                '上海', '\n江苏', '浙江', '\n安徽', '福建', '\n江西', '山东', '\n河南',
                '湖北', '\n湖南', '广东', '\n广西', '海南', '\n重庆', '四川', '\n贵州',
                '云南', '\n西藏', '陕西', '\n甘肃', '青海', '\n宁夏', '新疆'
              ],
              splitLine: { show: false }
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: 'GDP（亿元）',
              // max: 53500
              max: 30000
            }
          ],
          series: [
            { name: 'GDP', type: 'bar' },
            { name: '金融', type: 'bar' },
            { name: '房地产', type: 'bar' },
            { name: '第一产业', type: 'bar' },
            { name: '第二产业', type: 'bar' },
            { name: '第三产业', type: 'bar' },
            {
              name: 'GDP占比',
              type: 'pie',
              center: ['75%', '35%'],
              radius: '28%'
            }
          ]
        },
        options: [
          {
            title: { text: '2008全国宏观经济指标' },
            series: [
              { data: dataMap.dataGDP['2008'] },
              { data: dataMap.dataFinancial['2008'] },
              { data: dataMap.dataEstate['2008'] },
              { data: dataMap.dataPI['2008'] },
              { data: dataMap.dataSI['2008'] },
              { data: dataMap.dataTI['2008'] },
              {
                data: [
                  { name: '第一产业', value: dataMap.dataPI['2008sum'] },
                  { name: '第二产业', value: dataMap.dataSI['2008sum'] },
                  { name: '第三产业', value: dataMap.dataTI['2008sum'] }
                ]
              }
            ]
          },
          {
            title: { text: '2009全国宏观经济指标' },
            series: [
              { data: dataMap.dataGDP['2009'] },
              { data: dataMap.dataFinancial['2009'] },
              { data: dataMap.dataEstate['2009'] },
              { data: dataMap.dataPI['2009'] },
              { data: dataMap.dataSI['2009'] },
              { data: dataMap.dataTI['2009'] },
              {
                data: [
                  { name: '第一产业', value: dataMap.dataPI['2009sum'] },
                  { name: '第二产业', value: dataMap.dataSI['2009sum'] },
                  { name: '第三产业', value: dataMap.dataTI['2009sum'] }
                ]
              }
            ]
          },
          {
            title: { text: '2010全国宏观经济指标' },
            series: [
              { data: dataMap.dataGDP['2010'] },
              { data: dataMap.dataFinancial['2010'] },
              { data: dataMap.dataEstate['2010'] },
              { data: dataMap.dataPI['2010'] },
              { data: dataMap.dataSI['2010'] },
              { data: dataMap.dataTI['2010'] },
              {
                data: [
                  { name: '第一产业', value: dataMap.dataPI['2010sum'] },
                  { name: '第二产业', value: dataMap.dataSI['2010sum'] },
                  { name: '第三产业', value: dataMap.dataTI['2010sum'] }
                ]
              }
            ]
          },
          {
            title: { text: '2011全国宏观经济指标' },
            series: [
              { data: dataMap.dataGDP['2011'] },
              { data: dataMap.dataFinancial['2011'] },
              { data: dataMap.dataEstate['2011'] },
              { data: dataMap.dataPI['2011'] },
              { data: dataMap.dataSI['2011'] },
              { data: dataMap.dataTI['2011'] },
              {
                data: [
                  { name: '第一产业', value: dataMap.dataPI['2011sum'] },
                  { name: '第二产业', value: dataMap.dataSI['2011sum'] },
                  { name: '第三产业', value: dataMap.dataTI['2011sum'] }
                ]
              }
            ]
          }
        ]
      };
      return option;
    },
    surfaceOption(option) {/**3D面图*/
      option = {
        title: {
          text: "surface面图"
        },
        tooltip: {},
        backgroundColor: '#333',
        visualMap: {
          show: false,
          dimension: 2,
          min: -1,
          max: 1,
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
        },
        xAxis3D: {
          type: 'value'
        },
        yAxis3D: {
          type: 'value'
        },
        zAxis3D: {
          type: 'value'
        },
        grid3D: {
          viewControl: {
            // projection: 'orthographic'
          }
        },
        series: [{
          type: 'surface',
          wireframe: {
            // show: false
          },
          equation: {
            x: {
              step: 0.1
            },
            y: {
              step: 0.11
            },
            z: function(x, y) {
              if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) {
                return '-';
              }
              return Math.sin(x * Math.PI) * Math.sin(y * Math.PI);
            }
          }
        }]
      }
      return option;
    },
    bar3DOption(option) {/**3D柱图*/
      var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
        '7a', '8a', '9a', '10a', '11a',
        '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'];
      var days = ['Saturday', 'Friday', 'Thursday',
        'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

      var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];
      option = {
        title: {
          text: "3D柱状图"
        },
        tooltip: {},
        visualMap: {
          max: 20,
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
        },
        xAxis3D: {
          type: 'category',
          data: hours
        },
        yAxis3D: {
          type: 'category',
          data: days
        },
        zAxis3D: {
          type: 'value'
        },
        grid3D: {
          boxWidth: 200,
          boxDepth: 80,
          light: {
            main: {
              intensity: 1.2
            },
            ambient: {
              intensity: 0.3
            }
          }
        },
        series: [{
          type: 'bar3D',
          data: data.map(function(item) {
            return {
              value: [item[1], item[0], item[2]]
            }
          }),
          shading: 'color',

          label: {
            show: false,
            textStyle: {
              fontSize: 16,
              borderWidth: 1
            }
          },

          itemStyle: {
            opacity: 0.4
          },

          emphasis: {
            label: {
              textStyle: {
                fontSize: 20,
                color: '#900'
              }
            },
            itemStyle: {
              color: '#900'
            }
          }
        }]
      }
      return option;
    },
    scatter3DOption(option) {/**3D散点图*/
    console.log("item");
      var data = [[0, 0, 0, 4], [0, 0, 1, 4.775511104], [0, 0, 2, 5.258815616], [0, 0, 3, 5.299167424], [0, 1, 0, 3.224489009777778], [0, 1, 1, 4], [0, 1, 2, 4.586919999999999], [0, 1, 3, 4.8206], [0, 2, 0, 2.762794582913581], [0, 2, 1, 3.41948], [0, 2, 2, 4.000115681975308], [0, 2, 3, 4.336600154074074], [0, 3, 0, 2.9055578239999997], [0, 3, 1, 3.306337777777778], [0, 3, 2, 3.7023150190617287], [0, 3, 3, 4.00153664], [1, 0, 0, 3.9999999578600822], [1, 0, 1, 4.724260928], [1, 0, 2, 5.171919999999999], [1, 0, 3, 5.195634238683128], [1, 1, 0, 3.275739072], [1, 1, 1, 4], [1, 1, 2, 4.552536128], [1, 1, 3, 4.780361856], [1, 2, 0, 2.832560000000001], [1, 2, 1, 3.4480577991111114], [1, 2, 2, 4], [1, 2, 3, 4.346682496], [1, 3, 0, 2.8889935802469138], [1, 3, 1, 3.265854778469136], [1, 3, 2, 3.6626877440000003], [1, 3, 3, 4.00003236345679], [2, 0, 0, 3.990995750452675], [2, 0, 1, 4.583506666666667], [2, 0, 2, 4.946584880987654], [2, 0, 3, 4.977777351374486], [2, 1, 0, 3.410946666666667], [2, 1, 1, 3.9996480431934156], [2, 1, 2, 4.462219328], [2, 1, 3, 4.69041568], [2, 2, 0, 3.0533607669465024], [2, 2, 1, 3.5377806720000002], [2, 2, 2, 4][2, 2, 3, 4.352251968], [2, 3, 0, 3.0406555970370372], [2, 3, 1, 3.3160881920000005], [2, 3, 2, 3.648021212444444], [2, 3, 3, 4], [3, 0, 0, 3.9025117866666665], [3, 0, 1, 4.342124444444445], [3, 0, 2, 4.636460206617284], [3, 0, 3, 4.70350656], [3, 1, 0, 3.5356576131687243], [3, 1, 1, 3.9691889103539095], [3, 1, 2, 4.3396727466666665], [3, 1, 3, 4.574863672888889], [3, 2, 0, 3.3287808013168725], [3, 2, 1, 3.648485930666667], [3, 2, 2, 3.999777408526749], [3, 2, 3, 4.3522013790288065], [3, 3, 0, 3.2995444906666664], [3, 3, 1, 3.4232880107983537], [3, 3, 2, 3.647748032], [3, 3, 3, 4]]
      option = {
        title: {
          text: "3D散点图"
        },
        visualMap: {
          show: false,
          min: 2,
          max: 6,
          inRange: {
            symbolSize: [25, 25],
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
            colorAlpha: [0.2, 1]
          }
        },
        xAxis3D: {
          type: 'value'
        },
        yAxis3D: {
          type: 'value'
        },
        zAxis3D: {
          type: 'value'
        },
        grid3D: {
          axisLine: {
            lineStyle: { color: '#fff' }
          },
          axisPointer: {
            lineStyle: { color: '#fff' }
          },
          viewControl: {
            // autoRotate: true
          }
        },
        series: [{
          type: 'scatter3D',
          data: data
        }]
      }
      console.log(option);
      return option
    },
    /*事件处理*/
    handlerStart(e) {/*开始拖拽*/
      e = e || window.event;
      var target = e.target || e.srcElement;
      let me = this;
      /*提升当前元素层级,降低兄弟元素层级*/
      let tempDom = document.getElementById(this.id).parentElement;/*获得li标签*/
      var maxIndex = 0;
      let tempArr = []/*用于记录当前新建元素的索引*/
      for (let i = 0; i < tempDom.parentElement.children.length; i++) {
        var element = tempDom.parentElement.children[i];
        if (element.style.zIndex == 999) {
          /*新增的父容器层级为999*/
          tempArr.push(i);
        } else {
          element.style.zIndex >= maxIndex ? maxIndex = element.style.zIndex : "";
        }
      }
      for (var i = 0; i < tempArr.length; i++) {
        /*maxIndex需要增加,新增元素的z-index也增加*/
        tempDom.parentElement.children[tempArr[i]].style.zIndex = maxIndex++;
      }
      if (maxIndex > 666) {/*对数值做出限制*/
        console.log("粗暴的重置zIndex");
        for (let i = 0; i < tempDom.parentElement.children.length; i++) {
          var element = tempDom.parentElement.children[i];
          element.style.zIndex = 1;
        }
        maxIndex = 1;
      }
      tempDom.style.zIndex = maxIndex * 1 + 1;
      /*拖拽过程中以px移动,结束后以%固定*/
      tempDom.style.width = tempDom.offsetWidth + "px";
      tempDom.style.height = tempDom.offsetHeight + "px";
      tempDom.style.top = parseFloat(tempDom.style.top) / 100 * tempDom.parentElement.offsetHeight + "px";
      tempDom.style.left = parseFloat(tempDom.style.left) / 100 * tempDom.parentElement.offsetWidth + "px";
      this.screenX = e.x;
      this.screenY = e.y;
      document.body.style.userSelect = "none";
      if (target.classList.contains("dragHandler")) {
        window.addEventListener("mousemove", me.dragMove);
      } else if (target.classList.contains("resizeHandler")) {
        window.addEventListener("mousemove", me.resizeMove);
      }
      target.setCapture && target.setCapture();
      return false;
    },
    handlerEnd(e) {/*结束拖拽*/
      e = e || window.event;
      let me = this;
      /*将元素宽高以%保存*/
      if (document.getElementById(this.id)) {
        let tempDom = document.getElementById(this.id).parentElement;/*获得li标签*/
        if (tempDom.style.width.match("px")) {
          /*如果此次元素的宽高以px结尾,则进行了拖拽,就需要执行以下操作*/
          tempDom.style.width = tempDom.offsetWidth / tempDom.parentElement.offsetWidth * 100 + "%";
          tempDom.style.height = tempDom.offsetHeight / tempDom.parentElement.offsetHeight * 100 + "%";

          this.parentDom.style.top = parseFloat(this.parentDom.style.top) / this.parentDom.parentElement.offsetHeight * 100 + "%";
          this.parentDom.style.left = parseFloat(this.parentDom.style.left) / this.parentDom.parentElement.offsetWidth * 100 + "%";
          document.body.style.userSelect = "text";
          window.removeEventListener("mousemove", me.dragMove);
          window.removeEventListener("mousemove", me.resizeMove);
          document.releaseCapture && document.releaseCapture();
        }
      }
    },
    dragMove(e) {/*拖拽移动*/
      e = e || window.event;
      let tempDom = document.getElementById(this.id).parentElement;/*获得li标签*/
      let parentWidth = tempDom.parentElement.offsetWidth;/**父盒子宽度*/
      let parentHeight = tempDom.parentElement.offsetHeight;/**父盒子高度*/
      let tempTop = (parseInt(tempDom.style.top) || 0) + (e.y - this.screenY);
      let tempLeft = (parseInt(tempDom.style.left) || 0) + (e.x - this.screenX);
      this.screenX = e.x;
      this.screenY = e.y;
      // if (top <= 0 || top >= (parentHeight - tempDom.offsetHeight)) {
      /*在父盒子之内移动应该不考虑高度限制*/
      // tempTop <= 0 && (tempTop = (parseInt(this.parentDom.style.top) || 0));
      tempTop <= 0 && (tempTop = (parseInt(this.parentDom.style.top) || 0));
      /*left采用另一种写法,(没有原因)*/
      if (tempLeft <= 0 || tempLeft >= (parentWidth - this.parentDom.offsetWidth - 2)) {
        tempLeft = (parseInt(this.parentDom.style.left) || 0);
      }
      tempDom.style.left = tempLeft + "px";
      tempDom.style.top = tempTop + "px";
    },
    resizeMove(e) {/*缩放移动*/
      var e = e || window.event;
      /**解构赋值*/
      var [target, isLeft, isTop, lockX, lockY] = this.resizeFlag;
      var disX = e.x - this.screenX;/**水平位移*/
      var disY = e.y - this.screenY;/**竖直位移*/
      var tempDom = document.getElementById(this.id).parentElement;/*获得容器标签*/
      var parentWidth = tempDom.parentElement.offsetWidth;/**父盒子宽度*/
      var parentHeight = tempDom.parentElement.offsetHeight;/**父盒子高度*/
      var tempWidth = isLeft ? (tempDom.offsetWidth - disX) : (tempDom.offsetWidth + disX);
      var tempHeight = isTop ? (tempDom.offsetHeight - disY) : (tempDom.offsetHeight + disY);
      var tempTop = isTop ? (parseFloat(tempDom.style.top) + disY) : "";
      var tempLeft = isLeft ? parseFloat(tempDom.style.left) + disX : "";
      /**TODO: 宽高限制 */
      isTop && tempTop <= 0 && disY && (tempTop = parseFloat(tempDom.style.top));
      isLeft && tempLeft <= 0 && disX && (tempLeft = parseFloat(tempDom.style.left));

      if (tempWidth <= parentWidth * 0.2 || (tempWidth + tempDom.offsetLeft + 2) >= parentWidth) {
        tempWidth = tempDom.offsetWidth;
      }
      if (tempHeight <= parentWidth * 0.2) {
        tempHeight = tempDom.offsetHeight;
      }
      lockX || (this.parentDom.style.width = tempWidth + "px");
      lockY || (this.parentDom.style.height = tempHeight + "px");
      isLeft && (this.parentDom.style.left = tempLeft + "px");
      isTop && (this.parentDom.style.top = tempTop + "px");

      this.screenX = e.x;
      this.screenY = e.y;
      /*调用实例resize*/
      this.instanceId.resize();
    },
    MaxBtn() {/*最大化按钮*/

    },
    MinBtn() {/*最小化按钮*/

    },
    RevertBtn() {/*还原按钮*/

    },
    close() {/*删除实例*/
      this.$confirm('此操作将永久删除该图表, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        /*暴露删除echarts实例事件*/
        this.$emit("delEcharts", this.instanceId);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    resize(e, a, b, c, d) {
      this.resizeFlag = [e.target || e.srcElement, a, b, c, d];
      window.addEventListener("mousemove", this.resizeMove);
    }
  },
  watch: {
    list(val) {
      /**监听数据来源的改变,改变数据,刷新echarts实例*/
      for (let i = 0; i < val.length; i++) {
        this.echartsOption.series[i] = {
          name: val[val.length - 1 - i].title,
          data: val[val.length - 1 - i].data
        };
        this.echartsOption.legend.data[i] = val[val.length - 1 - i].title;
      }
      this.instanceId.setOption(this.echartsOption);
    }
  }
};
</script>
<style>
.my_echarts {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 3px;
}

.my_echarts>.content {
  width: 100%;
  height: 100%;
}

.my_echarts .dragTitle {
  position: absolute;
  height: 20px;
  width: 80%;
  top: 2px;
  right: 0px;
  z-index: 2;
}

.my_echarts .dragTitle h2 {
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  color: #000;
  cursor: move;
  /*background-color: #999;*/
  position: absolute;
  width: calc(100% - 78px);
  top: 0px;
  right: 78px;
}

.my_echarts .dragTitle div {
  position: absolute;
  height: 20px;
  top: 0px;
  right: 0px;
}

.my_echarts .dragTitle a,
a.open {
  float: left;
  width: 21px;
  height: 19px;
  display: block;
  margin-left: 5px;
  background: url("/static/image/tool.png") no-repeat;
}

a.open {
  position: absolute;
  top: 10px;
  left: 50%;
  margin-left: -10px;
  background-position: 0 0;
}

a.open:hover {
  background-position: 0 -29px;
}

.my_echarts .dragTitle a.min {
  background-position: -29px 0;
}

.my_echarts .dragTitle a.min:hover {
  background-position: -29px -29px;
}

.my_echarts .dragTitle a.max {
  background-position: -60px 0;
}

.my_echarts .dragTitle a.max:hover {
  background-position: -60px -29px;
}

.my_echarts .dragTitle a.revert {
  background-position: -149px 0;
  display: none;
}

.my_echarts .dragTitle a.revert:hover {
  background-position: -149px -29px;
}

.my_echarts .dragTitle a.close {
  background-position: -89px 0;
}

.my_echarts .dragTitle a.close:hover {
  background-position: -89px -29px;
}

.my_echarts .content {
  /*overflow: auto;*/
}

.my_echarts .resizeL,
.my_echarts .resizeT,
.my_echarts .resizeR,
.my_echarts .resizeB,
.my_echarts .resizeLT,
.my_echarts .resizeTR,
.my_echarts .resizeLB,
.my_echarts .resizeBR {
  position: absolute;
  /*background: #000;*/
  /*overflow: hidden;*/
  /*opacity: 0;*/
  filter: alpha(opacity=0);
}

.my_echarts .resizeL,
.my_echarts .resizeR {
  top: 0;
  width: 5px;
  height: 100%;
  left: -3px;
  cursor: w-resize;
}

.my_echarts .resizeR {
  left: auto;
  right: -3px;
}

.my_echarts .resizeT,
.my_echarts .resizeB {
  width: 100%;
  height: 5px;
  cursor: n-resize;
}

.my_echarts .resizeT {
  top: -3px;
}

.my_echarts .resizeB {
  top: auto;
  bottom: -3px;
}

.my_echarts .resizeLT,
.my_echarts .resizeTR,
.my_echarts .resizeLB,
.my_echarts .resizeBR {
  width: 8px;
  height: 8px;
  /*background: #FF0;*/
}

.my_echarts .resizeLT {
  top: -3px;
  left: -3px;
  cursor: nw-resize;
}

.my_echarts .resizeTR {
  top: -3px;
  right: -3px;
  cursor: ne-resize;
}

.my_echarts .resizeLB {
  left: -3px;
  bottom: -3px;
  cursor: ne-resize;
}

.my_echarts .resizeBR {
  right: -3px;
  bottom: -3px;
  cursor: nw-resize;
}
</style>

