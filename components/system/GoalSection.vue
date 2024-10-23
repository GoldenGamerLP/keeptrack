<template>
	<div class="mx-2">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">Deine Ziele</h2>
			<Button @click="createGoal?.open(null)" variant="link" :disabled="computedGoalLength > 3">
				<Icon name="mdi:plus" class="mr-2 size-5" />
				Ziel hinzufügen
			</Button>
		</div>
		<div
			class="flex flex-row my-2 gap-2 overflow-x-scroll overflow-y-hidden snap-x [&>*]:snap-start snap-proximity [&>*]:flex-none">
			<Card v-for="ziel in userGoals.data.value"
				:class="{ 'w-[90vw]': computedGoalLength !== 1, 'w-full': computedGoalLength === 1 }" :key="ziel.id">
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
					<p>Verdienst: <code>{{ currencyFormatter.format(ziel.done.earning) }}</code></p>
					<p v-if="ziel.given.maxsalary <= ziel.done.earning">
						<span class="text-primary">Überstunden: {{ currencyFormatter.format(ziel.done.earning -
							ziel.given.maxsalary) }}
							<span class="text-muted-foreground">
								({{ Math.floor((ziel.done.earning - ziel.given.maxsalary) / ziel.given.salary)
								}}
								<span class="text-xs align-top text-muted-foreground underline-offset-2 underline">
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
					<p>Stundenlohn: <code>{{ currencyFormatter.format(ziel.given.salary) }}</code></p>
					<p>Max. Verdienst: <code>{{ currencyFormatter.format(ziel.given.maxsalary) }}</code></p>
					<p>Auszahl Tag im Monat: <code>{{ ziel.given.paydayofmonth }}</code> </p>
					<Progress :model-value="Math.min(ziel.done.earning / ziel.given.maxsalary * 100, 100)"
						class="mt-4" />
				</CardContent>
				<CardFooter class="flex justify-between">
					<Button @click="selectCard(ziel.id)" :disabled="isCardSelected(ziel.id)"
						:class="!isCardSelected(ziel.id) ? 'animate-pulsing' : ''">
						<Icon :name="isCardSelected(ziel.id) ? 'mdi:check-all' : 'mdi:check'" class="mr-2 size-5" />
						{{ isCardSelected(ziel.id) ? 'Ausgewählt' : 'Auswählen' }}
					</Button>
					<Button @click="createGoal?.open(ziel)" variant="outline" size="icon"
						:title="`edit goal ${ziel.title}`">
						<Icon name="mdi:pencil" class=" size-5" />
					</Button>
				</CardFooter>
			</Card>
			<Card v-if="computedGoalLength === 0" class="!border-dashed border-2 w-full">
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
		<LazySystemModalCreateGoal ref="createGoal" @create-goal="fetchCreateGoal" @edit-goal="fetchEditGoal" />
	</div>
</template>

<script setup lang="ts">
import CreateGoal from './modal/CreateGoal.vue';
import { useKeeptrackStore } from '~/store/keeptrack';

const { selectCard, isCardSelected, fetchCreateGoal, fetchEditGoal, currencyFormatter, setGoals } = useKeeptrackStore();
const { watchPropGoals } = storeToRefs(useKeeptrackStore());
const userGoals = useFetch("/api/v1/goals/get", { watch: [watchPropGoals] });
const createGoal = ref<InstanceType<typeof CreateGoal>>();
const computedGoalLength = computed(() => userGoals.data?.value?.length || 0);

//Watch -> set in store
watch(userGoals.data, (newVal) => {
	setGoals(newVal ?? []);
}, { immediate: true });
</script>
