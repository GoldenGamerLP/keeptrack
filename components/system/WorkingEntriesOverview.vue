<template>
	<div class="mx-2 mb-4">
		<div class="flex justify-between">
			<h2 class="text-xl font-bold">Deine letzten Arbeitszeiten</h2>
			<Popover>
				<PopoverTrigger as-child>
					<Button variant="link" size="sm">
						<Icon name="mdi:filter" class="size-5" />
						Filter
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<RadioGroup :default-value="workingFilterEntries[0].id" v-model="workingFilter">
						<div class="flex items-center space-x-2" v-for="filter in workingFilterEntries"
							:key="filter.id">
							<RadioGroupItem :value="filter.id" :key="filter.id" :id="filter.id" class="size-6" />
							<Label :for="filter.id">{{ filter.title }}</Label>
						</div>
					</RadioGroup>
					<NumberField id="limit" :default-value="20" :min="1" :max="100" v-model="workingEntryLimit"
						class="mt-2">
						<Label for="limit">Limit</Label>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
				</PopoverContent>
			</Popover>
		</div>
		<ScrollArea class="h-[90vh]">
			<Card v-for="entry in workingEntries.data.value" :key="entry.id" class="relative mb-2">
				<div class="absolute top-2 right-2">
					<Button variant="outline" size="icon" class="" @click="deleteWorkingEntry(entry.id)"
						:loading="deleteWorkingEntryLoading" :title="`lösche arbeits eintrag ${entry.id}`">
						<Icon name="mdi:delete-forever" class="size-5" />
					</Button>
				</div>
				<CardHeader>
					<CardTitle>
						Arbeitszeit
						<span class="text-primary ml-2">{{ entry.id }}</span>
					</CardTitle>
					<CardDescription>
						Erstellt am {{ dateFormatter.format(new Date(entry.createdDate)) }}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<h2 class="text-lg font-semibold inline-flex items-center">
								<Icon name="mdi:calendar" class="size-5 mr-2" />
								Arbeitsdatum
							</h2>
							<p class="ml-7">{{ dateFormatter.format(new Date(entry.workingDate)) }}</p>
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
							<p class="ml-7">{{ currencyFormatter.format(entry.salary) }}</p>
						</div>
						<div>
							<h2 class="text-lg font-semibold inline-flex items-center">
								<Icon name="mdi:target" class="size-5 mr-2" />
								Ziel
							</h2>
							<p class="ml-7">{{ entry.goal }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card class="border-dashed border-2 w-full" v-if="!workingEntries.data.value?.length">
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
</template>

<script setup lang="ts">
import { useKeeptrackStore } from "~/store/keeptrack";
import { storeToRefs } from "pinia";

const store = useKeeptrackStore();
const { currencyFormatter, dateFormatter, format24HoursData, deleteWorkingEntry } = store;
const { deleteWorkingEntryLoading, workingFilter, workingEntryLimit, watchPropWorkEntries } = storeToRefs(store);


const workingEntries = useFetch("/api/v1/entries/get", {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
	query: {
		filter: workingFilter,
		limit: workingEntryLimit,
	},
	watch: [workingFilter, workingEntryLimit, watchPropWorkEntries],
});

const workingFilterEntries = ref([
	{
		icon: 'mdi:calendar',
		title: 'Datum',
		id: 'w-date',
	},
	{
		icon: 'mdi:clock-time-four-outline',
		title: 'Arbeitszeit',
		id: 'w-workingtime',
	},
	{
		icon: 'mdi:cash',
		title: 'Verdienst',
		id: 'w-earning',
	},
	{
		icon: 'mdi:target',
		title: 'Ziel',
		id: 'w-goal',
	},
]);

const scrollTo = (selector: string) => {
	const element = document.querySelector(selector);
	if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	}
}
</script>
