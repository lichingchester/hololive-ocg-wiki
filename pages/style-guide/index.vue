<template>
  <div class="container mx-auto px-4 py-4">
    <div class="flex justify-between">
      <div class="text-4 font-weight-2">Style Guide</div>
      <AppColorModeSwitcher />
    </div>

    <div class="py-4">
      <div class="text-3 font-weight-2 mb-1">Font Sizes</div>
      <div class="flex flex-wrap gap-2">
        <Badge>
          <div class="text-1">.text-1</div>
        </Badge>
        <Badge>
          <div class="text-2">.text-2</div>
        </Badge>
        <Badge>
          <div class="text-3">.text-3</div>
        </Badge>
        <Badge>
          <div class="text-4">.text-4</div>
        </Badge>
      </div>
    </div>

    <div class="py-4">
      <div class="text-3 font-weight-2 mb-1">Font Weight</div>
      <div class="flex flex-wrap gap-2">
        <Badge>
          <div class="font-weight-1">.font-weight-1</div>
        </Badge>
        <Badge>
          <div class="font-weight-2">.font-weight-2</div>
        </Badge>
      </div>
    </div>

    <div class="py-4">
      <div class="text-3 font-weight-2 mb-1">Font Colors</div>
      <div class="flex flex-wrap gap-2">
        <Badge variant="outline">
          <div class="text-primary">.text-primary</div>
        </Badge>
        <Badge variant="outline">
          <div class="text-secondary">.text-secondary</div>
        </Badge>
        <Badge variant="outline">
          <div class="text-muted">.text-muted</div>
        </Badge>
        <Badge variant="outline">
          <div class="text-accent">.text-accent</div>
        </Badge>
      </div>
    </div>
  </div>
</template>
