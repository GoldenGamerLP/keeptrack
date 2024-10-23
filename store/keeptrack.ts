import { defineStore, acceptHMRUpdate } from "pinia";
import {
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
import { useToast } from "~/components/ui/toast";
import type { Goal } from "~/server/utils/keeptrack";
import { useLocalStorage } from "@vueuse/core";

export const useKeeptrackStore = defineStore("keeptrack", () => {
  const { toast } = useToast();


  const dateFormatter = new DateFormatter("de-DE", {
    dateStyle: "long",
  });

  const currencyFormatter = Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  //Using useFetch with watch to update if props change
  const watchPropsCal = ref(false);
  const watchPropGoals = ref(false);
  const watchPropWorkEntries = ref(false);
  const watchPropStats = ref(false);


  const currentGoals = ref([] as Goal[]);
  const deleteWorkingEntryLoading = ref(false);
  const workingFilter = ref();
  const workingEntryLimit = ref();
  const defaultWorkingTime = ref([800, 1600]);
  const workingTime = ref({
    // 7:30 - 16:30
    start: 750,
    end: 2250,
  });
  const crrDate = ref<DateValue>();
  const selTime = ref<DateValue>();
  const selectedCard = useLocalStorage("selectedCard", 0);
  const loadingWorkingTime = ref(false);

  
  const updateData = (
    option: "cal" | "goals" | "workEntries" | "stats" | void
  ) => {
    switch (option) {
      case "cal":
        watchPropsCal.value = !watchPropsCal.value;
        break;
      case "goals":
        watchPropGoals.value = !watchPropGoals.value;
        break;
      case "workEntries":
        watchPropWorkEntries.value = !watchPropWorkEntries.value;
        break;
      case "stats":
        watchPropStats.value = !watchPropStats.value;
        break;
      default:
        watchPropsCal.value = !watchPropsCal.value;
        watchPropGoals.value = !watchPropGoals.value;
        watchPropWorkEntries.value = !watchPropWorkEntries.value;
        watchPropStats.value = !watchPropStats.value;
        break;
    }
  };

  const selectCard = (id: number) => {
    selectedCard.value = id;
  };

  const isCardSelected = (id: number) => {
    return selectedCard.value === id;
  };

  const workingTimeDifference = computed(() => {
    return defaultWorkingTime.value[1] - defaultWorkingTime.value[0];
  });

  const currentCard = computed(() => {
    return currentGoals.value.find((goal) => goal.id === selectedCard.value);
  });

  const setGoals = (goals: Goal[]) => {
    currentGoals.value = goals;
  };

  const format24HoursData = (value: number) => {
    //Industrie format 100 = 60 minutes
    const hours = Math.floor(value / 100);
    const minutes = (value % 100) * 0.6;
    return `${hours}:${minutes.toFixed(0).padStart(2, "0")}`;
  };

  const timeIsAlreadyAdded = async (date: DateValue | undefined) => {
    if (!date) return false;
    const currentDate = date.toDate(getLocalTimeZone()).toISOString();
    try {
      return $fetch("/api/v1/calendar/has", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          date: currentDate,
        },
      });
    } catch (error) {
      console.error(error);
    }

    return false;
  };

  const addWorkingTime = async () => {
    if (!selTime.value || !currentCard.value || loadingWorkingTime.value) {
      return;
    }

    loadingWorkingTime.value = true;

    const date = selTime.value
      ? selTime.value.toDate(getLocalTimeZone()).toISOString()
      : undefined;

    try {
      const res = await $fetch("/api/v1/calendar/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          workTimeFrom: defaultWorkingTime.value[0],
          workTimeTo: defaultWorkingTime.value[1],
          selectedGoal: currentCard.value?.id,
        }),
      });

      if (res) {
        toast({
          title: "Erfolgreich",
          description: "Arbeitszeit hinzugefügt",
        });
      }

      selTime.value = undefined;
      defaultWorkingTime.value = [800, 1600];
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Arbeitszeit",
      });
    } finally {
      setTimeout(() => {
        loadingWorkingTime.value = false;
        updateData();
      }, 1000);
    }
  };

  const deleteWorkingEntry = async (id: number) => {
    deleteWorkingEntryLoading.value = true;
    console.log(id);
    try {
      const res = await $fetch(`/api/v1/entries/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        deleteWorkingEntryLoading.value = false;

        //Update data -> goals, entries, stats, calendar
        updateData();
      }, 1000);
    }
  };

  const fetchCreateGoal = async (data: {
    title: string;
    description: string;
    salary: number;
    maxsalary: number;
  }) => {
    try {
      const res = await $fetch("/api/v1/goals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res) {
        toast({
          title: "Erfolgreich",
          description: "Ziel erstellt",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Ziels",
      });
    } finally {
      setTimeout(() => {
        updateData("goals");
      }, 1000);
    }
  };

  const fetchEditGoal = async (data: {
    title: string;
    description: string;
    salary: number;
    maxsalary: number;
    id: number;
  }) => {
    try {
      const res = await $fetch("/api/v1/goals/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res) {
        toast({
          title: "Erfolgreich",
          description: "Ziel bearbeitet",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Fehler beim Bearbeiten des Ziels",
      });
    } finally {
      setTimeout(() => {
        updateData("goals");
        updateData("workEntries");
      }, 1000);
    }
  };

  return {
    dateFormatter,
    currencyFormatter,
    deleteWorkingEntryLoading,
    workingFilter,
    workingEntryLimit,
    defaultWorkingTime,
    workingTime,
    crrDate,
    selTime,
    selectedCard,
    loadingWorkingTime,
    selectCard,
    isCardSelected,
    workingTimeDifference,
    currentCard,
    setGoals,
    addWorkingTime,
    deleteWorkingEntry,
    fetchCreateGoal,
    fetchEditGoal,
    format24HoursData,
    timeIsAlreadyAdded,
    currentGoals,
    updateProp: updateData,
    watchPropsCal,
    watchPropGoals,
    watchPropWorkEntries,
    watchPropStats,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useKeeptrackStore, import.meta.hot));
}
