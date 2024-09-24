<template>
    <div>
        <div class="space-y-4">
            <header class="flex m-2 justify-between">
                <div class="flex items-center">
                    <Icon name="lucide:coins" class="size-8 text-primary mr-2" />
                    <div>
                        <h1 class="text-2xl font-bold">KeepTrack</h1>
                        <p class="text-sm text-muted-foreground">Willkommen zurück {{ user?.displayname }}!</p>
                    </div>
                </div>
                <Popover>
                    <PopoverTrigger as-child>
                        <Button size="sm" variant="link">
                            <Avatar title="settings">
                                <AvatarImage src="https://avatars.githubusercontent.com/u/4723117?v=4" alt="your avatar" />
                                <AvatarFallback>
                                    <Icon name="mdi:account" class="size-5" />
                                </AvatarFallback>
                            </Avatar>
                            <Icon name="mdi:chevron-down" class="ml-2 size-5 text-popover-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <ColorMode />
                        Benutzer: {{ user?.displayname }}
                        <Button class="w-full" variant="outline" @click="logOut">
                            <Icon name="mdi:account" class="mr-2 size-5" />
                            Logge dich aus
                        </Button>
                    </PopoverContent>
                </Popover>
            </header>
            <div class="grid grid-flow-col grid-rows-2 gap-2 mx-2">
                <Card v-for="card in computedStats">
                    <CardHeader>
                        <CardTitle>
                            {{ card.title }}
                        </CardTitle>
                        <CardDescription>{{ card.description }}</CardDescription>
                    </CardHeader>
                    <CardContent class="float-start">
                        <div class="text-base text-muted-foreground">(
                            {{ Math.floor(card.hours / 100) }}
                            <span class="text-xs align-top text-muted-foreground underline-offset-2 underline">{{
                                card.hours % 100 * 0.6 }}</span>
                            .std)
                        </div>
                        <span
                            class="text-4xl tracking-tight font-semibold text-transparent bg-clip-text bg-gradient-to-br from-primary to-foreground/20 drop-shadow shadow-primary">
                            {{ curFormatter.format(card.value) }}
                        </span>

                    </CardContent>
                </Card>
            </div>
            <div class="mx-2">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold">Deine Ziele</h2>
                    <Button @click="createGoal?.open(null)" variant="link">
                        <Icon name="mdi:plus" class="mr-2 size-5" />
                        Ziel hinzufügen
                    </Button>
                </div>
                <div
                    class="flex flex-row my-2 gap-2 overflow-x-scroll overflow-y-hidden snap-x [&>*]:snap-start snap-proximity [&>*]:flex-none">
                    <Card v-for="ziel in computedGoals"
                        :class="{ 'w-[90vw]': computedGoals.length !== 1, 'w-full': computedGoals.length === 1 }">
                        <CardHeader>
                            <CardTitle>{{ ziel.title }}</CardTitle>
                            <CardDescription>{{ ziel.description }}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 class="text-xl font-medium">
                                <Icon name="mdi:check-decagram" class="size-5 text-primary" />
                                Erledigt:
                            </h3>
                            <p>Stunden: {{ Math.floor(ziel.done.hours / 100) }}
                                <span class="text-xs align-top text-muted-foreground underline-offset-2 underline">{{
                                    ziel.done.hours % 100 * 0.6 }}</span> .std
                            </p>
                            <p>Verdienst: <code>{{ curFormatter.format(ziel.done.earning) }}</code></p>
                            <p v-if="ziel.given.maxsalary <= ziel.done.earning">
                                <span class="text-primary">Überstunden: {{ curFormatter.format(ziel.done.earning -
                                    ziel.given.maxsalary) }}
                                    <span class="text-muted-foreground">
                                        ({{ Math.floor((ziel.done.earning - ziel.given.maxsalary) / ziel.given.salary) }}
                                        <span
                                            class="text-xs align-top text-muted-foreground underline-offset-2 underline">
                                            {{ ((ziel.done.earning - ziel.given.maxsalary) / ziel.given.salary * 100 %
                                            100).toFixed(0) }}</span> .std)</span>
                                </span>
                            </p>
                            <h3 class="text-xl font-medium">
                                <Icon name="mdi:information" class="size-5 text-primary" />
                                Angegeben:
                            </h3>
                            <p>Max. Stunden: <code>{{ (ziel.given.maxsalary / ziel.given.salary).toFixed(2) }}</code>
                                std.</p>
                            <p>Stundenlohn: <code>{{ curFormatter.format(ziel.given.salary) }}</code></p>
                            <p>Max. Verdienst: <code>{{ curFormatter.format(ziel.given.maxsalary) }}</code></p>
                            <p>Auszahl Tag im Monat: <code>{{ ziel.given.paydayofmonth }}</code> </p>
                            <Progress :model-value="ziel.done.earning" v-bind:max="ziel.given.maxsalary"
                                class="mt-2" />
                        </CardContent>
                        <CardFooter class="flex justify-between">
                            <Button @click="selectCard(ziel.id)" :disabled="isCardSelected(ziel.id)"
                                :class="!isCardSelected(ziel.id) ? 'animate-pulsing' : ''">
                                <Icon :name="isCardSelected(ziel.id) ? 'mdi:check-all' : 'mdi:check'"
                                    class="mr-2 size-5" />
                                {{ isCardSelected(ziel.id) ? 'Ausgewählt' : 'Auswählen' }}
                            </Button>
                            <Button @click="createGoal?.open(ziel)" variant="outline" size="icon" :title="`edit goal ${ziel.title}`">
                                <Icon name="mdi:pencil" class=" size-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card v-if="computedGoals.length === 0" class="!border-dashed border-2 w-full">
                        <CardHeader>
                            <CardTitle>Keine Ziele</CardTitle>
                            <CardDescription>Erstelle dein erstes Ziel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button @click="createGoal?.open(null)" variant="outline">
                                <Icon name="mdi:plus" class="mr-2 size-5" />
                                Ziel hinzufügen
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card class="mx-2" id="arbeitszeit">
                <CardHeader>
                    <CardTitle>
                        Arbeitsstunden hinzufügen
                    </CardTitle>
                    <CardDescription>
                        Ziel: <span class="text-primary">{{ currentCard?.title ?? "Nichts ausgewählt!" }}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form class="space-y-4" @submit.prevent="addWorkingTime">
                        <Popover class="flex-none">
                            <PopoverTrigger as-child>
                                <Button variant="outline" id="date" :class="cn(
                                    'w-full justify-start text-left font-normal',
                                    !selTime && 'text-muted-foreground',
                                )">
                                    <Icon name="mdi:calendar" class="mr-2 size-5" />
                                    {{ selTime ? df.format(selTime.toDate(getLocalTimeZone())) : "Datum auswählen"
                                    }}
                                    <Button variant="link" size="icon" class="ml-auto" title="select today"
                                        @click.stop.prevent="selTime = today(getLocalTimeZone())">
                                        <Icon name="mdi:calendar-today" class="size-5" />
                                    </Button>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="flex w-auto flex-col gap-y-2 p-2">
                                <Select @update:model-value="(v) => {
                                    if (!v) return;
                                    selTime = today(getLocalTimeZone()).add({ days: Number(v) });
                                }">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Aussuchen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="item in items" :key="item.value"
                                            :value="item.value.toString()">
                                            {{ item.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Calendar v-model="selTime" />
                            </PopoverContent>
                        </Popover>
                        <Slider v-model="defaultWorkingTime" :min="workingTime.start" :max="workingTime.end" :step="25"
                            :min-steps-between-thumbs="4" />
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">{{ format24HoursData(defaultWorkingTime[0]) }}</span>
                            <div class="text-primary">Uhrzeit Auswählen
                                <span class="text-base text-muted-foreground">(
                                    {{ Math.floor(computedDiff / 100) }}
                                    <span
                                        class="text-xs align-top text-muted-foreground underline-offset-2 underline">{{
                                            computedDiff % 100 * 0.6 }}</span>
                                    .std)
                                </span>
                            </div>
                            <span class="text-muted-foreground">{{ format24HoursData(defaultWorkingTime[1]) }}</span>
                        </div>
                        <Button class="w-full" @click.stop="addWorkingTime" :loading="loadingWorkingTime"
                            :disabled="!selTime || !currentCard">
                            <Icon name="mdi:plus" class="mr-2 size-5" />
                            Hinzufügen
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card class="m-2">
                <CardHeader>
                    <CardTitle>Monats übersicht</CardTitle>
                    <CardDescription>Die Tage an den du gearbeitet hast.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar v-model:placeholder="crrDate" :matcher="includesWorkedDay"
                        :max-value="today(getLocalTimeZone())" :readonly="true" />
                </CardContent>
            </Card>
            <div class="mx-2 mb-4">
                <h2 class="text-xl font-bold">Deine letzten Arbeitszeiten</h2>
                <ScrollArea class="h-96">
                    <div class="bg-card text-card-foreground border-s-primary border-s-8 rounded-md p-2 mb-1"
                        v-for="entry in workingEntries.data.value" :key="entry.id">
                        <div class="flex">
                            <h1 class="text-xl font-bold">Arbeitszeit
                                <span class="text-primary/30">{{ entry.id }}</span>
                            </h1>
                            <Button variant="outline" size="icon" class="ml-auto z-10"
                                @click="deleteWorkingEntry(entry.id)" :loading="deleteWorkingEntryLoading" :title="`lösche arbeits eintrag ${entry.id}`">
                                <Icon name="mdi:delete-forever" class="size-5" />
                            </Button>
                        </div>
                        <div class="grid grid-cols-2 gap-2 z-10">
                            <div>
                                <h2 class="text-lg font-semibold inline-flex items-center">
                                    <Icon name="mdi:calendar" class="size-5 mr-2" />
                                    Datum
                                </h2>
                                <p class="ml-7">{{ df.format(new Date(entry.date)) }}</p>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold inline-flex items-center">
                                    <Icon name="mdi:clock-time-four-outline" class="size-5 mr-2" />
                                    Arbeitszeit
                                </h2>
                                <p class="ml-7">{{ format24HoursData(entry.startWorkingTime) }} - {{
                                    format24HoursData(entry.endWorkingTime) }}</p>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold inline-flex items-center">
                                    <Icon name="mdi:cash" class="size-5 mr-2" />
                                    Verdienst
                                </h2>
                                <p class="ml-7">{{ curFormatter.format(entry.salary) }}</p>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold inline-flex items-center">
                                    <Icon name="mdi:target" class="size-5 mr-2" />
                                    Ziel
                                </h2>
                                <p class="ml-7">{{ computedGoals.find((e) => e.id === entry.goal)?.title
                                    || 'Nichts gefunden' }}</p>
                            </div>
                        </div>
                    </div>
                    <Card class="border-dashed border-2 w-full" v-if="!computedWorkingEntries.length">
                        <CardHeader>
                            <CardTitle>Arbeitszeit hinzufügen</CardTitle>
                            <CardDescription>Erstelle eine neue Arbeitszeit</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button class="w-full" variant="outline" @click="scrollTo('#arbeitszeit')">
                                <Icon name="mdi:plus" class="mr-2 size-5" />
                                Arbeitszeit hinzufügen
                            </Button>
                        </CardContent>
                    </Card>
                </ScrollArea>
            </div>
        </div>
        <CreateGoal ref="createGoal" @create-goal="fetchCreateGoal" @edit-goal="fetchEditGoal" />
    </div>
</template>

<script lang="ts" setup>
import { cn } from '@/lib/utils.js'
import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
    today,
} from '@internationalized/date'

import { useUser } from '~/composable/auth';
import CreateGoal from '~/components/system/modal/CreateGoal.vue';
import Calendar from '~/components/ui/calendar/Calendar.vue';
import ColorMode from '~/components/system/color/ColorMode.vue';
import { Progress } from '~/components/ui/progress';

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

const user = useUser();
const createGoal = ref<InstanceType<typeof CreateGoal> | null>(null);
const deleteWorkingEntryLoading = ref(false);

//Fetch
const fetchCreateGoal = async (data: { title: string, description: string, salary: number, maxsalary: number }) => {
    try {
        const res = await $fetch('/api/v1/goals/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error(error);
    } finally {
        setTimeout(() => {
            userGoals.refresh();
        }, 1000);
    }
}

const fetchEditGoal = async (data: { title: string, description: string, salary: number, maxsalary: number, id: number }) => {
    try {
        const res = await $fetch('/api/v1/goals/edit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error(error);
    } finally {
        setTimeout(() => {
            userGoals.refresh();
        }, 1000);
    }
}

//Statistics
const userStats = useFetch('/api/v1/statistics/get');

const computedStats = computed(() => {
    return userStats.data.value || [];
});
//End Statistics

//Goals
const userGoals = useFetch('/api/v1/goals/get');

const computedGoals = computed(() => {
    return userGoals.data.value || [];
});
//End Goals

//Working Calendar
const crrDate = ref<DateValue>(today(getLocalTimeZone())) as Ref<DateValue>;

const compDate = computed(() => {
    return crrDate.value.toDate(getLocalTimeZone()).toISOString();
});

const includesWorkedDay = (date: DateValue) => {
    const wDays = workedDays.data.value || [] as Date[];
    return wDays.some((d) => d.toString() === date.toDate(getLocalTimeZone()).toISOString());
}

const workedDays = useFetch('/api/v1/calendar/get', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    query: {
        date: compDate,
    },
    watch: [crrDate],
});
//End Working Calendar

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
})

const curFormatter = Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const workingTime = ref({
    // 7:30 - 16:30
    start: 750,
    end: 2250,
});

//default working time
const defaultWorkingTime = ref([800, 1600]);

//Working Entries
const workingEntries = useFetch('/api/v1/entries/get', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
});

const computedWorkingEntries = computed(() => {
    return workingEntries.data.value || [];
});

//End Working Entries

const computedDiff = computed(() => {
    return defaultWorkingTime.value[1] - defaultWorkingTime.value[0];
});

const format24HoursData = (value: number) => {
    //Industrie format 100 = 60 minutes
    const hours = Math.floor(value / 100);
    const minutes = value % 100 * 0.6;
    return `${hours}:${minutes.toFixed(0).padStart(2, '0')}`;
}

interface Goal {
    title: string;
    description: string;
    id: number;
    done: {
        hours: number;
        earning: number;
    };
    given: {
        hours: number;
        salary: number;
        maxsalary: number;
    };
}

export type { Goal };

const selectedCard = ref<number | null>(1);

const selectCard = (id: number) => {
    selectedCard.value = id;
}

const currentCard = computed(() => {
    return computedGoals.value.find((ziel: Goal) => ziel.id === selectedCard.value);
});

const isCardSelected = (id: number) => {
    return selectedCard.value === id;
}

const items = [
    { value: 0, label: 'Heute' },
    { value: 1, label: 'Morgen' },
    { value: 3, label: 'In 3 tagen' },
    { value: 7, label: 'In einer Woche' },
]

const selTime = ref<DateValue>();
const loadingWorkingTime = ref(false);

const addWorkingTime = async () => {
    if (!selTime.value || !currentCard.value || loadingWorkingTime.value) {
        return;
    }

    loadingWorkingTime.value = true;

    const date = selTime.value?.toDate(getLocalTimeZone()).toISOString() || today(getLocalTimeZone()).toDate(getLocalTimeZone()).toISOString();

    try {
        const res = await fetch('/api/v1/calendar/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date,
                workTimeFrom: defaultWorkingTime.value[0],
                workTimeTo: defaultWorkingTime.value[1],
                selectedGoal: currentCard.value?.id,
            }),
        });

        if (!res.ok) {
            throw new Error('Failed to add working time');
        }

        selTime.value = undefined;
        defaultWorkingTime.value = [800, 1600];
    } catch (error) {
        console.error(error);
    } finally {
        setTimeout(() => {
            workedDays.refresh();
            workingEntries.refresh();
            userStats.refresh();
            userGoals.refresh();
            loadingWorkingTime.value = false;
        }, 1000);
    }
}

const deleteWorkingEntry = async (id: number) => {
    deleteWorkingEntryLoading.value = true;
    console.log(id);
    try {
        const res = await $fetch(`/api/v1/entries/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
    } catch (error) {
        console.error(error);
    } finally {
        setTimeout(() => {
            workedDays.refresh({ dedupe: 'defer' });
            userStats.refresh({ dedupe: 'defer' });
            workingEntries.refresh({ dedupe: 'defer' });

            deleteWorkingEntryLoading.value = false;
        }, 1000);
    }
}

const logOut = async () => {
    await $fetch('/api/v1/auth/actions/logout');
    window.location.href = '/';
}

const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}
</script>