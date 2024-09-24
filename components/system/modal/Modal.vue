<template>
    <Transition name="slideright">
        <main
            class="h-screen z-10 fixed top-0 bg-body inset-0 p-2 transition-all will-change-transform duration-700"
            v-if="!!props">
            <div class="flex items-center">
                <Button variant="ghost" size="icon" @click="close" aria-label="close">
                    <Icon name="mdi:arrow-left" class=" size-5" />
                </Button>
                <h2 class="text-2xl font-bold"><slot name="title"></slot></h2>
            </div>
            <slot name="default" v-bind="props" />
        </main>
    </Transition>
</template>

<script setup lang="ts" generic="T">
const props = defineModel<T>()
const emits = defineEmits(["close"])

const close = () => {
    emits("close");
}
</script>

<style scoped>
.slideright-enter-from,
.slideright-leave-to {
    transform: translateX(-120%);
    opacity: 0.9;
}

.slideright-enter-to,
.slideright-leave-from {
    transform: translateX(0);
    opacity: 1;
}
</style>