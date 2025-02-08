<template>
	<Card class="m-2">
		<CardHeader>
			<CardTitle>Monats übersicht</CardTitle>
			<CardDescription>Die Tage an den du gearbeitet hast.</CardDescription>
		</CardHeader>
		<CardContent>
			<Calendar v-model:placeholder="crrDate" :matcher="isAlreadyAdded" :max-value="today(getLocalTimeZone())"
				:readonly="true" />
		</CardContent>
	</Card>
</template>

<script setup lang="ts">
import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
import { useKeeptrackStore } from '~/store/keeptrack';

const { watchPropsCal } = storeToRefs(useKeeptrackStore());
const crrDate = ref(today(getLocalTimeZone()))  as Ref<DateValue>;
const computedDateToString = computed(() => crrDate.value.toDate(getLocalTimeZone()).toISOString());

const workedDays = await useFetch("/api/v1/calendar/get", {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
	query: {
		date: computedDateToString,
	},
	watch: [computedDateToString, watchPropsCal],
});

const isAlreadyAdded = (date: DateValue) => {
	if (!workedDays.data || !workedDays.data.value) return false;
	return workedDays.data.value.includes(date.toDate(getLocalTimeZone()).toISOString());
};
</script>
