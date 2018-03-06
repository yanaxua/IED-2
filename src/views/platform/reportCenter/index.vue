<template>
  <div id="reportCenter">
    <!--报告列表以及操作-->
    <div class="rcNavi" ref="rcNavi">
      <div class="rcHeader">
        <h3 class="rcTitle fl">报表</h3>
        <span @click="reportSort" class="reportIcon iconfont my-paixu fr"></span>
        <span @click="reportAdd" class="reportIcon el-icon-plus fr"></span>
        <el-input class="reportSearch" icon="search" placeholder="搜索报表" v-model="reportSearch" :on-icon-click="reportSearchClick" @change="reportSearchClick">
        </el-input>
      </div>
      <ul class="reportLis">
        <li v-for="(item,index) in reportLis" :key="index" v-text="item.title" @click="reportChoose(item)"></li>
      </ul>
      <div ref="direction" class="direction el-icon-arrow-left" @click="direction"></div>
    </div>
    <!--报告预览box-->
    <div class="rcContainer">
      <div v-show="!reportCurrent.title" class="emptyTip">
        <i class="el-icon-picture"></i>
        <span class="el-icon-caret-left">&nbsp;&nbsp;&nbsp;&nbsp;请在左侧新建或者选择报告</span>
      </div>
      <div v-show="reportCurrent.title" class="reportShow">
        <div class="rcOption clearfix">
          <el-input class="fl" :value="reportCurrent.title" @blur="reportTitleBlur"></el-input>
          <el-button-group class="fr">
            <el-button @click="reportEdit" type="primary" class="iconfont my-bianji">编辑报告</el-button>
            <el-button :plain="true" type="primary" class="iconfont my-icon-refresh">刷新数据</el-button>
            <el-button :plain="true" type="primary" class="iconfont my-wenjiandaochu">导出</el-button>
            <el-button :plain="true" type="primary" class="iconfont my-caozuo-quanping-zhankai">全屏 </el-button>
          </el-button-group>
        </div>
        <el-tabs class="rcDisplay" v-model="pageCurrent" type="card" @tab-click="pageClick">
          <el-tab-pane :key="item.title" v-for="(item, index) in reportCurrent.pages" :label="item.title" :name="item.title">
            {{item.content}}
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  components: {},
  data() {
    return {
      reportLis: [
        {
          title: "东阿阿胶2017销售报告",
          data: {},
          pages: [
            { name: "页面1", content: "hellow" },
            { name: "页面2", content: "world" }
          ]
        }
      ],/**已有列表*/
      reportSearch: "",
      reportCurrent: {},
      pageCurrent: 0,
    }
  },
  computed: {

  },
  props: {

  },
  methods: {
    direction() {/**侧边栏显隐*/
      if (this.$refs.rcNavi.classList.contains("hiddenNavi")) {
        this.$refs.rcNavi.classList.remove("hiddenNavi");
        this.$refs.rcNavi.classList.add("showNavi");
      } else {
        this.$refs.rcNavi.classList.remove("showNavi");
        this.$refs.rcNavi.classList.add("hiddenNavi");
      }
      this.$refs.direction.classList.toggle("el-icon-arrow-left");
      this.$refs.direction.classList.toggle("el-icon-arrow-right");
    },
    reportSort() {
      console.log("报表排序");
    },
    reportAdd() {
      console.log("报表添加");
    },
    reportSearchClick() {
      console.log("报表搜索");
    },
    reportChoose(item) {/**选择报表*/
      this.reportCurrent = item;
    },
    reportTitleBlur(e) {
      e = e || window.event;
      this.reportCurrent.title = e.target.value;
    },
    pageClick() {/**点击报表页*/

    },
    reportEdit() {/**跳转编辑页*/
      this.$router.push({ path: '/edit' });
    }
  },
  created() {

  },
  mounted() {

  },
  watch: {}
}
</script>
  
<!-- Add 'scoped' attribute to limit CSS to this component only  -->
<style>
#reportCenter {
  display: flex;
  height: 100%;
}

#reportCenter .rcNavi {
  width: 200px;
  border-right: 1px solid #ccc;
  position: relative;
  z-index: 2;
}

#reportCenter .rcNavi.showNavi {
  animation: showNavi 0.6s ease forwards;
}

#reportCenter .rcNavi.hiddenNavi {
  animation: hiddenNavi 0.6s ease forwards;
}

@keyframes showNavi {
  from {
    width: 0;
    display: none;
  }
  to {
    width: 200px;
  }
}

@keyframes hiddenNavi {
  from {
    width: 200px;
  }
  to {
    width: 0;
    display: none;
  }
}

#reportCenter .direction {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(100%, -50%);
  cursor: pointer;
  border: 1px solid #ccc;
  line-height: 32px;
}

#reportCenter .rcHeader {
  height: 100px;
  width: 200px;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  top: 0;
}

#reportCenter .rcNavi .rcTitle {
  color: #333;
}

#reportCenter .rcNavi .reportIcon {
  color: #1881dc;
  margin-left: 20px;
  cursor: pointer;
}

#reportCenter .reportSearch {
  margin-top: 10px;
}

#reportCenter .reportLis {
  padding: 20px;
  width: 200px;
  position: absolute;
  right: 0;
  top: 100px;
}

#reportCenter .reportLis li {
  height: 30px;
  line-height: 30px;
  cursor: pointer;
}

#reportCenter .reportLis li:hover {
  background-color: #ccc;
  color: #1881dc;
}

#reportCenter .rcContainer {
  flex: 1;
}

#reportCenter .emptyTip {
  height: 100%;
  text-align: center;
}

#reportCenter .emptyTip i {
  margin-top: 8%;
  display: block;
  font-size: 400px;
  color: #999;
}

#reportCenter .emptyTip span {
  font-size: 20px;
  color: #999;
}

#reportCenter .reportShow {
  height: 100%;
}

#reportCenter .reportShow .rcOption {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  height: 56px;
}

#reportCenter .reportShow .rcDisplay {
  height: calc(100% - 70px);
}

#reportCenter .reportShow .el-tabs__header {
  margin: 0;
  border-top: 1px solid #d1dbe5;
  width: 100%;
}

#reportCenter .reportShow .el-tabs__content {
  width: 100%;
  height: calc(100% - 28px);
}

#reportCenter .reportShow .el-tabs__nav-wrap {
  margin-top: -1px;
}

#reportCenter .reportShow .el-tabs__item {
  border: 1px solid #d1dbe5;
  height: 28px;
  line-height: 28px;
}

#reportCenter .reportShow .el-tabs__item.is-active {
  border: 1px solid #d1dbe5;
  border-top-color: #fff;
}

#reportCenter .reportShow .el-input {
  width: auto;
  font-size: 16px;
}

#reportCenter .reportShow .el-input__inner {
  border-color: transparent;
}

#reportCenter .reportShow .el-input__inner:hover {
  border-color: #bfcbd9;
}

#reportCenter .reportShow .el-tabs {
  position: relative;
}

#reportCenter .reportShow .el-tabs__header {
  position: absolute;
  bottom: 0;
}

#reportCenter .reportShow .el-tabs__content {
  position: absolute;
  top: 0;
}
</style>