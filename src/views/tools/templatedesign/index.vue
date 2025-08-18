<script setup>
import {ref} from "vue";
import "sv-print/dist/style.css";
import {Designer} from "@sv-print/vue3";

let template = ref({});
let printData = ref({});
const onDesigned = (e) => {
  console.log("onDesigned");
  console.log(e);
};
</script>

<template>
  <div>
    <Designer :template="template" @onDesigned="onDesigned" :printData="printData"/>
  </div>
</template>

<style scoped lang="scss">

</style>
