<template>
  <div class="min-h-screen w-full flex justify-center items-center flex-col">
    <div class="max-w-sm">
      <Icon name="lucide:coins" class="animate-bounce" size="50" />
      <h1 class="text-4xl font-semibold text-primary my-2">KeepTrack</h1>
      <Tabs default-value="register" class="max-w-sm">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="register"> Registesrieren </TabsTrigger>
          <TabsTrigger value="login"> Einloggen </TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Registesrieren </CardTitle>
              <CardDescription>
                Erstelle einen Account um deine Zeiten, Gehalt, Minojob im blick
                zu behalten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoForm
                @submit="registerSubmit"
                :field-config="{
                  password: { inputProps: { type: 'password' } },
                  confirmPassword: { inputProps: { type: 'password' } },
                }"
                :schema="registerSchema"
              >
                <p class="text-red-500">{{ fetchError }}</p>
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
              <CardTitle>Einloggen</CardTitle>
              <CardDescription>
                Logge dich ein um deine Zeiten, Gehalt, Minojob im blick zu
                behalten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoForm
                :field-config="{
                  password: { inputProps: { type: 'password' } },
                }"
                :schema="loginSchema"
                @submit="loginSubmit"
              >
                <p class="text-red-500">{{ fetchError }}</p>
                <Button type="submit" class="mt-2" :loading="isLoading">
                  <Icon name="mdi:login" class="size-5 mr-2" />
                  Los gehts!
                </Button>
              </AutoForm>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as z from "zod";
import { toast } from "~/components/ui/toast";

definePageMeta({
  middleware: "only-guests",
});

preloadRouteComponents("/myaccount/")

useHead({
  title: "KeepTrack - Deine Zeiten, Gehalt, Minijob im Blick",
  meta: [
    {
      name: "description",
      content: "Halte deine Zeiten, Gehalt, Minojob im blick!",
    },
    { name: "keywords", content: "Zeiten, Gehalt, Minijob, Stunden, Lohn" },
  ],
  noscript: [
    { innerHTML: "Diese App benötigt JavaScript um zu funktionieren" },
  ],
});

const isLoading = ref(false);
const fetchError = ref("");

watch(
  () => fetchError.value,
  (error) => {
    if (error) {
      setTimeout(() => {
        fetchError.value = "";
      }, 5000);
    }
  }
);

const loginSchema = z.object({
  email: z
    .string()
    .email("Ungültige E-Mail Adresse")
    .describe("Deine E-Mail Adresse"),
  password: z
    .string()
    .min(6, "Passwort muss mindestens 6 Zeichen lang sein")
    .describe("Dein Passwort"),
});

const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(3, "Name muss mindestens 3 Zeichen lang sein")
      .describe("Dein Name"),
    email: z
      .string()
      .email("Ungültige E-Mail Adresse")
      .describe("Deine E-Mail Adresse"),
    password: z
      .string()
      .min(6, "Passwort muss mindestens 6 Zeichen lang sein")
      .describe("Dein Passwort"),
    confirmPassword: z
      .string()
      .min(6, "Passwort muss mindestens 6 Zeichen lang sein")
      .describe("Passwort bestätigen"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

const registerSubmit = async (values: Record<string, any>) => {
  isLoading.value = true;
  try {
    const res = await $fetch("/api/v1/auth/actions/signup", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (res) {
      goToAccount();
      console.log("User registered");
    } else {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Bitte überprüfe deine Eingaben und versuche es erneut.",
        variant: "destructive",
      });
      console.error("Failed to register");
    }
  } catch (error: any) {
    toast({
      title: "Registrierung fehlgeschlagen?",
      description: "Bitte überprüfe deine Eingaben und versuche es erneut.",
      variant: "destructive",
    });
    fetchError.value = error.statusMessage;
  } finally {
    isLoading.value = false;
  }
};

const loginSubmit = async (values: Record<string, any>) => {
  isLoading.value = true;
  try {
    const res = await $fetch("/api/v1/auth/actions/login", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (res) {
      goToAccount();
      console.log("User logged in");
    } else {
      toast({
        title: "Login fehlgeschlagen",
        description: "Bitte überprüfe deine Eingaben und versuche es erneut.",
        variant: "destructive",
      });
      console.error("Failed to login");
    }
  } catch (error: any) {
    toast({
      title: "Login fehlgeschlagen?",
      description: "Bitte überprüfe deine Eingaben und versuche es erneut.",
      variant: "destructive",
    });
    fetchError.value = error.statusMessage;
  } finally {
    isLoading.value = false;
  }
};

const goToAccount = () => {
  useRouter().push("/myaccount");
};
</script>
