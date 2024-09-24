<template>
    <div class="max-w-sm grid grid-cols-8 grid-rows-5">
        <span v-for="day in days" :key="day" class="col-span-1">{{ day }}</span>
    </div>
</template>

<script setup lang="ts">
const days = ref(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
</script>