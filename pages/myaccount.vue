<template>
    <div class="space-y-4">
        <Header />
        <StatsGrid />
        <GoalSection />
        <WorkingTimeForm />
        <CalendarOverview />
        <WorkingEntriesOverview />
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { useKeeptrackStore } from '~/store/keeptrack';

const Header = defineAsyncComponent(() => import('../components/system/Header.vue'));
const StatsGrid = defineAsyncComponent(() => import('../components/system/StatsGrid.vue'));
const GoalSection = defineAsyncComponent(() => import('../components/system/GoalSection.vue'));
const WorkingTimeForm = defineAsyncComponent(() => import('../components/system/WorkingTimeForm.vue'));
const CalendarOverview = defineAsyncComponent(() => import('../components/system/CalendarOverview.vue'));
const WorkingEntriesOverview = defineAsyncComponent(() => import('../components/system/WorkingEntriesOverview.vue'));

const store = useKeeptrackStore();

definePageMeta({
    middleware: 'only-logged-in',
});

useHead({
    title: 'Mein Konto',
    meta: [
        {
            name: 'description',
            content: 'Dein Konto bei KeepTrack',
        },
    ],
});
</script>