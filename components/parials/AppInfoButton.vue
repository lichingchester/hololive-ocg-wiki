<script setup lang="ts">
import { Copyright } from "lucide-vue-next";
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Copyright />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader class="text-start">
        <DialogTitle class="">
          Hololive OCG wiki
          <Badge size="sm" variant="outline" class="ml-2">
            <span class="text-xs">v0.1.0</span>
          </Badge>
        </DialogTitle>
        <DialogDescription> wip... </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
