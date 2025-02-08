<template>
	<Card class="mx-4" id="arbeitszeit">
		<CardHeader>
			<CardTitle>
				Arbeitsstunden hinzufügen
			</CardTitle>
			<CardDescription>
				Ziel: <span class="text-primary">{{ currentCard ? currentCard.title : "Nichts aufgewählt!" }}</span>
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form class="space-y-4" @submit.prevent="addWorkingTime">
				<Popover>
					<PopoverTrigger as-child>
						<Button variant="outline" :class="cn(
							'w-full justify-start text-left font-normal',
							!selTime && 'text-muted-foreground',
						)">
							<Icon name="mdi:calendar" class="mr-2 size-5" />
							{{ selTime ? dateFormatter.format(selTime.toDate(getLocalTimeZone())) : "Datum auswählen" }}
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
								<SelectItem v-for="item in workingTimeOptions" :key="item.value"
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
							{{ Math.floor(workingTimeDifference / 100) }}
							<span class="text-xs align-top text-muted-foreground underline-offset-2 underline">{{
								workingTimeDifference % 100 * 0.6 }}</span>
							.std)
						</span>
					</div>
					<span class="text-muted-foreground">{{ format24HoursData(defaultWorkingTime[1]) }}</span>
				</div>
				<Button class="w-full" @click.stop="addWorkingTime" :disabled="!selTime || !currentCard"
					:variant="alreadyExists.data.value ? 'destructive' : 'default'"
					:loading="alreadyExists.status.value === 'pending' || loadingWorkingTime">
					<template v-if="alreadyExists.data.value">
						<Icon name="mdi:close" class="mr-2 size-5" />
						Arbeitszeit bereits hinzugefügt
					</template>
					<template v-else>
						<Icon name="mdi:plus" class="mr-2 size-5" />
						Arbeitszeit hinzufügen
					</template>
				</Button>
			</form>
		</CardContent>
	</Card>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils';
import { today, getLocalTimeZone } from '@internationalized/date';
import { useKeeptrackStore } from '~/store/keeptrack';
import { storeToRefs } from 'pinia';

const store = useKeeptrackStore();
const { timeIsAlreadyAdded, addWorkingTime, format24HoursData, dateFormatter } = store;
const { workingTime, defaultWorkingTime, currentCard, loadingWorkingTime, selTime } = storeToRefs(store);

const workingTimeDifference = computed(() => defaultWorkingTime.value[1] - defaultWorkingTime.value[0]);

const workingTimeOptions = [
	{ value: -1, label: 'Gestern' },
	{ value: 0, label: 'Heute' },
	{ value: 1, label: 'Morgen' },
	{ value: 3, label: 'In 3 tagen' },
	{ value: 7, label: 'In einer Woche' },
]

const alreadyExists = useAsyncData("hasWorked", () => timeIsAlreadyAdded(selTime.value), { watch: [selTime] });
</script>
