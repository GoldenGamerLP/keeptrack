<template>
	<div class="grid grid-flow-col grid-rows-2 gap-2 mx-2">
		<Card v-for="card in userStats.data.value" :key="card.title">
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
					{{ currencyFormatter.format(card.value) }}
				</span>

			</CardContent>
		</Card>
	</div>
</template>

<script setup lang="ts">
import { useKeeptrackStore } from '~/store/keeptrack';

const { currencyFormatter } = useKeeptrackStore();
const { watchPropStats } = storeToRefs(useKeeptrackStore());

const userStats = useFetch("/api/v1/statistics/get", { watch: [watchPropStats] });
</script>
