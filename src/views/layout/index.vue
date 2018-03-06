<template>
  <div id="layout">
    <!--头部-->
    <div class="layoutHeader">
      <div class="pageTitle">工业能效大数据平台(IED)</div>
      <div class="options fr">
        <!--展示编辑操作-->
        <div class="viewOption fl">
          <el-menu @select="viewOptionSelect" default-active="reportCenter" class="el-menu-demo" mode="horizontal">
            <el-menu-item index="reportCenter">报表中心</el-menu-item>
            <el-menu-item index="dataBase">数据源</el-menu-item>
          </el-menu>
        </div>
        <!---->
        <div class="infoOption fr">
          <el-menu @select="infoOptionSelect" @open="infoOptionOpen" class="el-menu-demo" mode="horizontal">
            <el-menu-item index="project">项目管理</el-menu-item>
            <el-submenu index="userManage">
              <template slot="title">用户管理</template>
              <el-menu-item index="userCenter">用户中心</el-menu-item>
              <el-menu-item index="logout">安全退出</el-menu-item>
            </el-submenu>
            <el-menu-item index="userMessage">
              <el-badge :value="12" :max="99" class="item">
                <i class="el-icon-message"></i>
              </el-badge>
            </el-menu-item>
            <el-menu-item index="userSetting">
              <i class="el-icon-setting"></i>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
    </div>
    <!--内容展示区-->
    <div class="layoutContainer">
      <transition>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>
    </div>

  </div>
</template>
  
<script>
export default {
  components: {},
  data() {
    return {

    }
  },
  computed: {

  },
  props: {

  },
  methods: {
    viewOptionSelect(index, indexPath) {
      this.$router.push({ path: '/layout/' + index });
    },
    infoOptionSelect(index, indexPath) {
      switch (index) {
        case "logout":
          /**清除登录记录缓存*/
          this.$confirm('将注销登录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$router.push({ path: '/' });
          }).catch(() => {
            // this.$message({
            //   type: 'info',
            //   message: '已取消删除'
            // });
          });
          break;
        case "userMessage":
          break;
        case "userSetting":
          break;
        default:
          this.$router.push({ path: '/layout/' + index });
          break;
      }
    },
    infoOptionOpen(index, indexPath) {
      console.log(index);
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
#layout {
  width: 100%;
  height: 100%;
}

#layout .layoutHeader {
  height: 64px;
  background-color: #13589e;
  display: flex;
}
#layout .layoutContainer {
  height: calc(100% - 64px);
}

#layout .pageTitle {
  line-height: 64px;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-left: 15px;
  display: inline-block;
}

#layout .options {
  flex: 1;
  margin-left: 50px;
}

#layout .options .el-menu {
  background-color: transparent;
}

#layout .options .el-menu-item,
#layout .options .el-submenu__title {
  color: #fff;
  height: 64px;
  font-size: 14px;
  font-weight: 700;
}

#layout .options .el-menu-item:hover,
#layout .options .el-submenu__title:hover {
  background-color: rgba(0, 0, 0, .2);
}

#layout .viewOption .el-menu-item.is-active {
  background-color: rgba(0, 0, 0, .3);
  border-bottom: 5px solid #20a0ff;
}

#layout .viewOption .el-menu-item.is-active .el-submenu__title {
  border-bottom: 5px solid #20a0ff;
}

#layout .options .el-submenu {
  color: #fff;
  height: 64px;
  font-size: 14px;
  font-weight: 700;
}

#layout .options .el-submenu>.el-menu .el-menu-item {
  color: #000;
  background-color: rgba(64, 55, 48, 0.13);
}

#layout .options .el-badge__content {
  top: 15px;
}
</style>