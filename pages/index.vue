<template>
    <div class="h-screen flex flex-col justify-between items-center">
        <header class="max-w-sm mt-32">
            <Icon name="lucide:coins" class="animate-bounce" size="50" />
            <p class="text-lg max-w-sm">Halte deine Zeiten, Gehalt, Minojob im blick!</p>
            <p class="text-sm text-muted-foreground" v-if="!isMobile">Diese App funkioniert nur auf dem Handy.</p>
            <p v-if="isMobile && !pwaInstallSupported || !hasPrompt && isMobile" class="text-sm">
                <Icon name="mdi:close-box" class="text-destructive" />
                <template v-if="userAgent === 'safari'">
                    Um die App zu installieren, klicke auf das Teilen-Symbol und wähle "Zum Home-Bildschirm" aus.
                </template>
                <template v-else="userAgent === 'chrome'">
                    Um die App zu installieren, klicke auf das Menü und wähle "Zum Startbildschirm hinzufügen" aus.
                </template>
            </p>

        </header>
        <footer class="mx-2 w-full mb-2 space-y-2 max-w-md sm:max-w-sm">
            <Button class="w-full" @click="requestInstall" v-if="pwaInstallSupported" :variant="hasPrompt && isMobile ? 'default' : 'destructive'" :disabled="!isMobile">
                <Icon :name="hasPrompt && isMobile ? 'mdi:close' : 'mdi:download'" class="mr-2" />
                {{ (isMobile || (pwaInstallSupported && hasPrompt)) ? 'Installieren' : 'Lese dir die Anleitung durch' }}
            </Button>
            <Button variant="outline" class="w-full" :disabled="!isMobile">
                <NuxtLink to="/authentication">
                    Ohne Installation fortfahren (nicht empfohlen)
                </NuxtLink>
            </Button>
        </footer>
    </div>
</template>

<script lang="ts" setup>
import type { BeforeInstallPromptEvent } from '@vite-pwa/nuxt/dist/runtime/plugins/types.js';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const pwaInstallSupported = ref<boolean>(false)
const hasPrompt = computed(() => !!deferredPrompt);
const isMobile = ref(false)
const userAgent = ref<string>();

useHead({
    title: 'KeepTrack',
    meta: [
        { name: 'description', content: 'Halte deine Zeiten, Gehalt, Minojob im blick!' },
        { name: 'theme-color', content: '#2aaa59' },
        { name: 'publisher', content: 'KeepTrack' },
    ],
});

onBeforeRouteUpdate(() => {
    //If display is standalone, redirect to authentication
    if (window.matchMedia('(display-mode: standalone)').matches) {
        useRouter().push('/authentication');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e as BeforeInstallPromptEvent;
    });
});

onMounted(() => {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e as BeforeInstallPromptEvent;
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
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
    if (deferredPrompt) {
        deferredPrompt.prompt();
        // Find out whether the user confirmed the installation or not
        const { outcome } = await deferredPrompt.userChoice;
        // The deferredPrompt can only be used once.
        deferredPrompt = null;
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