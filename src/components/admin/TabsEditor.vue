<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Tabs &amp; Services</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <div class="space-y-4">
        <div
          v-for="(tab, ti) in state.tabs"
          :key="ti"
          class="border rounded-lg p-3 transition-shadow"
          :class="[
            isTabDragOver(ti) ? 'border-brand-500/60 ring-2 ring-brand-500/40' : 'border-fg/10',
          ]"
          @dragenter="onTabDragEnter($event, ti)"
          @dragover="onTabDragOver($event, ti)"
          @drop="onTabDrop($event, ti)"
        >
          <!-- Tab header -->
          <div class="flex items-center gap-2">
            <button class="text-fg-dimmed hover:text-fg px-1" :title="isTabOpen(ti) ? 'Collapse' : 'Expand'" @click="toggleTab(ti)">
              <span v-if="isTabOpen(ti)">&#9662;</span><span v-else>&#9656;</span>
            </button>
            <input v-model="tab.name" type="text" class="admin-input flex-1 font-medium" placeholder="Tab name">
            <input v-model="tab.icon" type="text" class="admin-input w-36" placeholder="Icon (mdi:home)">
            <button
              class="text-fg-dimmed hover:text-fg px-1"
              :class="{ 'text-sky-400 hover:text-sky-300': !tab.hidden, 'text-fg-dimmed/50 hover:text-fg-dimmed': tab.hidden }"
              :title="tab.hidden ? 'Show tab on frontpage' : 'Hide tab from frontpage'"
              @click="toggleTabHidden(ti)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <template v-if="!tab.hidden">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </template>
                <template v-else>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </template>
              </svg>
            </button>
            <button
              class="text-fg-dimmed hover:text-fg px-1"
              :class="{ 'text-amber-400 hover:text-amber-300': tab.locked }"
              :title="tab.locked ? 'Unlock tab' : 'Lock tab'"
              @click="toggleTabLock(ti)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path v-if="tab.locked" d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path v-else d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            </button>
            <button
              class="text-fg-dimmed hover:text-fg px-1"
              :class="{ 'text-emerald-400 hover:text-emerald-300': true }"
              title="Export this tab as .yml"
              @click="doExportTab(ti)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              v-if="!tab.locked"
              class="text-red-400 hover:text-red-300 px-1"
              @click="removeTab(ti)"
            >
              &times;
            </button>
          </div>

          <!-- Collapsible tab content -->
          <div v-show="isTabOpen(ti)" class="mt-3">
            <!-- Groups -->
            <div class="space-y-3 ml-2">
              <div
                v-for="(group, gi) in tab.groups"
                :key="gi"
                class="border rounded p-2 bg-fg/[0.02] transition-shadow"
                :class="[
                  isGroupDragOver(ti, gi) ? 'border-brand-500/60 ring-2 ring-brand-500/40' : 'border-fg/10',
                  isDraggingGroup(ti, gi) ? 'opacity-50' : '',
                  isGroupDropBefore(ti, gi) ? 'border-t-2 border-t-brand-500' : '',
                  isGroupDropAfter(ti, gi) ? 'border-b-2 border-b-brand-500' : '',
                ]"
                :draggable="!tab.locked && !isGroupBeingEdited(ti, gi)"
                @dragstart="onGroupDragStart($event, ti, gi)"
                @dragover="onGroupDragOver($event, ti, gi)"
                @drop="onGroupDrop($event, ti, gi)"
                @dragend="onDragEnd"
              >
                <!-- Group header -->
                <div class="flex items-center gap-2 mb-2">
                  <span
                    v-if="!tab.locked && !isGroupBeingEdited(ti, gi)"
                    class="text-fg-dimmed/60 px-1 select-none"
                    style="cursor: grab;"
                    title="Drag to move group"
                  >&#x2630;</span>
                  <button class="text-fg-dimmed hover:text-fg px-1" title="Move up" @click="moveGroup(ti, gi, -1)">&#9650;</button>
                  <button class="text-fg-dimmed hover:text-fg px-1" title="Move down" @click="moveGroup(ti, gi, 1)">&#9660;</button>
                  <input v-model="group.name" type="text" class="admin-input flex-1" placeholder="Group name" draggable="false" @mousedown.stop>
                  <select v-model="group.display" class="admin-input text-xs" @mousedown.stop>
                    <option value="list">list</option>
                    <option value="grid">grid</option>
                  </select>
                  <button
                    class="text-fg-dimmed hover:text-fg px-1"
                    :class="{ 'text-sky-400 hover:text-sky-300': !group.hideTitle, 'text-fg-dimmed/50 hover:text-fg-dimmed': group.hideTitle }"
                    :title="group.hideTitle ? 'Show group title' : 'Hide group title'"
                    @click="group.hideTitle = !group.hideTitle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 7V4h16v3" />
                      <path d="M9 20h6" />
                      <path d="M12 4v16" />
                      <line v-if="group.hideTitle" x1="3" y1="3" x2="21" y2="21" />
                    </svg>
                  </button>
                  <button
                    class="text-fg-dimmed hover:text-fg px-1 text-xs"
                    :class="{ 'text-brand-500': isCardOpen(ti, gi) }"
                    title="Card style override"
                    @click="toggleCard(ti, gi)"
                  >card</button>
                  <button
                    v-if="!tab.locked"
                    class="text-orange-400 hover:text-orange-300 px-1 text-xs"
                    title="Copy group"
                    @click="copyGroup(ti, gi)"
                  >copy</button>
                  <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeGroup(ti, gi)">&times;</button>
                </div>

                <!-- Per-group card style override -->
                <div v-if="isCardOpen(ti, gi)" class="mb-2 border border-fg/10 rounded p-2 bg-fg/[0.03]">
                  <div class="flex items-center justify-between mb-1">
                    <h5 class="text-[10px] font-medium text-fg-dimmed uppercase tracking-wider">Card Style Override</h5>
                    <button
                      class="text-[10px] text-red-400 hover:text-red-300"
                      @click="resetGroupCard(group)"
                    >reset</button>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label class="admin-label">Background Color</label>
                      <div class="flex gap-1 items-center">
                        <input
                          :value="group.card.backgroundColor || '#000000'"
                          type="color"
                          class="w-6 h-6 rounded cursor-pointer border-0"
                          @input="group.card.backgroundColor = ($event.target as HTMLInputElement).value"
                        >
                        <input v-model="group.card.backgroundColor" type="text" class="admin-input flex-1" placeholder="#1a1a2e">
                      </div>
                    </div>
                    <div>
                      <label class="admin-label">Opacity</label>
                      <div class="flex gap-1 items-center">
                        <input v-model="group.card.opacity" type="range" min="0" max="1" step="0.05" class="flex-1">
                        <span class="text-[10px] text-fg-dimmed w-6 text-right">{{ group.card.opacity || '--' }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="admin-label">Blur (glass)</label>
                      <div class="flex gap-1 items-center">
                        <input
                          :value="parseFloat(group.card.blur) || 0"
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          class="flex-1"
                          @input="group.card.blur = ($event.target as HTMLInputElement).value + 'px'"
                        >
                        <span class="text-[10px] text-fg-dimmed w-8 text-right">{{ group.card.blur || '--' }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="admin-label">Border Width</label>
                      <input v-model="group.card.borderWidth" type="text" class="admin-input w-full" placeholder="1px">
                    </div>
                    <div>
                      <label class="admin-label">Border Style</label>
                      <select v-model="group.card.borderStyle" class="admin-input w-full">
                        <option value="">--</option>
                        <option value="none">none</option>
                        <option value="solid">solid</option>
                        <option value="dashed">dashed</option>
                        <option value="dotted">dotted</option>
                        <option value="double">double</option>
                      </select>
                    </div>
                    <div>
                      <label class="admin-label">Border Color</label>
                      <div class="flex gap-1 items-center">
                        <input
                          :value="group.card.borderColor || '#ffffff'"
                          type="color"
                          class="w-6 h-6 rounded cursor-pointer border-0"
                          @input="group.card.borderColor = ($event.target as HTMLInputElement).value"
                        >
                        <input v-model="group.card.borderColor" type="text" class="admin-input flex-1" placeholder="rgba(255,255,255,0.2)">
                      </div>
                    </div>
                    <div>
                      <label class="admin-label">Border Radius</label>
                      <input v-model="group.card.borderRadius" type="text" class="admin-input w-full" placeholder="0.5rem">
                    </div>
                    <div>
                      <label class="admin-label">Padding</label>
                      <input v-model="group.card.padding" type="text" class="admin-input w-full" placeholder="1rem">
                    </div>
                  </div>
                </div>

                <!-- Items -->
                <div class="space-y-1">
                  <div
                    v-for="(item, ii) in group.items"
                    :key="ii"
                    class="border rounded p-2 bg-fg/[0.03] text-xs transition-shadow"
                    :class="[
                      isItemDragOver(ti, gi, ii) ? 'border-brand-500/60' : 'border-fg/10',
                      isDraggingItem(ti, gi, ii) ? 'opacity-50' : '',
                      isItemDropBefore(ti, gi, ii) ? 'border-t-2 border-t-brand-500' : '',
                      isItemDropAfter(ti, gi, ii) ? 'border-b-2 border-b-brand-500' : '',
                    ]"
                    :draggable="!tab.locked && !isItemBeingEdited(ti, gi, ii)"
                    @dragstart="onItemDragStart($event, ti, gi, ii)"
                    @dragover="onItemDragOver($event, ti, gi, ii)"
                    @drop="onItemDrop($event, ti, gi, ii)"
                    @dragend="onDragEnd"
                  >
                    <!-- Stack item -->
                    <template v-if="item.stack">
                      <div class="flex items-center gap-1 mb-1">
                        <span
                          v-if="!tab.locked && !isItemBeingEdited(ti, gi, ii)"
                          class="text-fg-dimmed/60 px-1 select-none"
                          style="cursor: grab;"
                          title="Drag to move"
                        >&#x2630;</span>
                        <button class="text-fg-dimmed hover:text-fg px-1" title="Move up" @click="moveItem(ti, gi, ii, -1)">&#9650;</button>
                        <button class="text-fg-dimmed hover:text-fg px-1" title="Move down" @click="moveItem(ti, gi, ii, 1)">&#9660;</button>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">Stack</span>
                        <span v-if="item.span && parseInt(item.span) > 1" class="text-[10px] px-1.5 py-0.5 rounded bg-fg/10 text-fg-dimmed">span {{ item.span }}</span>
                        <span class="flex-1 font-medium text-fg truncate">{{ item.stack.length }} {{ item.stack.length === 1 ? 'item' : 'items' }}</span>
                        <button v-if="!tab.locked" class="text-orange-400 hover:text-orange-300 px-1 text-xs" title="Copy stack" @click="copyItem(ti, gi, ii)">copy</button>
                        <button class="text-brand-500 hover:text-brand-400 px-1 text-xs" @click="toggleEdit(ti, gi, ii)">
                          {{ isEditing(ti, gi, ii) ? 'close' : 'edit' }}
                        </button>
                        <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeItem(ti, gi, ii)">&times;</button>
                      </div>
                      <!-- Stack children (always visible) -->
                      <div class="ml-4 mt-1 space-y-1 border-l-2 border-violet-500/30 pl-2">
                        <div
                          v-for="(child, ci) in item.stack"
                          :key="ci"
                          class="border border-fg/10 rounded p-2 bg-fg/[0.03]"
                        >
                          <div class="flex items-center gap-1">
                            <button class="text-fg-dimmed hover:text-fg px-0.5" title="Move up" @click="moveStackChild(ti, gi, ii, ci, -1)">&#9650;</button>
                            <button class="text-fg-dimmed hover:text-fg px-0.5" title="Move down" @click="moveStackChild(ti, gi, ii, ci, 1)">&#9660;</button>
                            <span v-if="child.serviceType !== 'bookmark'" class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-500">
                              {{ typeLabel(child.serviceType) }}
                            </span>
                            <span class="flex-1 font-medium text-fg truncate">{{ itemTitle(child) }}</span>
                            <button class="text-brand-500 hover:text-brand-400 px-1 text-xs" @click="toggleEdit(ti, gi, ii, ci)">
                              {{ isEditing(ti, gi, ii, ci) ? 'close' : 'edit' }}
                            </button>
                            <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeStackChild(ti, gi, ii, ci)">&times;</button>
                          </div>
                          <div v-if="isEditing(ti, gi, ii, ci)" class="mt-2 space-y-2">
                            <AdminItemFields :item="child" :tab-index="ti" :group-index="gi" :item-index="ii" :global-kuma-slug="state.uptimeKumaSlug" />
                          </div>
                        </div>

                        <!-- Add child to stack -->
                        <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <button
                            class="text-[11px] text-brand-500 hover:text-brand-400"
                            @click="addStackChild(ti, gi, ii, 'bookmark')"
                          >+ Bookmark</button>
                          <span class="text-fg-dimmed/30">|</span>
                          <button
                            v-for="mod in STACK_MODULES"
                            :key="mod.type"
                            class="text-[11px] text-violet-400 hover:text-violet-300"
                            @click="addStackChild(ti, gi, ii, mod.type)"
                          >+ {{ mod.label }}</button>
                        </div>
                      </div>
                      <!-- Stack span editor -->
                      <div v-if="isEditing(ti, gi, ii)" class="mt-2 ml-4">
                        <label class="admin-label">Stack span</label>
                        <input v-model="item.span" type="text" class="admin-input w-20" placeholder="1">
                      </div>
                    </template>

                    <!-- Regular item -->
                    <template v-else>
                      <div class="flex items-center gap-1 mb-1">
                        <span
                          v-if="!tab.locked && !isItemBeingEdited(ti, gi, ii)"
                          class="text-fg-dimmed/60 px-1 select-none"
                          style="cursor: grab;"
                          title="Drag to move"
                        >&#x2630;</span>
                        <button class="text-fg-dimmed hover:text-fg px-1" title="Move up" @click="moveItem(ti, gi, ii, -1)">&#9650;</button>
                        <button class="text-fg-dimmed hover:text-fg px-1" title="Move down" @click="moveItem(ti, gi, ii, 1)">&#9660;</button>
                        <span v-if="item.serviceType !== 'bookmark'" class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-500">
                          {{ typeLabel(item.serviceType) }}
                        </span>
                        <span class="flex-1 font-medium text-fg truncate">{{ itemTitle(item) }}</span>
                        <button v-if="!tab.locked" class="text-orange-400 hover:text-orange-300 px-1 text-xs" title="Copy item" @click="copyItem(ti, gi, ii)">copy</button>
                        <button class="text-brand-500 hover:text-brand-400 px-1 text-xs" @click="toggleEdit(ti, gi, ii)">
                          {{ isEditing(ti, gi, ii) ? 'close' : 'edit' }}
                        </button>
                        <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeItem(ti, gi, ii)">&times;</button>
                      </div>
                      <div v-if="isEditing(ti, gi, ii)" class="mt-2 space-y-2">
                        <AdminItemFields :item="item" :tab-index="ti" :group-index="gi" :item-index="ii" :global-kuma-slug="state.uptimeKumaSlug" />
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Add bookmark -->
                <div class="mt-2 flex items-center gap-2">
                  <button
                    class="text-xs text-brand-500 hover:text-brand-400"
                    @click="addItem(ti, gi, 'bookmark')"
                  >+ Bookmark</button>
                  <button
                    v-if="clipboard?.kind === 'item'"
                    class="text-xs text-orange-400 hover:text-orange-300"
                    title="Paste copied item at end of this group"
                    @click="pasteItemInto(ti, gi)"
                  >&#x2398; Paste item</button>
                </div>

                <!-- Add module accordion -->
                <template v-if="group.display === 'grid'">
                  <div class="mt-1.5 border border-fg/10 rounded">
                    <button
                      class="w-full flex items-center gap-1 px-2 py-1 text-[11px] text-fg-dimmed hover:text-fg transition-colors"
                      @click="toggleModulePanel(ti, gi)"
                    >
                      <span class="text-[10px]" :class="isModulePanelOpen(ti, gi) ? 'rotate-90' : ''" style="transition: transform 0.15s">&#9656;</span>
                      <span>Modules</span>
                    </button>
                    <div v-show="isModulePanelOpen(ti, gi)" class="px-2 pb-2 space-y-2">
                      <div v-for="cat in MODULE_CATEGORIES" :key="cat.category">
                        <div class="text-[9px] uppercase tracking-wider text-fg-dimmed/60 font-medium mb-1">{{ cat.category }}</div>
                        <div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          <button
                            v-for="mod in cat.modules"
                            :key="mod.type"
                            class="text-[11px] px-2 py-1 rounded border border-brand-500/30 text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/50 transition-colors text-center truncate"
                            @click="addItem(ti, gi, mod.type)"
                          >+ {{ mod.label }}</button>
                        </div>
                      </div>
                      <div>
                        <div class="text-[9px] uppercase tracking-wider text-fg-dimmed/60 font-medium mb-1">Layout</div>
                        <div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          <button
                            class="text-[11px] px-2 py-1 rounded border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50 transition-colors text-center"
                            @click="addStack(ti, gi)"
                          >+ Stack</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div class="mt-2 ml-2 flex items-center gap-2">
              <button
                class="text-xs text-brand-500 hover:text-brand-400"
                @click="addGroup(ti)"
              >
                + Add Group
              </button>
              <button
                v-if="clipboard?.kind === 'group'"
                class="text-xs text-orange-400 hover:text-orange-300"
                title="Paste copied group into this tab"
                @click="pasteGroupInto(ti)"
              >&#x2398; Paste group</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <button
          class="text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded transition-colors"
          @click="addTab()"
        >
          + Add Tab
        </button>
        <label class="cursor-pointer text-sm px-3 py-1.5 rounded border border-fg/20 bg-fg/[0.03] text-fg hover:bg-fg/[0.06] transition-colors">
          Import Tab&hellip;
          <input
            ref="importInput"
            type="file"
            accept=".yml,.yaml"
            class="hidden"
            @change="doImportTab"
          >
        </label>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderCardStyle, BuilderGroup, BuilderItem, BuilderState, ServiceType } from '~/composables/useConfigBuilder'

const props = defineProps<{
  state: BuilderState
  addTab: (name?: string, icon?: string) => void
  removeTab: (index: number) => void
  toggleTabLock: (index: number) => void
  toggleTabHidden: (index: number) => void
  addGroup: (tabIndex: number, name?: string, display?: 'grid' | 'list') => void
  removeGroup: (tabIndex: number, groupIndex: number) => void
  addItem: (tabIndex: number, groupIndex: number, serviceType?: ServiceType) => void
  removeItem: (tabIndex: number, groupIndex: number, itemIndex: number) => void
  moveItem: (tabIndex: number, groupIndex: number, itemIndex: number, direction: -1 | 1) => void
  moveGroup: (tabIndex: number, groupIndex: number, direction: -1 | 1) => void
  addStack: (tabIndex: number, groupIndex: number) => void
  addStackChild: (tabIndex: number, groupIndex: number, itemIndex: number, serviceType?: ServiceType) => void
  removeStackChild: (tabIndex: number, groupIndex: number, itemIndex: number, childIndex: number) => void
  moveStackChild: (tabIndex: number, groupIndex: number, itemIndex: number, childIndex: number, direction: -1 | 1) => void
  exportTabYaml: (tabIndex: number) => string
  importTabFromYaml: (yamlStr: string) => boolean
  clipboard: { kind: 'item' | 'group'; payload: BuilderItem | BuilderGroup } | null
  copyItem: (tabIndex: number, groupIndex: number, itemIndex: number) => void
  copyGroup: (tabIndex: number, groupIndex: number) => void
  pasteItemInto: (tabIndex: number, groupIndex: number, atIndex?: number) => void
  pasteGroupInto: (tabIndex: number, atIndex?: number) => void
  moveItemTo: (from: { ti: number; gi: number; ii: number }, to: { ti: number; gi: number; index?: number }) => void
  moveGroupTo: (from: { ti: number; gi: number }, to: { ti: number; index?: number }) => void
}>()

const open = ref(true)
const openTabs = ref(new Set<number>())
const importInput = ref<HTMLInputElement | null>(null)

function slugify(s: string) {
  return (s || 'tab').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'tab'
}

function doExportTab(ti: number) {
  const yamlStr = props.exportTabYaml(ti)
  if (!yamlStr) return
  const tab = props.state.tabs[ti]
  const filename = `mafl-tab-${slugify(tab?.name || '')}.yml`
  const blob = new Blob([yamlStr], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function doImportTab(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const text = ev.target?.result as string
    if (!text) return
    const ok = props.importTabFromYaml(text)
    if (!ok) alert('Error importing tab: invalid file format')
  }
  reader.readAsText(file)
  input.value = ''
}
const openEdits = ref(new Set<string>())
const openCards = ref(new Set<string>())
const openModulePanels = ref(new Set<string>())

function isTabOpen(ti: number) {
  return openTabs.value.has(ti)
}

function toggleTab(ti: number) {
  if (openTabs.value.has(ti)) {
    openTabs.value.delete(ti)
  }
  else {
    openTabs.value.add(ti)
  }
}

function cardKey(ti: number, gi: number) {
  return `card-${ti}-${gi}`
}

function isCardOpen(ti: number, gi: number) {
  return openCards.value.has(cardKey(ti, gi))
}

function toggleCard(ti: number, gi: number) {
  const key = cardKey(ti, gi)
  if (openCards.value.has(key)) {
    openCards.value.delete(key)
  }
  else {
    openCards.value.add(key)
  }
}

function modulePanelKey(ti: number, gi: number) {
  return `mod-${ti}-${gi}`
}

function isModulePanelOpen(ti: number, gi: number) {
  return openModulePanels.value.has(modulePanelKey(ti, gi))
}

function toggleModulePanel(ti: number, gi: number) {
  const key = modulePanelKey(ti, gi)
  if (openModulePanels.value.has(key)) {
    openModulePanels.value.delete(key)
  }
  else {
    openModulePanels.value.add(key)
  }
}

function editKey(ti: number, gi: number, ii: number, ci?: number) {
  return ci != null ? `${ti}-${gi}-${ii}-${ci}` : `${ti}-${gi}-${ii}`
}

function isEditing(ti: number, gi: number, ii: number, ci?: number) {
  return openEdits.value.has(editKey(ti, gi, ii, ci))
}

function isItemBeingEdited(ti: number, gi: number, ii: number) {
  const prefix = `${ti}-${gi}-${ii}`
  for (const key of openEdits.value) {
    if (key === prefix || key.startsWith(`${prefix}-`)) return true
  }
  return false
}

function isGroupBeingEdited(ti: number, gi: number) {
  const prefix = `${ti}-${gi}-`
  for (const key of openEdits.value) {
    if (key.startsWith(prefix)) return true
  }
  return false
}

function toggleEdit(ti: number, gi: number, ii: number, ci?: number) {
  const key = editKey(ti, gi, ii, ci)
  if (openEdits.value.has(key)) {
    openEdits.value.delete(key)
  }
  else {
    openEdits.value.add(key)
  }
}

function resetGroupCard(group: BuilderGroup) {
  group.card.backgroundColor = ''
  group.card.opacity = ''
  group.card.blur = ''
  group.card.borderWidth = ''
  group.card.borderStyle = ''
  group.card.borderColor = ''
  group.card.borderRadius = ''
  group.card.padding = ''
}

interface ModuleOption { type: ServiceType; label: string }
interface ModuleCategory { category: string; modules: ModuleOption[] }

const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    category: 'Basic',
    modules: [
      { type: 'greeting', label: 'Greeting' },
      { type: 'custom-html', label: 'Custom HTML' },
    ],
  },
  {
    category: 'Weather',
    modules: [
      { type: 'openweathermap', label: 'OpenWeatherMap' },
      { type: 'datetime-weather', label: 'DateTime Weather' },
    ],
  },
  {
    category: 'Tools',
    modules: [
      { type: 'ip-api', label: 'IP API' },
      { type: 'time', label: 'Time' },
    ],
  },
  {
    category: 'Media',
    modules: [
      { type: 'web-radio', label: 'Web Radio' },
    ],
  },
  {
    category: 'Navigation',
    modules: [
      { type: 'tomtom-eta', label: 'TomTom' },
    ],
  },
  {
    category: 'Monitoring',
    modules: [
      { type: 'uptime-kuma', label: 'Uptime Kuma' },
    ],
  },
]

const STACK_MODULES: ModuleOption[] = [
  { type: 'time', label: 'Time' },
  { type: 'ip-api', label: 'IP API' },
  { type: 'greeting', label: 'Greeting' },
  { type: 'openweathermap', label: 'Weather' },
  { type: 'datetime-weather', label: 'DT Weather' },
  { type: 'custom-html', label: 'HTML' },
  { type: 'tomtom-eta', label: 'TomTom ETA' },
  { type: 'uptime-kuma', label: 'Uptime Kuma' },
]

const TYPE_LABELS: Record<string, string> = {
  openweathermap: 'Weather',
  'ip-api': 'IP API',
  time: 'Time',
  'datetime-weather': 'DateTime Weather',
  greeting: 'Greeting',
  'custom-html': 'Custom HTML',
  'tomtom-eta': 'TomTom ETA',
  'tomtom-eta-map': 'TomTom Route',
  'tomtom-traffic-map': 'TomTom Traffic',
  'web-radio': 'Web Radio',
  'uptime-kuma': 'Uptime Kuma',
}

function typeLabel(t: string) {
  return TYPE_LABELS[t] || ''
}

function itemTitle(item: BuilderItem) {
  if (item.stack && item.stack.length) return `${item.stack.length} items`
  if (item.title) return item.title
  if (item.serviceType === 'greeting' && item.greetText) return item.greetText
  if (item.serviceType === 'web-radio' && item.wrStationUuid) return typeLabel(item.serviceType) || item.serviceType
  if (item.serviceType !== 'bookmark') return typeLabel(item.serviceType) || item.serviceType
  return '(untitled)'
}

// --- Drag & drop ---

type ItemFrom = { ti: number; gi: number; ii: number }
type GroupFrom = { ti: number; gi: number }
type DragPayload = { kind: 'item'; from: ItemFrom } | { kind: 'group'; from: GroupFrom }

const dragState = ref<DragPayload | null>(null)
const dragOverKey = ref<string>('')
const dragInsertAfter = ref<boolean>(false)

function isTabLocked(ti: number): boolean {
  return !!props.state.tabs[ti]?.locked
}

function onItemDragStart(e: DragEvent, ti: number, gi: number, ii: number) {
  e.stopPropagation()
  if (isTabLocked(ti)) {
    e.preventDefault()
    return
  }
  dragState.value = { kind: 'item', from: { ti, gi, ii } }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', JSON.stringify(dragState.value)) }
    catch {}
  }
}

function onGroupDragStart(e: DragEvent, ti: number, gi: number) {
  if (isTabLocked(ti)) {
    e.preventDefault()
    return
  }
  dragState.value = { kind: 'group', from: { ti, gi } }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', JSON.stringify(dragState.value)) }
    catch {}
  }
}

function onDragEnd() {
  dragState.value = null
  dragOverKey.value = ''
}

function onItemDragOver(e: DragEvent, ti: number, gi: number, ii: number) {
  const d = dragState.value
  if (!d || d.kind !== 'item') return
  if (isTabLocked(ti)) return
  e.preventDefault()
  e.stopPropagation()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  dragInsertAfter.value = (e.clientY - rect.top) > rect.height / 2
  dragOverKey.value = `i-${ti}-${gi}-${ii}-${dragInsertAfter.value ? 'a' : 'b'}`
}

function onItemDrop(e: DragEvent, ti: number, gi: number, ii: number) {
  const d = dragState.value
  if (!d || d.kind !== 'item') return
  if (isTabLocked(ti)) return
  e.preventDefault()
  e.stopPropagation()
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const insertAfter = (e.clientY - rect.top) > rect.height / 2
  const dst = ii + (insertAfter ? 1 : 0)
  props.moveItemTo(d.from, { ti, gi, index: dst })
  closeOpenEdits()
  onDragEnd()
}

function onGroupDragOver(e: DragEvent, ti: number, gi: number) {
  const d = dragState.value
  if (!d) return
  if (isTabLocked(ti)) return
  if (d.kind === 'item') {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    if (!dragOverKey.value.startsWith(`i-${ti}-${gi}-`)) {
      dragOverKey.value = `g-${ti}-${gi}`
    }
  }
  else if (d.kind === 'group') {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    dragInsertAfter.value = (e.clientY - rect.top) > rect.height / 2
    dragOverKey.value = `g-${ti}-${gi}-${dragInsertAfter.value ? 'a' : 'b'}`
  }
}

function onGroupDrop(e: DragEvent, ti: number, gi: number) {
  const d = dragState.value
  if (!d) return
  if (isTabLocked(ti)) return
  e.preventDefault()
  e.stopPropagation()
  if (d.kind === 'item') {
    props.moveItemTo(d.from, { ti, gi })
  }
  else if (d.kind === 'group') {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const insertAfter = (e.clientY - rect.top) > rect.height / 2
    const dst = gi + (insertAfter ? 1 : 0)
    props.moveGroupTo(d.from, { ti, index: dst })
  }
  closeOpenEdits()
  onDragEnd()
}

function onTabDragEnter(_e: DragEvent, ti: number) {
  const d = dragState.value
  if (!d) return
  if (d.kind === 'item' && !isTabOpen(ti)) {
    openTabs.value.add(ti)
  }
}

function onTabDragOver(e: DragEvent, ti: number) {
  const d = dragState.value
  if (!d) return
  if (isTabLocked(ti)) return
  if (d.kind === 'group') {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    if (!dragOverKey.value.startsWith(`g-${ti}-`)) {
      dragOverKey.value = `t-${ti}`
    }
  }
}

function onTabDrop(e: DragEvent, ti: number) {
  const d = dragState.value
  if (!d) return
  if (isTabLocked(ti)) return
  if (d.kind === 'group') {
    e.preventDefault()
    e.stopPropagation()
    props.moveGroupTo(d.from, { ti })
    closeOpenEdits()
    onDragEnd()
  }
}

function closeOpenEdits() {
  openEdits.value.clear()
  openCards.value.clear()
  openModulePanels.value.clear()
}

function isItemDragOver(ti: number, gi: number, ii: number) {
  return dragOverKey.value.startsWith(`i-${ti}-${gi}-${ii}-`)
}
function isItemDropBefore(ti: number, gi: number, ii: number) {
  return dragOverKey.value === `i-${ti}-${gi}-${ii}-b`
}
function isItemDropAfter(ti: number, gi: number, ii: number) {
  return dragOverKey.value === `i-${ti}-${gi}-${ii}-a`
}
function isGroupDragOver(ti: number, gi: number) {
  return dragOverKey.value === `g-${ti}-${gi}` || dragOverKey.value.startsWith(`g-${ti}-${gi}-`)
}
function isGroupDropBefore(ti: number, gi: number) {
  return dragOverKey.value === `g-${ti}-${gi}-b`
}
function isGroupDropAfter(ti: number, gi: number) {
  return dragOverKey.value === `g-${ti}-${gi}-a`
}
function isTabDragOver(ti: number) {
  return dragOverKey.value === `t-${ti}`
}

function isDraggingItem(ti: number, gi: number, ii: number) {
  const d = dragState.value
  return !!(d && d.kind === 'item' && d.from.ti === ti && d.from.gi === gi && d.from.ii === ii)
}
function isDraggingGroup(ti: number, gi: number) {
  const d = dragState.value
  return !!(d && d.kind === 'group' && d.from.ti === ti && d.from.gi === gi)
}
</script>
