<template>
    <div class="h-screen flex flex-col justify-between items-center">
        <header class="max-w-sm mt-32">
            <Icon name="lucide:coins" class="animate-bounce" size="50" />
            <h1 class="text-4xl font-semibold text-primary my-2">KeepTrack</h1>
            <p class="text-lg max-w-sm">Halte deine Zeiten, Gehalt, Minojob im blick!</p>
            <p class="text-sm text-muted-foreground" v-if="!isMobile">Diese App funkioniert nur auf dem Handy.</p>
            <p v-if="isMobile && !pwaInstallSupported || !hasPrompt && isMobile" class="text-sm">
                <Icon name="lucide:badge-check" class="text-primary" />
                <template v-if="userAgent === 'safari'">
                    Um die App zu installieren, klicke auf das Teilen-Symbol und wähle "Zum Home-Bildschirm" aus.
                </template>
                <template v-else="userAgent === 'chrome'">
                    Um die App zu installieren, klicke auf das Menü und wähle "Zum Startbildschirm hinzufügen" aus.
                </template>
            </p>

        </header>
        <footer class="mx-2 w-full mb-2 space-y-2 max-w-md">
            <Button class="w-full" @click="requestInstall" v-if="pwaInstallSupported">
                <Icon name="mdi:download-box" class="mr-2" />
                {{ (!pwaInstallSupported || !hasPrompt && isMobile) ? 'Lese dir die Anleitung durch' : 'Installieren' }}
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
const { $pwa } = useNuxtApp();


useHead({
    title: 'KeepTrack',
    meta: [
        { name: 'description', content: 'Halte deine Zeiten, Gehalt, Minojob im blick!' },
        { name: 'theme-color', content: '#2aaa59' },
        { name: 'publisher', content: 'KeepTrack' },
    ],
});

onBeforeMount(() => {
    //Redirect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        useRouter().push('/authentication');
    }
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
        const choice = $pwa!.install();
        choice.then((result) => {
            if (result?.outcome === 'accepted') {
                useRouter().push('/authentication');
            }
        });
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