<template>
  <div>
    <NuxtLoadingIndicator color="false" class="bg-primary" />
    <NuxtPwaManifest />
    <NuxtLayout />
    <NuxtPage />
    <SpeedInsights />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";
</script>
