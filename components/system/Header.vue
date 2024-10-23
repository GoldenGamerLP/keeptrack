<template>
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
						<AvatarFallback>
							<Icon name="mdi:account" class="size-5" />
						</AvatarFallback>
					</Avatar>
					<Icon name="mdi:chevron-down" class="ml-2 size-5 text-popover-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="space-y-2">
				Benutzer: {{ user?.displayname }}
				<Separator orientation="horizontal" />
				<ColorMode />
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
