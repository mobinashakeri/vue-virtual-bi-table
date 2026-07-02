<template>
  <main class="min-h-screen bg-slate-100 py-10">
    <div class="mx-auto w-[90%] max-w-6xl">
      <header class="mb-6">
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm"
          >
            🗂️
          </span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              Vue Virtual Table
            </h1>
            <p class="text-sm text-slate-500">
              Two-axis virtualization that scales to tens of thousands of rows
              and hundreds of columns.
            </p>
          </div>
        </div>
      </header>

      <TaskTable />
    </div>
  </main>
</template>

<script setup lang="ts">
import TaskTable from './components/TaskTable.vue'
</script>
