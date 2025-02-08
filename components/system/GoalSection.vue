<template>
  <div class="pl-4">
    <div class="flex justify-between items-center">
      <h3 class="text-2xl font-bold flex items-center">
        <Icon name="mdi:goal" class="size-8 mr-2 text-primary" />
        Deine Ziele
      </h3>
      <Button
        @click="createGoal?.open(null)"
        variant="link"
        :disabled="computedGoalLength > 3"
      >
        <Icon name="mdi:plus" class="mr-2 size-5" />
        Ziel hinzufügen
      </Button>
    </div>
    <div
      class="flex flex-row gap-2 overflow-x-auto overflow-y-hidden snap-x [&>*]:snap-start snap-proximity [&>*]:flex-none"
      style="
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--border)) transparent;
      "
      ref="scrollContainer"
    >
      <Card
        v-for="ziel in userGoals.data.value"
        :class="{
          'w-[90vw]': computedGoalLength !== 1,
          'w-full': computedGoalLength === 1,
        }"
        :key="ziel.id"
      >
        <CardHeader>
          <CardTitle>{{ ziel.title }}</CardTitle>
          <CardDescription>{{ ziel.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            <li>
              <div class="font-semibold">
                Stunden: {{ Math.floor(ziel.done.hours / 100) }}
                <span class="text-xs align-top border-b border-b-foreground">
                  {{ (ziel.done.hours % 100) * 0.6 }}</span
                >
                .std
              </div>
            </li>
            <li>
              <div class="font-semibold">
                Verdienst: {{ currencyFormatter.format(ziel.done.earning) }}
              </div>
            </li>
            <li v-if="ziel.done.earning > ziel.given.maxsalary">
              <div class="font-semibold">
                Überstunden:
                {{
                  currencyFormatter.format(
                    ziel.done.earning - ziel.given.maxsalary
                  )
                }}
                |
                Stunden: {{
                  Math.floor(
                    (ziel.done.earning - ziel.given.maxsalary) /
                      ziel.given.salary
                  )
                }}
              </div>
            </li>
          </ul>
          <Progress
            :model-value="
              Math.min((ziel.done.earning / ziel.given.maxsalary) * 100, 100)
            "
            class="mt-2"
          />
          <div class="flex justify-center items-center">
            <span class="text-muted-foreground">
              {{ currencyFormatter.format(ziel.done.earning) }} /
              {{ currencyFormatter.format(ziel.given.maxsalary) }}
              (
              {{
                Math.floor((ziel.done.earning / ziel.given.maxsalary) * 100)
              }}% )
            </span>
          </div>
        </CardContent>
        <CardFooter class="flex justify-between">
          <Button
            @click="selectCard(ziel.id)"
            :disabled="isCardSelected(ziel.id)"
            :class="!isCardSelected(ziel.id) ? 'animate-pulsing' : ''"
            class="shadow-sm"
          >
            <Icon
              :name="isCardSelected(ziel.id) ? 'mdi:check-all' : 'mdi:check'"
              class="mr-2 size-5"
            />
            {{ isCardSelected(ziel.id) ? "Ausgewählt" : "Auswählen" }}
          </Button>
          <Button
            @click="createGoal?.open(ziel)"
            variant="outline"
            size="icon"
            :title="`edit goal ${ziel.title}`"
          >
            <Icon name="mdi:pencil" class="size-5" />
          </Button>
        </CardFooter>
      </Card>
      <Card
        v-if="computedGoalLength === 0"
        class="!border-dashed border-2 w-full"
      >
        <CardHeader>
          <CardTitle>Keine Ziele</CardTitle>
          <CardDescription>Erstelle dein erstes Ziel</CardDescription>
        </CardHeader>
        <CardContent>
          <Button @click="createGoal?.open(null)" variant="outline">
            <Icon name="mdi:plus" class="mr-2 size-5" />
            Ziel hinzufügen
          </Button>
        </CardContent>
      </Card>
    </div>
    <LazySystemModalCreateGoal
      ref="createGoal"
      @create-goal="fetchCreateGoal"
      @edit-goal="fetchEditGoal"
    />
  </div>
</template>

<script setup lang="ts">
import CreateGoal from "./modal/CreateGoal.vue";
import { useKeeptrackStore } from "~/store/keeptrack";

const {
  selectCard,
  isCardSelected,
  fetchCreateGoal,
  fetchEditGoal,
  currencyFormatter,
  setGoals,
} = useKeeptrackStore();
const { watchPropGoals } = storeToRefs(useKeeptrackStore());
const userGoals = await useFetch("/api/v1/goals/get", {
  watch: [watchPropGoals],
});
const createGoal = ref<InstanceType<typeof CreateGoal>>();
const computedGoalLength = computed(() => userGoals.data?.value?.length || 0);
const scrollContainer = ref<HTMLElement | null>(null);

//Watch -> set in store
watch(
  userGoals.data,
  (newVal) => {
    setGoals(newVal ?? []);
  },
  { immediate: true }
);

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("wheel", scrollHandler);
  }
});

onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("wheel", scrollHandler);
  }
});

const scrollHandler = (e: Event) => {
  const { deltaY } = e as WheelEvent;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value!;

  if (
    scrollLeft + clientWidth + deltaY > scrollWidth ||
    scrollLeft + deltaY < 0
  ) {
    return;
  }

  scrollContainer.value?.scrollBy({
    left: deltaY * 2.5,
    behavior: "smooth",
  });

  e.preventDefault();
};
</script>
