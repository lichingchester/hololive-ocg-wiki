<script setup lang="ts">
import { ArrowLeft, LayoutGrid, List, Table2 } from "lucide-vue-next";
import type { StatusEntry } from "@/components/status/StatusCardGrid.vue";

const { t, locale } = useI18n();

useSeoMeta({
  title: t("status.title"),
  description: t("status.description"),
  robots: "index, follow",
});

useHead({
  bodyAttrs: { class: "bg-background" },
  htmlAttrs: { lang: locale.value },
});

// ── Data ──────────────────────────────────────────────────────────────────
interface StatusData {
  generatedAt: string;
  mode: string;
  source: { total: number; valid: number };
  skipped: (StatusEntry & { missingFields: string[] })[];
  diff: {
    new: StatusEntry[];
    changed: StatusEntry[];
    qaUpdated: StatusEntry[];
    removed: StatusEntry[];
  };
}

const { data: status } = await useAsyncData<StatusData>("status", () =>
  $fetch("/status.json"),
);

// ── View mode & sort ──────────────────────────────────────────────────────
type ViewMode = "grid" | "list" | "table";
type SortMode = "cardNumber" | "name";
type TabKey = "new" | "changed" | "qaUpdated" | "removed" | "skipped";

const viewMode = ref<ViewMode>("grid");
const sortMode = ref<SortMode>("cardNumber");
const activeTab = ref<TabKey>("new");

const tabs: TabKey[] = ["new", "changed", "qaUpdated", "removed", "skipped"];

function naturalSort(a: StatusEntry, b: StatusEntry, mode: SortMode): number {
  if (mode === "name") {
    const nameA = a.name || a.cardNumber || a.id;
    const nameB = b.name || b.cardNumber || b.id;
    return nameA.localeCompare(nameB);
  }
  // Card number natural sort: hBPXX-YYY
  const numA = a.cardNumber || `~${a.id}`; // push null to end
  const numB = b.cardNumber || `~${b.id}`;
  return numA.localeCompare(numB, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sorted(items: StatusEntry[]): StatusEntry[] {
  return [...items].sort((a, b) => naturalSort(a, b, sortMode.value));
}

const tabItems = computed<Record<TabKey, StatusEntry[]>>(() => {
  if (!status.value)
    return { new: [], changed: [], qaUpdated: [], removed: [], skipped: [] };
  return {
    new: sorted(status.value.diff.new),
    changed: sorted(status.value.diff.changed),
    qaUpdated: sorted(status.value.diff.qaUpdated),
    removed: sorted(status.value.diff.removed),
    skipped: sorted(status.value.skipped),
  };
});

function tabCount(key: TabKey): number {
  return tabItems.value[key]?.length ?? 0;
}

const formattedDate = computed(() => {
  if (!status.value?.generatedAt) return "—";
  return new Date(status.value.generatedAt).toLocaleDateString(locale.value, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const viewIcons = { grid: LayoutGrid, list: List, table: Table2 };
</script>

<template>
  <div class="min-h-svh bg-background">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div
        class="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 flex-wrap"
      >
        <!-- Back -->
        <Button variant="ghost" size="icon" as-child>
          <NuxtLink to="/">
            <ArrowLeft class="w-5 h-5" />
          </NuxtLink>
        </Button>

        <h1 class="text-lg font-semibold grow">{{ $t("status.title") }}</h1>

        <!-- Sort -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground hidden sm:inline">{{
            $t("status.sort.label")
          }}</span>
          <select
            v-model="sortMode"
            class="text-sm rounded-md border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="cardNumber">
              {{ $t("status.sort.cardNumber") }}
            </option>
            <option value="name">{{ $t("status.sort.name") }}</option>
          </select>
        </div>

        <!-- View mode toggle -->
        <div class="flex rounded-md border">
          <button
            v-for="(Icon, key) in viewIcons"
            :key="key"
            class="p-1.5 transition-colors"
            :class="
              viewMode === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            "
            :title="$t(`status.views.${key}`)"
            @click="viewMode = key as ViewMode"
          >
            <component :is="Icon" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-6">
      <!-- Stats bar -->
      <div v-if="status" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-lg border bg-card p-4 flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">{{
            $t("status.sourceTotal")
          }}</span>
          <span class="text-2xl font-bold tabular-nums">{{
            status.source.total.toLocaleString()
          }}</span>
        </div>
        <div class="rounded-lg border bg-card p-4 flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">{{
            $t("status.validInDB")
          }}</span>
          <span
            class="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums"
            >{{ status.source.valid.toLocaleString() }}</span
          >
        </div>
        <div class="rounded-lg border bg-card p-4 flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">{{
            $t("status.skippedCount")
          }}</span>
          <span
            class="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums"
            >{{ status.skipped.length }}</span
          >
        </div>
        <div class="rounded-lg border bg-card p-4 flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">{{
            $t("status.lastUpdated")
          }}</span>
          <span class="text-sm font-medium">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Explanation note -->
      <div
        v-if="status && status.skipped.length > 0"
        class="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
      >
        {{
          $t("status.dbTotal", {
            valid: status.source.valid,
            skipped: status.skipped.length,
          })
        }}
      </div>

      <!-- Full-mode note -->
      <div
        v-if="status?.mode === 'full'"
        class="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground"
      >
        {{ $t("status.fullModeNote") }}
      </div>

      <!-- Tabs -->
      <div v-if="status">
        <!-- Tab headers -->
        <div class="flex gap-1 border-b flex-wrap">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            :class="
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = tab"
          >
            {{ $t(`status.tabs.${tab}`) }}
            <span class="ml-1 text-xs tabular-nums">({{ tabCount(tab) }})</span>
          </button>
        </div>

        <!-- Tab content -->
        <div class="mt-4">
          <!-- Notes per tab -->
          <p
            v-if="activeTab === 'removed'"
            class="text-sm text-muted-foreground mb-4"
          >
            {{ $t("status.removedNote") }}
          </p>
          <p
            v-if="activeTab === 'skipped'"
            class="text-sm text-muted-foreground mb-4"
          >
            {{ $t("status.skippedNote") }}
          </p>

          <!-- Empty state -->
          <p
            v-if="tabCount(activeTab) === 0"
            class="text-muted-foreground text-sm py-8 text-center"
          >
            {{ $t("status.noChanges") }}
          </p>

          <!-- Grid view -->
          <StatusCardGrid
            v-else-if="viewMode === 'grid'"
            :items="tabItems[activeTab]"
            :status="activeTab"
          />

          <!-- List view -->
          <StatusCardList
            v-else-if="viewMode === 'list'"
            :items="tabItems[activeTab]"
            :status="activeTab"
          />

          <!-- Table view -->
          <StatusCardTable
            v-else
            :items="tabItems[activeTab]"
            :status="activeTab"
          />
        </div>
      </div>

      <!-- Loading -->
      <div
        v-else
        class="flex items-center justify-center h-64 text-muted-foreground"
      >
        {{ $t("Loading") }}
      </div>
    </div>
  </div>
</template>
