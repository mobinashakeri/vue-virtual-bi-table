<template>
  <main class="min-h-screen bg-slate-100 py-10">
    <div class="mx-auto w-[90%] max-w-6xl">
      <header class="mb-6">
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm"
          >
            🗂️
          </span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              Vue Virtual Bi Table
            </h1>
            <p class="text-sm text-slate-500">
              Two-axis virtualization — smooth across tens of thousands of rows
              and a couple dozen columns.
            </p>
          </div>
        </div>
      </header>

      <Example />
    </div>
  </main>
</template>

<script setup lang="ts">
import Example from './components/Example.vue'
</script>
