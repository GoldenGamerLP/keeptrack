<template>
  <div class="min-h-screen w-full flex justify-center items-center flex-col">
    <div class="max-w-sm">
      <Icon name="lucide:coins" class="animate-bounce" size="50" />
      <h1 class="text-4xl font-semibold text-primary my-2">KeepTrack</h1>
      <div v-if="!isMobile">
        <p class="text-lg max-w-sm">Halte deine Zeiten, Gehalt, Minojob im blick!</p>
        <p class="text-sm text-muted-foreground">Diese App funkioniert nur auf dem Handy.</p>
      </div>
      <div v-else-if="!isSupported">
        <p class="text-lg max-w-sm">Halte deine Zeiten, Gehalt, Minojob im blick!</p>
        <Button :disabled="true" icon="mdi:close" class="w-full">Installieren</Button>
        <p class="text-sm text-muted-foreground">Dein Browser unterstützt leider keine Web-Apps! Durch WebApps hast du dennoch ein besseres Erlebnis.</p>
        <Button variant="link" class="mt-2" @click="skipInstall()">Ohne fortfahren</Button>
      </div>
      <div v-else-if="!isInstalled">
        <p class="text-lg max-w-sm">Halte deine Zeiten, Gehalt, Minojob im blick!</p>
        <div v-if="deferredPrompt">
          <Button @click="requestInstall" :disabled="isInstalling" icon="mdi:download-box">Installieren</Button>
          <p class="text-sm text-muted-foreground">Klicke installieren um die App zu verweden.</p>
        </div>
        <div v-else>
          <p class="text-sm text-muted-foreground max-w-sm">Installiere die App indem du auf <br><span class="underline"> Optionen>App Instalieren</span><br>
            klickst oder <br> <span class="underline">Teilen>Zum Bildschirm hinzufügen</span>. <br> Mit WebApp hast du ein besseres Erlebnis!</p>
            <Button variant="link" class="mt-2" @click="skipInstall()">Ohne fortfahren</Button>
        </div>
      </div>
      <div v-else>
        <Tabs default-value="register" class="max-w-sm">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="register">
              Register
            </TabsTrigger>
            <TabsTrigger value="login">
              Login
            </TabsTrigger>
          </TabsList>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Erstelle einen Account um deine Zeiten, Gehalt, Minojob im blick zu behalten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutoForm @submit="registerSubmit"
                  :field-config="{ password: { inputProps: { type: 'password' } }, confirmPassword: { inputProps: { type: 'password' } } }"
                  :form="registerForm" :schema="registerSchema">
                  <Button type="submit" class="mt-2" :loading="isLoading">
                    <Icon name="mdi:account-plus" class="mr-2 size-5" />
                    Los gehts!
                  </Button>
                </AutoForm>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Logge dich ein um deine Zeiten, Gehalt, Minojob im blick zu behalten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutoForm :field-config="{ password: { inputProps: { type: 'password' } } }" :schema="loginSchema" :form="loginForm"
                  @submit="loginSubmit">
                  <Button type="submit" class="mt-2" :loading="isLoading">
                    <Icon name="mdi:login" class="size-5 mr-2" />
                    Einloggen
                  </Button>
                </AutoForm>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useEventListener, useMediaQuery } from "@vueuse/core"
import { useForm } from "vee-validate";
import * as z from 'zod'

definePageMeta({
  middleware: 'only-guests',
});

useHead({
  title: 'KeepTrack - Deine Zeiten, Gehalt, Minijob im Blick',
  meta: [
    { name: 'description', content: 'Halte deine Zeiten, Gehalt, Minojob im blick!' },
    { name: 'keywords', content: 'Zeiten, Gehalt, Minijob, Stunden, Lohn' },
  ],
  noscript: [
    { innerHTML: 'Diese App benötigt JavaScript um zu funktionieren' }
  ]
});

const isStandAlone = useMediaQuery('(display-mode:standalone)');
const isSkipInstall = ref(false);
const isInstalled = computed(() => {
  return isStandAlone.value || isSkipInstall.value;
});
const isMobile = useMediaQuery('(any-pointer:coarse) and (orientation:portrait)');
const isInstalling = ref(true);
const isSupported = ref(true);
const deferredPrompt = ref<null | Event>(null);
const isLoading = ref(false);

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail Adresse').describe("Deine E-Mail Adresse"),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein').describe("Dein Passwort"),
});

const registerSchema = z.object({
  displayName: z.string().min(3, 'Name muss mindestens 3 Zeichen lang sein').max(50, 'Name darf maximal 50 Zeichen lang sein').regex(/^[a-zA-Z0-9_]*$/, 'Name darf nur Buchstaben, Zahlen und Unterstriche enthalten').describe("Dein Name"),
  email: z.string().email('Ungültige E-Mail Adresse').describe("Deine E-Mail Adresse"),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein').regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/, 'Passwort muss mindestens einen Großbuchstaben, Kleinbuchstaben und eine Zahl enthalten').describe("Dein Passwort"),
  confirmPassword: z.string().describe("Passwort bestätigen"),
}).refine(data => data.password !== data.email, {
  message: 'Passwort darf nicht gleich der E-Mail sein', path: ['password']
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein', path: ['confirmPassword']
});

const registerForm = useForm({
  validationSchema: toTypedSchema(registerSchema),
})

const loginForm = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

useEventListener(window, 'beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt.value = event;
}, { once: true });

onMounted(() => {
  isSupported.value = 'getInstalledRelatedApps' in navigator || 'getInstalledRelatedApps' in window;
});

const requestInstall = async () => {
  if (!deferredPrompt.value) return;
  isInstalling.value = true;
  
  deferredPrompt.value.prompt();
  const choiceResult = await deferredPrompt.value.userChoice;
  if (choiceResult.outcome === 'accepted') {
    goToAccount();
    console.log('User accepted the A2HS prompt');
  } else {
    console.log('User dismissed the A2HS prompt');
  }
};

const registerSubmit = async (values: Record<string, any>) => {
  isLoading.value = true;
  console.log(values);
  try {
    const res = await $fetch('/api/v1/auth/actions/signup', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    if (res) {
      console.log('User registered');
    } else {
      console.error('Failed to register');
    }
  } catch (error: any) {
    registerForm.setErrors({ email: error.statusMessage });
  } finally {
    isLoading.value = false;
    goToAccount();
  }
};

const loginSubmit = async (values: Record<string, any>) => {
  isLoading.value = true;
  try {
    const res = await $fetch('/api/v1/auth/actions/login', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    if (res) {
      console.log('User logged in');
    } else {
      console.error('Failed to login');
    }
  } catch (error: any) {
    loginForm.setErrors({ email: error.statusMessage });
  } finally {
    isLoading.value = false;
    goToAccount();
  }
};

const goToAccount = () => {
  useRouter().push('/myaccount');
};

const skipInstall = () => {
  isSkipInstall.value = true;
};
</script>