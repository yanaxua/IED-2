<template>
  <div id="edit">
    <div class="editHeader">
      <div class="systemOption">
        <div class="login"></div>
        <el-input class="reportTitle" :value="report.title" @blur="reportTitleBlur"></el-input>
      </div>
      <div></div>
      <div></div>
    </div>
    <div class="editContainer">
      <div class="canvasShow"></div>
      <div class="optionSet">
        <div class="canvasOption"></div>
        <div class="dataOption"></div>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  components: {},
  data() {
    return {
      report: {
        title: "东阿阿胶2017销售报告",
        data: {},
        pages: [
          { name: "页面1", content: "hellow" },
          { name: "页面2", content: "world" }
        ]
      }
    }
  },
  computed: {

  },
  props: {

  },
  methods: {
    reportTitleBlur(e) {
      e = e || window.event;
      this.report.title = e.target.value;
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
#edit {
  width: 100%;
  height: 100%;
}

#edit .editHeader {
  height: 64px;
  background-color: #13589e;
  display: flex;
}

#edit .reportTitle {}

#edit .reportTitle .el-input__inner {
  color: #fff;
  background-color: #13589e;
  border-color: transparent;
}

#edit .reportTitle .el-input__inner:hover {
  border-color: #ccc;
}

#edit .editContainer {
  height: calc(100% - 64px);
  display: flex;
}

#edit .editContainer .canvasShow {
  flex: 1;
}

#edit .editContainer .optionSet {
  display: flex;
}

#edit .editContainer .canvasOption {
  width: 200px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

#edit .editContainer .dataOption {
  width: 200px;
}
</style>