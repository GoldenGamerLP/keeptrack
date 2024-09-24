<script setup lang="ts">
const colorMode = useColorMode()
let mode = colorMode.value;

const toggleColorMode = () => {
  //When light => dark
  //When dark => system
  //When system => light
  if (mode === 'light') {
    colorMode.value = 'dark';
    mode = 'dark';
  } else if (mode === 'dark') {
    colorMode.value = 'system';
    mode = 'system';
  } else {
    colorMode.value = 'light';
    mode = 'light';
  }
}
</script>

<template>
  <Button @click="toggleColorMode" variant="outline" class="w-full overflow-hidden">
    <Transition name="fade">
      <template v-if="colorMode.value === 'light'">
        <span>
          <Icon name="mdi:moon-waning-crescent" /> Wechsel zu Dunkler Modus
        </span>
      </template>
      <template v-else-if="colorMode.value === 'dark'">
        <span>
          <Icon name="mdi:weather-sunny" /> Wechsel zu Heller Modus
        </span>
      </template>
      <template v-else>
        <span>
          <Icon name="mdi:weather-night" /> Wechsel zu System Modus
        </span>
      </template>
    </Transition>
  </Button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.75s, transform 0.75s;
}

/* Translate x full in and out */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(-50%);
}
</style>