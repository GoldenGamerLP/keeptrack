<template>
    <Modal v-model="currentGoal" @close="closeModal">
        <template #title>
            Ziel bearbeiten
        </template>
        <template #default v-bind="{ currentGoal }">
            <form class="space-y-4">
                <div>
                    <Label for="title-g">Informationen</Label>
                    <Input v-model="currentGoal.title" label="Titel" id="title-g" required/>
                </div>
                <div>
                    <Label for="description-g">Beschreibung</Label>
                    <Input v-model="currentGoal.description" label="Beschreibung" id="description-g" required />
                </div>
                <div>
                    <Label for="maxsalary-g">Maximaler Lohn</Label>
                    <Input v-model="currentGoal.given.maxsalary" label="Maximaler Lohn" id="maxsalary-g" required />
                </div>
                <div>
                    <Label for="salary-g">Lohn pro Stunde</Label>
                    <Input v-model="currentGoal.given.salary" type="number" min="12,40" max="100" step="1" label="Lohn"
                        id="salary-g" required />
                </div>
                <Button class="w-full" type="submit">
                    <Icon name="mdi:check" class="mr-2 size-5" />
                    Speichern
                </Button>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { type Goal } from '~/pages/myaccount/index.vue';
import Modal from './Modal.vue';
const currentGoal = ref<Goal | null>(null);

const open = (goal: Goal) => {
    currentGoal.value = goal;
}

const closeModal = () => {
    currentGoal.value = null;
}

defineExpose({ open });
</script>