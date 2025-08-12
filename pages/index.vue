<template>
    <div class="min-h-screen flex flex-col justify-between items-center container">
        <header class="self-center mb-auto mt-[20vh] flex flex-col items-center">
            <Icon name="lucide:coins" class="animate-bounce text-primary" size="50" />
            <h1 class="text-primary font-bold text-3xl">
                KeepTrack
            </h1>
            <p class="text-muted-foreground font-semibold">
                Halte deine Lohn und Finanzen im Blick!
            </p>
            <p v-if="pwaInstallSupported" class="mt-8 text-center max-w-sm text-muted-foreground flex">
                <Icon name="mdi:alpha-x-circle-outline" size="25" class="text-primary" />
                <template v-if="userAgent === 'safari'">
                    Um die App zu installieren, klicke auf das Teilen-Symbol und wähle "Zum Home-Bildschirm" aus.
                </template>
                <template v-else>
                    Um die App zu installieren, klicke auf Mehr oder das Teilen-Symbol und wähle "Zum Startbildschirm
                    hinzufügen" aus.
                </template>
            </p>
        </header>
        <footer class="flex flex-col gap-2 mb-8">
            <Button @click.native.stop="requestInstall()" class="w-full">
                <Icon name="mdi:check-all" class="mr-2" />
                Klicke auf Installieren um fortzufahren.
            </Button>
            <NuxtLink :to="'/authentication'" :prefetch="true">
                <Button variant="link" class="w-full">
                    Weiter ohne Installation
                </Button>
            </NuxtLink>
        </footer>
    </div>
</template>
<script lang="ts" setup>
import type { BeforeInstallPromptEvent } from '@vite-pwa/nuxt/dist/runtime/plugins/types.js';

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const pwaInstallSupported = ref<boolean>(false);
const userAgent = ref<string>();

preloadRouteComponents("/authentication");

onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt.value = e as BeforeInstallPromptEvent;
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt.value = null;
        useRouter().push('/authentication');
    });

    //compatibility check
    window.addEventListener('fetch', () => {
        //
    });

    userAgent.value = userAgents.find((ua) => navigator.userAgent.toLowerCase().includes(ua)) || 'unknown';
    pwaInstallSupported.value = 'BeforeInstallPromptEvent' in window;
});

const requestInstall = async () => {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt();
        // Find out whether the user confirmed the installation or not
        const { outcome } = await deferredPrompt.value.userChoice;
        // The deferredPrompt can only be used once.
        deferredPrompt.value = null;
        // Act on the user's choice
        if (outcome === 'accepted') {
            useRouter().push('/authentication');
        } else if (outcome === 'dismissed') {
            console.log('User dismissed the install prompt');
        }
    }
};

const userAgents = [
    'chrome',
    'safari',
    'firefox',
    'opera',
    'edge',
];
</script>