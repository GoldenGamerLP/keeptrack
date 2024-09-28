<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtPwaManifest />
    <NuxtPage />
    <SpeedInsights/>
  </div>
</template>

<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
</script>