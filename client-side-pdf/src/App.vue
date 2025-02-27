<template>
  <GeneratePdf />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GeneratePdf from './components/GeneratePdf.vue';

export default defineComponent({
  components: { GeneratePdf },
});
</script>
