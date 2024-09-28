<template>
    <div class="fixed bottom-0 left-0 right-0 bg-gray-800/70 text-white p-2 z-10 m-2 rounded-md backdrop-blur">
        <div class="flex justify-between">
            <div>
                <span class="font-bold">Status:</span> {{ online ? 'Online' : 'Offline' }}
            </div>
            <div>
                <span class="font-bold">WS Active:</span> {{ wsActive }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useOnline } from '@vueuse/core';

const online = useOnline();

const wsActive = ref<any>(null);

onMounted(async () => {
    if ('serviceWorker' in navigator) {
        wsActive.value = await navigator.serviceWorker.getRegistrations().then((registrations) => {
            return registrations.map((registration) => registration.scope);
        });
    }
});
</script>