<template>
  <div class="space-y-6">
    <Card>
      <CardHeader
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <CardTitle>Stundenvergleich</CardTitle>
        <CardDescription>
          Stundenvergleich für {{ selectedMonths.length }} ausgewählte Monate im
          Jahr {{ selectedYear }}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <!-- Jahres- und Monatsauswahl -->
        <div class="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div class="flex items-center gap-2">
            <Select
              v-model="selectedYear"
              @update:model-value="handleYearChange"
            >
              <SelectTrigger class="w-[120px]">
                <SelectValue :placeholder="selectedYear" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="year in availableYears"
                  :key="year"
                  :value="year.toString()"
                >
                  {{ year }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              @click="previousYear"
              :disabled="parseInt(selectedYear) <= availableYears[0]"
            >
              <Icon name="mdi:chevron-left" class="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              @click="nextYear"
              :disabled="
                parseInt(selectedYear) >=
                availableYears[availableYears.length - 1]
              "
            >
              <Icon name="mdi:chevron-right" class="h-4 w-4" />
            </Button>
          </div>

          <div class="flex gap-1 flex-wrap">
            <Button
              v-for="month in 12"
              :key="month"
              :variant="isMonthSelected(month) ? 'default' : 'outline'"
              size="sm"
              class="h-8 w-8 p-0"
              @click="toggleMonth(month)"
            >
              {{ month }}
            </Button>
          </div>
        </div>

        <!-- Datenanzeige -->
        <div v-if="loading" class="flex justify-center items-center h-32">
          <Icon name="mdi:loading" class="h-6 w-6 animate-spin" />
        </div>

        <div
          v-else-if="selectedMonths.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          <div
            v-for="month in sortedSelectedMonths"
            :key="`${selectedYear}-${month}`"
            class="border border-border rounded-lg bg-card p-3 flex flex-col items-center transition-all hover:shadow-md"
          >
            <div class="text-sm font-medium text-center mb-1">
              {{
                dateFormatter.format(
                  new Date(
                    `${selectedYear}-${month.toString().padStart(2, "0")}-01`
                  )
                )
              }}
            </div>
            <div class="text-2xl font-bold text-primary">
              {{ getHoursForMonth(month).toFixed(1) }}
            </div>
            <div class="text-xs text-muted-foreground">Stunden</div>
          </div>
        </div>

        <div
          v-else
          class="flex justify-center items-center flex-col text-muted-foreground py-8"
        >
          <Icon name="mdi:calendar-clock" class="h-12 w-12 mb-2" />
          <span class="text-lg">Keine Monate ausgewählt</span>
          <span class="text-sm mt-1"
            >Bitte wählen Sie mindestens einen Monat aus</span
          >
        </div>
      </CardContent>

      <CardFooter
        v-if="selectedMonths.length > 0 && totalHours > 0"
        class="flex justify-between"
      >
        <div class="text-sm text-muted-foreground">
          Gesamt: {{ totalHours.toFixed(1) }} Stunden
        </div>
        <div class="text-sm text-muted-foreground">
          Ø {{ averageHours.toFixed(1) }} Stunden/Monat
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import type { HoursBetweenDate } from "~/server/utils/keeptrack";
import { useKeeptrackStore } from "~/store/keeptrack";

const { dateFormatter } = useKeeptrackStore();

// Reactive state
const selectedYear = ref(new Date().getFullYear().toString());
const selectedMonths = ref<number[]>([]);
const data = ref<HoursBetweenDate[] | null>(null);
const loading = ref(false);

// Computed properties
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
});

const sortedSelectedMonths = computed(() => {
  return [...selectedMonths.value].sort((a, b) => a - b);
});

const totalHours = computed(() => {
  if (!data.value) return 0;
  return data.value.reduce(
    (sum, entry) => sum + entry.totalHoursWorked / 100,
    0
  );
});

const averageHours = computed(() => {
  if (
    !data.value ||
    data.value.length === 0 ||
    selectedMonths.value.length === 0
  )
    return 0;
  return totalHours.value / selectedMonths.value.length;
});

// Methods
const isMonthSelected = (month: number) => {
  return selectedMonths.value.includes(month);
};

const getHoursForMonth = (month: number): number => {
  if (!data.value) return 0;
  const entry = data.value.find(
    (entry) =>
      entry._id.year === parseInt(selectedYear.value) &&
      entry._id.month === month
  );
  return entry ? entry.totalHoursWorked / 100 : 0;
};

const toggleMonth = (month: number) => {
  const index = selectedMonths.value.indexOf(month);

  if (index > -1) {
    // Monat ist bereits ausgewählt -> deselektieren
    selectedMonths.value.splice(index, 1);
  } else {
    // Monat ist nicht ausgewählt -> hinzufügen
    selectedMonths.value.push(month);
    // Sortiere das Array, um die Reihenfolge zu erhalten
    selectedMonths.value.sort((a, b) => a - b);
  }

  // Wenn Monate ausgewählt sind, Daten aktualisieren
  if (selectedMonths.value.length > 0) {
    updateData();
  } else {
    // Wenn keine Monate mehr ausgewählt sind, Daten leeren
    data.value = null;
  }
};

const handleYearChange = (newYear: string) => {
  selectedYear.value = newYear;
  updateData();
};

const previousYear = () => {
  const year = parseInt(selectedYear.value);
  const minYear = availableYears.value[0];
  if (year > minYear) {
    selectedYear.value = (year - 1).toString();
    updateData();
  }
};

const nextYear = () => {
  const year = parseInt(selectedYear.value);
  const maxYear = availableYears.value[availableYears.value.length - 1];
  if (year < maxYear) {
    selectedYear.value = (year + 1).toString();
    updateData();
  }
};

const updateData = async () => {
  if (selectedMonths.value.length === 0) {
    data.value = null;
    return;
  }

  loading.value = true;

  try {
    // Sortiere die ausgewählten Monate
    const sortedMonths = [...selectedMonths.value].sort((a, b) => a - b);
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];

    const from = new Date(parseInt(selectedYear.value), firstMonth - 1, 1);
    const to = new Date(parseInt(selectedYear.value), lastMonth, 1);

    const response = await $fetch<HoursBetweenDate[]>(
      "/api/v1/statistics/metrics/hoursBetweenDate",
      {
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }
    );

    data.value = response;
  } catch (error) {
    console.error("Error fetching ", error);
    data.value = null;
  } finally {
    loading.value = false;
  }
};

// Initialize with current year and current month selected
onMounted(() => {
  const currentMonth = new Date().getMonth() + 1;
  selectedMonths.value = [currentMonth];
  updateData();
});
</script>
