<template>
	<header class="flex items-center justify-between px-4 pb-0 pt-2">
		<div class="flex items-center">
			<Icon name="lucide:coins" class="size-10 text-primary mr-2" />
			<div class="grid">
				<h1 class="text-2xl font-bold">KeepTrack</h1>
				<p class="text-sm text-muted-foreground">Willkommen zurück {{ user?.displayname }}!</p>
			</div>
		</div>
		<Popover>
			<PopoverTrigger as-child>
				<Button size="sm" variant="link">
					<Avatar title="settings">
						<AvatarFallback>
							<Icon name="mdi:account" class="size-5" />
						</AvatarFallback>
					</Avatar>
					<Icon name="mdi:chevron-down" class="ml-2 size-5 text-popover-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="space-y-2">
				<span>Benutzer: {{ user?.displayname }}</span>
				<Separator orientation="horizontal" />
				<ColorMode />
				<NuxtLink to="/myaccount" class="w-full block" prefetch-on="visibility">
					<Button variant="outline" class="w-full">
						<Icon name="mdi:account" class="mr-2 size-5" />
						Mein Konto
					</Button>
				</NuxtLink>
				<NuxtLink to="/myaccount/insights" class="w-full block" prefetch-on="visibility">
					<Button variant="outline" class="w-full">
						<Icon name="mdi:chart-line" class="mr-2 size-5" />
						Statistiken
					</Button>
				</NuxtLink>
				<Button class="w-full" variant="outline" @click="logOut">
					<Icon name="mdi:account-arrow-left" class="mr-2 size-5" />
					Logge dich aus
				</Button>
			</PopoverContent>
		</Popover>
	</header>
</template>

<script setup lang="ts">
import { useUser } from '~/composable/auth';
import ColorMode from './color/ColorMode.vue';

const user = useUser();

const logOut = async () => {
	await $fetch('/api/v1/auth/actions/logout');
	window.location.href = '/';
}
</script>
