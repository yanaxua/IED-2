<template>
  <div id="index" @click="toPath">
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
    toPath() {
      this.$router.push({ path: '/layout' });
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
#index {
  width: 100%;
  height: 100%;
  background: url("/static/image/index.png") no-repeat center;
  background-size: cover;
  position: relative;
  cursor: pointer;
}
</style>