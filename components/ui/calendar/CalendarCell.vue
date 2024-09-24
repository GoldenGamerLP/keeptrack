<script lang="ts" setup>
import { type HTMLAttributes, computed } from 'vue'
import { CalendarCell, type CalendarCellProps, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarCellProps & { class?: HTMLAttributes['class'] } & { isHighlighted: boolean }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCell
    :class="cn('relative h-9 w-9 p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([data-selected])]:rounded-md [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-view])]:bg-accent/50', props.class)"
    v-bind="forwardedProps">
    <div class="rounded-full size-2 bg-primary top-1 right-[50%] translate-x-[50%] absolute" v-if="props.isHighlighted"></div>
    <slot />
  </CalendarCell>
</template>
