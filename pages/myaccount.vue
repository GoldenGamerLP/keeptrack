<template>
  <div class="space-y-5">
     <SystemHeader />
     <SystemStatsGrid />
     <SystemGoalSection />
     <SystemWorkingTimeForm />
     <WorkingEntriesOverview />
  </div>
</template>

<script lang="ts" setup>
import WorkingEntriesOverview from '~/components/system/WorkingEntriesOverview.vue';

definePageMeta({
  middleware: "only-logged-in",
  layout: "default",
});

useHead({
  title: "Mein Konto",
  meta: [
    {
      name: "description",
      content: "Dein Konto bei KeepTrack",
    },
  ],
});
</script>
