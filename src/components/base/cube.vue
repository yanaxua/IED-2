<template>
  <div :id="id" @click="faceClick($event)" class="cubeMain" @mousedown="mousedown" @contextmenu="contextmenu" @mouseup="mouseup">
    <el-button class="cubeBnt" round @click="cubeAnimation" icon="el-icon-caret-right" v-text="runFlag?'停止转动':'开启动画'"></el-button>
    <div id="cubeTable">
      <el-table :data="tableData" border max-height="250" style="width: 100%">
        <el-table-column prop="prop1" label="区域">
        </el-table-column>
        <el-table-column prop="prop2" label="时间">
        </el-table-column>
        <el-table-column prop="prop3" label="行业">
        </el-table-column>
        <el-table-column prop="prop4" label="产量">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
  
<script>
export default {
  components: {
  },
  data() {
    return {
      id: "cube" + Number(Math.random().toString().substr(3, 12) + Date.now()).toString(36),
      runFlag: true,/*判断是否需要停止*/
      container: null,
      currentX: null,
      currentY: null,
      rotateX: -11,
      rotateY: 140,
      rotateZ: 0,
      divLis: [],/*立方体集合*/
      tipLis: [],/*坐标轴集合*/
      localData: [],/*立方体本地数据*/
      tableData: [],/*立方体对应表格数据*/
    }
  },
  props: {
    gap: {/*每层间距*/
      type: Number,
      default: 10
    },
    cubeSize: {/*魔方规模*/
      type: Array,
      default: () => {/*x行,x列,x层*/
        return [1, 1, 1]
      }
    },
    long: {/*方块大小*/
      type: Number,
      default: 50
    },
    rate: {/*转动比率*/
      type: Number,
      default: 0.5
    },
    speed: {/*运动速度*/
      type: Number,
      default: 0.03
    },
    ignore: {/*空数据数组,依据cubeSize的坐标数组集合*/
      type: Array,
      default: () => {/*[[3,0,0,5]],层/行/列/面*/
        return []
      }
    },
    data: {/*传输数据*/
      type: Array,
      default: () => {
        return []
      }
    }
  },
  methods: {
    creatTier() {/*创建每一层的盒子*/
      while (this.container.hasChildNodes())/*每次创建,清空子元素*/ {
        this.container.removeChild(this.container.firstChild);
      }
      if (this.data.length) {/*创立时如果传入了数据.忽略cubeSize*/
        this.localSize = [];
        for (let i = 0; i < this.data.length; i++) {
          this.localSize[i] = this.localData[i].length;
        }
      } else {
        this.localSize = this.cubeSize;
      }
      this.container.style.width = (this.localSize[1] * (this.gap + this.long) - this.gap) + "px";
      this.container.style.height = (this.localSize[0] * (this.gap + this.long) - this.gap) + "px";
      // this.container.style.transformOrigin = this.container.style.width / 2 + "px " + this.container.style.height / 2 + "px " + (this.localSize[2] * (this.gap + this.long) - this.gap) / 2 + "px";
      this.container.style.transformOrigin = "50% 50%" + (this.localSize[2] * (this.gap + this.long) - this.gap) / 2 + "px";
      this.container.style.transform = "translate(-50%,-110%) rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY + "deg) rotateZ(" + this.rotateZ + "deg)";
      this.divLis = [];
      this.tipLis = [];
      this.changeTips();/*生成提示坐标轴标签*/
      this.changePosition();/*生成立方体以及改变坐标*/
      /**生成列表数据 */
      this.tableData = this.createInnerData(this.localData);
    },
    mousedown(e) {/**鼠标按下,记录位置,旋转准备*/
      e = e || window.event;
      this.currentX = e.x;
      this.currentY = e.y;
      document.getElementById(this.id).addEventListener("mousemove", this.mousemove);
      // if (window.event){/**ie下的兼容屏蔽右键 */
      //   document.captureEvents(Event.MOUSEUP);
      //   if (e.which == 2 || e.which == 3)
      //     return false;
      //   }
      // else if (e.button == 2 || e.button == 3){
      //   e.cancelBubble = true
      //   e.returnValue = false;
      //   return false;
      // }
    },
    mousemove(e) {/*鼠标移动,转动魔方*/
      e = e || window.event;
      this.runFlag = false;/*停止动画*/
      let gapX = e.x - this.currentX;/*计算移动差,移动差乘系数,得到当前角度变化值*/
      let gapY = e.y - this.currentY;
      /**x左负右正,y上负下正 */
      let angle = 90;
      // if ((this.rotateX >= angle && this.rotateX <= (180-angle))||(this.rotateX >= (angle+180) && this.rotateX <= (360-angle))) {
      //   console.log(123);
      //   this.rotateZ = this.rotateZ - gapY * this.rate;
      //   this.rotateY = this.rotateY - gapX * this.rate;
      // } else {
      //   this.rotateY = this.rotateY + gapX * this.rate;
      //   this.rotateZ = this.rotateZ - gapY * this.rate;
      // }
      /*保持角度处理时处于0-360之间*/
      this.rotateX < 0 ? this.rotateX += 360 : this.rotateX = this.rotateX % 360;
      this.rotateY < 0 ? this.rotateY += 360 : this.rotateY = this.rotateY % 360;
      this.rotateZ < 0 ? this.rotateZ += 360 : this.rotateZ = this.rotateZ % 360;

      /*转动逻辑:
      gapX和gapY
      rotateX决定 Y 和 Z 在轴上转动的分量
      rotateY决定 X 和 Z 在轴上转动的分量
      rotateZ决定 X 和 Y 在轴上转动的分量
      */

      var tempX, tempY, tempZ;
      tempX = Math.cos(this.rotateY / 360) + Math.cos(this.rotateZ / 360);
      tempY = Math.cos(this.rotateX / 360) + Math.cos(this.rotateZ / 360);
      tempZ = Math.cos(this.rotateX / 360) + Math.cos(this.rotateY / 360);
      // console.log(tempX,tempY,tempZ);
      // if ((this.rotateX >= angle) && (this.rotateX <= (180 + angle))) {
      //   this.rotateX = this.rotateX - gapY * this.rate;
      //   this.rotateY = this.rotateY - gapX * this.rate;
      // } else {
      this.rotateX = this.rotateX - gapY * this.rate;
      this.rotateY = this.rotateY + gapX * this.rate;
      // }
      this.container.style.transform = "translate(-50%,-110%) rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY + "deg) rotateZ(" + this.rotateZ + "deg)";
      this.currentX = e.x;
      this.currentY = e.y;
      this.changeTips();
    },
    mouseup(e) {/**鼠标弹起,确定魔方数据的上下跳转级*/
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (target.classList.contains("cubeTip")) {/*如果选择了维度才跳转*/
        let tempArr = this.readTreeCode(target.dataset.treecode);
        if (e.button == 0) {
          let tempChild = this.findData(tempArr);
          if (!tempChild.children) {
            this.$message("没有下级元素");
            return
          }
          this.$set(this.localData, tempArr[0], this.extendDeep(tempChild.children))
        } else if (e.button == 2) {
          if (tempArr.length < 3) {
            this.$message("没有上级元素");
            return
          }
          var flag = false;/*判断走向*/
          if (tempArr.length <= 3) {
            flag = true;
            tempArr.splice(-1, 1);
          } else {
            tempArr.splice(-2, 2);
          }
          let tempChild = this.findData(tempArr);
          if (tempArr.length <= 2 && flag) {
            this.$set(this.localData, tempArr[0], [this.extendDeep(tempChild)])
          } else {
            this.$set(this.localData, tempArr[0], this.extendDeep(tempChild.children))
          }
        }
        this.creatTier();
        /*切换动画*/
      }
    },
    faceClick(e) {/**face点击事件,弹起某一层立方体*/
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (target.classList.contains("face")) {/*如果当前元素含有face类名*/
        this.runFlag = false;/*停止动画*/
        let position = target.coord.split("/");
        /*[层/行业,行/区域,列/时间,面]*/
        // console.log(this.localData[2][position[0]]);/*行业*/
        // console.log(this.localData[0][position[1]]);/*区域*/
        // console.log(this.localData[1][this.localData.length - position[2] - 1] || this.localData[1][position[2]]);/*时间,因为时间在放置的时候是倒序*/
        console.log([
          this.localData[0][position[1]].title,
          this.localData[1][this.localData.length - position[2] - 1] ? this.localData[1][this.localData.length - position[2] - 1].title : this.localData[1][position[2]].title,
          this.localData[2][position[0]].title
        ]);
        this.$emit("click", position);
        this.changeTips(position);
        this.changePosition(position);
        /*根据选择的小立方体展示数据*/
      }
    },
    createInnerData(arr) {
      if (!arr.length) {
        return;
      }
      console.log(arr);
      var tempArr = [];
      var innerFor = () => {
        var number = 0;
        for (let i = 0; i < arr[0].length; i++) {
          for (let j = 0; j < arr[1].length; j++) {
            for (let k = 0; k < arr[2].length; k++) {
              var tempNumber = this.randomNumber(4);
              tempArr[number++] = {
                prop1: arr[0][i].title,
                prop2: arr[1][j].title,
                prop3: arr[2][k].title,
                prop4: tempNumber,
              };
              // this.divLis[i][j][k][0].innerText = tempNumber;
            }
          }
        }
      }
      innerFor();
      return tempArr;
    },
    randomNumber(n) {
      var str = "";
      for (var i = 0; i < n; i++) {
        str += "123456789".substr(Math.floor(Math.random() * 9), 1);
      }
      return str
    },
    contextmenu(event) {/**鼠标右键事件,阻止右键菜单弹出,事件执行在mousedown事件中判断执行,click事件不能被右键触发*/
      event.cancelBubble = true
      event.returnValue = false;
      return false;
    },
    changePosition(position) {/**设置位置*/
      let tempCount = 0;/*第几行间距增大*/
      /*检查第一层第一个的高度,判断是否已经增高*/
      // if (position && this.divLis[0][0][0][0].style.transform.substr(0, 7) == "rotateY") {
      if (position) {
        tempCount = position[1];
        var tempGap = 2 * this.long;/*增大的间距*/
      }
      for (let tier = 0; tier < this.localSize[2]; tier++) {/*魔方层数*/
        if (!this.divLis[tier]) {
          this.divLis[tier] = [];
        }
        for (let i = 0; i < this.localSize[0]; i++) {/*每一行*/
          if (!this.divLis[tier][i]) {
            this.divLis[tier][i] = [];
          }
          for (let j = 0; j < this.localSize[1]; j++) {/*每一列*/
            if (!this.divLis[tier][i][j]) {
              this.divLis[tier][i][j] = [];
            }
            for (let k = 0; k < 6; k++) {/*每一个面*/
              if (!this.divLis[tier][i][j][k]) {
                this.divLis[tier][i][j][k] = document.createElement("div");
                this.divLis[tier][i][j][k].classList.add("face", "cube" + (k + 1));
                // this.divLis[tier][i][j][k].innerText = tier + "/" + i + "/" + j + "/" + k;
                this.container.appendChild(this.divLis[tier][i][j][k]);
                /*这里从Z轴的0平面往上叠加,所以最外层的层数最高*/
                this.divLis[tier][i][j][k].coord = tier + "/" + i + "/" + j + "/" + k;/*层/行/列/面*/
                this.divLis[tier][i][j][k].style.width = this.long + "px";
                this.divLis[tier][i][j][k].style.height = this.long + "px";
                this.divLis[tier][i][j][k].style.top = (this.gap + this.long) * i + "px";
                this.divLis[tier][i][j][k].style.left = (this.gap + this.long) * j + "px";
              }
            }
            let translateZ = (this.gap + this.long) * tier;
            this.divLis[tier][i][j][0].style.transformOrigin = this.long / 2 + "px " + this.long / 2 + "px " + tier * (this.long + this.gap) + "px";
            this.divLis[tier][i][j][1].style.transformOrigin = "0% 0% " + tier * (this.long + this.gap) + "px";
            this.divLis[tier][i][j][2].style.transformOrigin = "0% 0% " + tier * (this.long + this.gap) + "px";
            this.divLis[tier][i][j][3].style.transformOrigin = this.long + "px 0% " + tier * (this.long + this.gap) + "px";
            this.divLis[tier][i][j][4].style.transformOrigin = "0% " + this.long + "px " + tier * (this.long + this.gap) + "px";
            this.divLis[tier][i][j][5].style.transformOrigin = "0% 0% " + tier * (this.long + this.gap) + "px";
            if (i < tempCount) {
              this.divLis[tier][i][j][0].style.transform = "translateY(" + tempGap * -1 + "px)" + "rotateY(180deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][1].style.transform = "translateY(" + tempGap * -1 + "px)" + "rotateY(-90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][2].style.transform = "translateY(" + tempGap * -1 + "px)" + "translateZ(" + (translateZ + this.long) + "px)";
              this.divLis[tier][i][j][3].style.transform = "translateY(" + tempGap * -1 + "px)" + "rotateY(90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][4].style.transform = "translateY(" + tempGap * -1 + "px)" + "rotateX(-90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][5].style.transform = "translateY(" + tempGap * -1 + "px)" + "rotateX(90deg) translateZ(" + translateZ + "px)";
            } else {
              this.divLis[tier][i][j][0].style.transform = "rotateY(180deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][1].style.transform = "rotateY(-90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][2].style.transform = "translateZ(" + (translateZ + this.long) + "px)";
              this.divLis[tier][i][j][3].style.transform = "rotateY(90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][4].style.transform = "rotateX(-90deg) translateZ(" + translateZ + "px)";
              this.divLis[tier][i][j][5].style.transform = "rotateX(90deg) translateZ(" + translateZ + "px)";
            }
          }
        }
      }
      this.container.classList.add("rotate");
    },
    changeTips(position) {/*生成tips标签*/
      let tempCount = 0;/*第几行间距增大*/
      /*检查第一层第一个的高度,判断是否已经增高*/
      // if (position && this.divLis[0][0][0][0].style.transform.substr(0, 7) == "rotateY") {
      if (position) {
        tempCount = position[1];
      }
      let tempGap = 2 * this.long;/*增大的间距*/
      for (let i = 0; i < this.localSize.length; i++) {/*this.localSize.length======3*/
        if (!this.tipLis[i]) {
          this.tipLis[i] = [];
        }
        for (let k = 0; k < this.localSize[i]; k++) {/*0-层,1-行,2-列*/
          if (!this.tipLis[i][k]) {
            this.tipLis[i][k] = document.createElement("div");
            this.tipLis[i][k].classList.add("cubeTip", "cubeTip" + (i + 1));
            this.tipLis[i][k].style.height = this.long + "px";
            this.tipLis[i][k].style.lineHeight = this.long + "px";
            if (this.localData[i]) {
              this.tipLis[i][k].innerText = this.localData[i][k].title;
              this.tipLis[i][k].dataset.treecode = this.localData[i][k].treecode;
            }
            this.container.appendChild(this.tipLis[i][k]);
          }
          if (i == 0) {/*区域*/
            if (k < tempCount) {
              this.tipLis[i][k].style.top = ((this.long + this.gap) * k - tempGap) + "px";
            } else {
              this.tipLis[i][k].style.top = ((this.long + this.gap) * k) + "px";
            }
            this.tipLis[i][k].style.right = (this.long + this.gap) * -1 + "px";
            this.tipLis[i][k].style.transform = "rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY * -1 + "deg)";
          } else if (i == 1) {/*时间*/
            this.tipLis[i][k].style.width = this.long + "px";
            this.tipLis[i][k].style.padding = "0 " + (this.long - 16) / 2 + "px";
            this.tipLis[i][k].style.lineHeight = 30 + "px";
            this.tipLis[i][k].style.bottom = (this.long + this.gap) * -1 + "px";
            this.tipLis[i][k].style.right = ((this.long + this.gap) * k) + "px";
            this.tipLis[i][k].style.transform = "rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY * -1 + "deg)";
          } else if (i == 2) {/*行业*/
            // this.tipLis[i][k].style.width = this.long + "px";
            // this.tipLis[i][k].style.padding = "0 " + (this.long - 16) / 2 + "px";
            // this.tipLis[i][k].style.lineHeight = 30 + "px";
            this.tipLis[i][k].style.left = (this.long + this.gap) * -1 + "px";
            this.tipLis[i][k].style.bottom = (this.long + this.gap) * -1 + "px";
            // this.tipLis[i][k].style.top = (this.long + this.gap) * -1 + "px";
            this.tipLis[i][k].style.transform = "translateZ(" + ((this.long + this.gap) * k + this.long / 2) + "px) rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY * -1 + "deg)";
          }
        }
      }
    },
    render() {/**旋转动画,rate,无则无限循环*/
      this.changeTips();
      if (this.runFlag) {
        this.rotateX = this.rotateX % 360;
        this.rotateY = this.rotateY % 360;
        // this.rotateZ = this.rotateZ % 360;
        this.container.style.transform = "translate(-50%,-110%) rotateX(" + this.rotateX + "deg) rotateY(" + this.rotateY + "deg) rotateZ(" + this.rotateZ + "deg)";
        this.rotateX += this.speed;
        this.rotateY -= this.speed / 2;
        // this.rotateZ += this.speed*5;
        requestAnimationFrame(this.render);
      }
    },
    setIgnore() {/*设置无数据的面*/
      var innerIgnore = function(ele) {
        if (ele.length) {
          for (let i = 0; i < ele.length; i++) {
            innerIgnore(ele[i]);
          }
        } else {
          ele.classList.add("ignore");/*通过修改类名样式*/
        }
      }
      for (let i = 0; i < this.ignore.length; i++) {
        let one = this.ignore[i];/*取出每个忽略数组*/
        let tempDiv = tempDiv = this.divLis;
        for (let j = 0; j < one.length; j++) {/*每个忽略设置,包含层/行/列/面,到哪一级停,则该级别都忽略*/
          tempDiv = tempDiv[one[j]];
          if (j == one.length - 1) {
            innerIgnore(tempDiv);
          }
        }
      }
    },
    cubeAnimation() {/**魔方动画控制*/
      this.runFlag = !this.runFlag;
      this.render();
    },
    readTreeCode(treeCode) {/**treeCode转层级数组 */
      let arr = [];
      for (let i = 0; i < treeCode.length; i++) {
        /*先全部转大写,A-Z 对应65-90*/
        arr.push(treeCode.toUpperCase().charCodeAt(i) - 65);
      }
      return arr;
    },
    findData(arr) {/*根据层级返回数据*/
      let tempLength = 0;
      let innerFind = function(innerData) {
        tempLength++;
        if (tempLength == arr.length) {/*查询的顺序高于修正,放在前面先跳出*/
          return innerData[arr[tempLength - 1]];
        }
        if (tempLength <= 1) {/*根据数据结构实时调整,这里修正第一级没有children的处理,因为先i++,所以为1*/
          return innerFind(innerData[arr[tempLength - 1]]);
        }
        if (!innerData[arr[tempLength - 1]].children) {
          console.log("不存在children");
          return innerData[arr[tempLength - 1]];
        }
        return innerFind(innerData[arr[tempLength - 1]].children);
      }
      return innerFind(this.data);
    },
    extendDeep(parent) {/*简单的深度复制*/
      var child = JSON.parse(JSON.stringify(parent));
      return child;
    }
  },
  created() {
    this.container = document.createElement("div");
    this.container.classList.add("container", "clearfix");
    this.creatTier();
    if (this.ignore.length > 0) {
      this.setIgnore();
    }
  },
  mounted() {
    let me = this;
    document.getElementById(me.id).appendChild(me.container);
    document.body.addEventListener("mouseup", function() {
      if (document.getElementById(me.id)) {
        document.getElementById(me.id).removeEventListener("mousemove", me.mousemove);
      }
    })
    me.render();
  },
  watch: {
    data(val) {
      this.localData = this.extendDeep(val);
      this.localSize = [];
      for (let i = 0; i < this.localData.length; i++) {
        this.localSize[i] = this.localData[i].length;
      }
      this.creatTier();
    }
  }
}
</script>
  
<!-- Add 'scoped' attribute to limit CSS to this component only  -->
<style>
.cubeMain {
  width: 100%;
  height: 100%;
  position: relative;
}

#cubeTable {
  /*数据展示*/
  position: absolute;
  min-height: 150px;
  width: 651px;
  /*background-color: #ccc;*/
  bottom: 6%;
  left: 50%;
  transform: translate(-50%, 0);
  user-select: none;
  box-shadow: 10px 10px 50px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

#cubeTable .el-select {
  width: 33.3333%;
  float: left;
}

#cubeTable .is-leaf {
  border-bottom: 1px solid #DCDFE6;
}

.cubeBnt {
  /*运动按钮*/
  position: absolute;
  top: 10%;
  right: 2%;
}

.container {
  /*立方体容器*/
  position: absolute;
  transform-style: preserve-3d;
  top: 40%;
  left: 50%;
}

.container .face {
  position: absolute;
  user-select: none;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px dashed #91c5f9;
  /*background-color: #012f75;*/
  background-color: rgba(64, 158, 255, .75);
  /*border: 1px solid #666;*/
}

.cubeTip {
  position: absolute;
  font-size: 16px;
  font-weight: 700;
  user-select: none;
  cursor: pointer;
  writing-mode: lr-tb;
}

.cubeTip.horizontalTip {
  line-height: 30px;
}

.container.rotate .cubeTip1 {
  animation: cubeTip1 1s linear;
}

.container.rotate .cubeTip2 {
  animation: cubeTip2 1s linear;
}

.container.rotate .cubeTip3 {
  animation: cubeTip3 1s linear;
}

.container.rotate .cube1 {
  animation: cube1 1.7s linear;
  /*background-color: rgba(255, 102, 102, 0.75);*/
}

.container.rotate .cube2 {
  animation: cube2 1.5s linear;
  /*background-color: rgba(179, 255, 102, 0.75);*/
}

.container.rotate .cube3 {
  animation: cube3 1.1s linear;
  /*background-color: rgba(255, 255, 102, 0.75);*/
}

.container.rotate .cube4 {
  animation: cube4 1.3s linear;
  /*background-color: rgba(178, 102, 255, 0.75);*/
}

.container.rotate .cube5 {
  animation: cube5 0.9s linear;
  /*background-color: rgba(164, 214, 27, 0.75);*/
}

.container.rotate .cube6 {
  animation: cube6 0.7s linear;
  /*background-color: rgba(184, 33, 121, 0.75);*/
}

.face.ignore {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px dotted #666;
}


@keyframes cubeTip1 {
  0% {
    right: 0px;
    transform: rotateX(0deg);
  }
  25% {
    right: 10px;
    transform: rotateX(30deg);
  }
  50% {
    right: -30px;
    transform: rotateX(110deg);
  }
  75% {
    right: -60px;
    transform: rotateX(240deg);
  }
  100% {
    right: -55px;
    transform: rotateX(360deg);
  }
}

@keyframes cubeTip2 {
  0% {
    bottom: 0px;
    opacity: 0;
    transform: rotateY(0deg);
  }
  25% {
    bottom: 10px;
    transform: rotateY(40deg);
  }
  50% {
    bottom: -30px;
    transform: rotateY(180deg);
  }
  75% {
    bottom: -60px;
    transform: rotateY(270deg);
  }
  100% {
    bottom: -55px;
    opacity: 1;
    transform: rotateY(360deg);
  }
}

@keyframes cubeTip3 {
  0% {
    bottom: 0px;
    left: 0px;
    opacity: 0;
  }
  25% {
    bottom: 10px;
    left: 10px;
  }
  50% {
    bottom: -25px;
    left: -30px;
  }
  75% {
    bottom: -60px;
    left: -60px;
  }
  100% {
    bottom: -55px;
    left: -55px;
    opacity: 1;
  }
}

@keyframes cube1 {
  0% {
    transform: rotateY(0deg);
  }
  25% {
    transform: rotateY(-40deg);
  }
  50% {
    transform: rotateY(-180deg);
  }
  75% {
    transform: rotateY(-270deg);
  }
  100% {
    transform: rotateY(-360deg);
  }
}

@keyframes cube2 {
  0% {
    top: -200px;
    transform: rotateZ(0deg);
  }
  25% {
    transform: rotateZ(40deg);
  }
  50% {
    transform: rotateZ(180deg);
  }
  75% {
    transform: rotateZ(270deg);
  }
  100% {
    top: 0px;
    transform: rotateZ(360deg);
  }
}

@keyframes cube3 {
  0% {
    transform: rotateY(0deg);
  }
  25% {
    transform: rotateY(40deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  75% {
    transform: rotateY(270deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

@keyframes cube4 {
  0% {
    left: -200px;
    transform: rotateZ(0deg);
  }
  25% {
    transform: rotateZ(-40deg);
  }
  50% {
    transform: rotateZ(-180deg);
  }
  75% {
    transform: rotateZ(-270deg);
  }
  100% {
    left: 0px;
    transform: rotateZ(-360deg);
  }
}

@keyframes cube5 {
  0% {
    transform: rotateX(0deg);
  }
  25% {
    transform: rotateX(40deg);
  }
  50% {
    transform: rotateX(180deg);
  }
  75% {
    transform: rotateX(270deg);
  }
  100% {
    transform: rotateX(360deg);
  }
}

@keyframes cube6 {
  0% {
    transform: rotateX(0deg);
  }
  25% {
    transform: rotateX(-40deg);
  }
  50% {
    transform: rotateX(-180deg);
  }
  75% {
    transform: rotateX(-270deg);
  }
  100% {
    transform: rotateX(-360deg);
  }
}
</style>