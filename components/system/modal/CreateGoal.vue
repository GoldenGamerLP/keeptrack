<template>
    <Modal v-model="isOpen" @close="closeModal">
        <template #title>
            {{ typeof isOpen === 'boolean' ? 'Ziel erstellen' : 'Ziel bearbeiten' }}
        </template>
        <template #default>
            <AutoForm class="space-y-6" :schema="schema" :form="form" @submit="submit"
                :fieldConfig="{ salary: { inputProps: { type: 'text' } } }">

                <Button class="w-full" type="submit">
                    <Icon name="mdi:check" class="mr-2 size-5" />
                    Speichern
                </Button>
            </AutoForm>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import * as z from 'zod'
import { AutoForm } from '@/components/ui/auto-form'
import { useForm } from 'vee-validate'
import { useEventListener } from '@vueuse/core';

import Modal from './Modal.vue';
import { toTypedSchema } from '@vee-validate/zod';
import type { Goal } from '~/pages/myaccount.vue';
const isOpen = ref<Goal | boolean>(false);
const emits = defineEmits(["createGoal", "editGoal"]);

const schema = z.object({
    title: z.string().min(3, 'Titel muss mindestens 3 Zeichen lang sein').describe('Titel deines Ziels'),
    description: z.string().min(3, 'Beschreibung muss mindestens 3 Zeichen lang sein').describe('Beschreibung deines Ziels'),
    salary: z.coerce.number().min(12.4, 'Mindestlohn ist 12,40').max(100, 'Maximallohn ist 100').describe('Dein Lohn pro Stunde'),
    maxsalary: z.number().min(12.4, "Maximaler Lohn muss größer als 12,4€").describe('Dein Maximaler Lohn z.B 538€').refine(x => x * 100 - Math.trunc(x * 100) < Number.EPSILON, "Maximaler Lohn muss auf 2 Nachkommastellen genau sein"),
    paydayofmonth: z.number().min(1, "Zahl muss größer als 1 sein").max(31, "Zahl muss kleiner als 31 sein").describe('Dein Zahlungstag im Monat'),
});

useEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

useEventListener('popstate', (event: PopStateEvent) => {
    event.preventDefault();
    window.history.pushState(null, "", window.location.pathname);
    closeModal();
});

watch(isOpen, (value) => {
    if (typeof value === 'boolean') {
        return;
    }
    
    //Set value inside form
    form.setValues({
        title: value.title,
        description: value.description,
        salary: value.given.salary,
        maxsalary: value.given.maxsalary,
        paydayofmonth: value.given.paydayofmonth,
    });
});

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const open = (goal: Goal | null) => {
    isOpen.value = goal ?? true;
}

const closeModal = () => {
    isOpen.value = false;
}

const submit = async (values: Record<string, any>) => {
    if (typeof isOpen.value === 'boolean') {
        emits('createGoal', values);
    } else {
        const id = isOpen.value.id;
        emits('editGoal', { ...values, id });
    }
    closeModal();
}

defineExpose({ open });
</script>