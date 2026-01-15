<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Container Monitor</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="containers.length > 0" class="nes-table-responsive">
      <table class="nes-table is-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Memory Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="container in containers" :key="container.name">
            <td>{{ container.name }}</td>
            <td>{{ container.memory_usage }}</td>
          </tr>
        </tbody>
      </table>
    </div>
     <div v-else-if="!loading">
      <p>No LXC containers found.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface Container {
  name: string;
  memory_usage: number | string;
}

export default defineComponent({
  name: 'ContainerMonitor',
  setup() {
    const containers = ref<Container[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchData = async () => {
      try {
        // Step 1: Fetch details for the '/lxc' cgroup, which lists the actual containers.
        const lxcGroupResponse = await fetch('/api/glances/api/v1.3/containers/lxc');
        if (!lxcGroupResponse.ok) {
          // If /lxc isn't found, don't treat it as a fatal error, just warn and show no containers.
          if (lxcGroupResponse.status === 404) {
            console.warn("Container group '/lxc' not found. No containers to display.");
            containers.value = [];
            return;
          }
          throw new Error(`Failed to fetch LXC container list from '/lxc': ${lxcGroupResponse.statusText}`);
        }
        const lxcGroupData = await lxcGroupResponse.json();
        const lxcContainers = lxcGroupData.subcontainers || [];

        if (lxcContainers.length === 0) {
          console.warn("No subcontainers found under '/lxc'.");
          containers.value = [];
          return;
        }

        // Step 2: Fetch detailed stats for each container found.
        const containerPromises = lxcContainers.map(async (containerInfo: any) => {
          const detailResponse = await fetch(`/api/glances/api/v1.3/containers${containerInfo.name}`);
          if (!detailResponse.ok) {
            console.error(`Could not fetch details for ${containerInfo.name}: ${detailResponse.statusText}`);
            return null; // Skip this container if details can't be fetched
          }
          const containerData = await detailResponse.json();
          const lastStat = containerData.stats?.[containerData.stats.length - 1];
          const spec = containerData.spec;

          if (!lastStat || !spec || !spec.memory) {
            return {
              name: containerInfo.name.replace('/lxc/', ''),
              memory_usage: 'N/A',
            };
          }
          
          const mem_usage_mb = (lastStat.memory.usage / 1024 / 1024);
          const mem_limit_mb = (spec.memory.limit / 1024 / 1024);
          const mem_percent = mem_limit_mb > 0 ? (mem_usage_mb / mem_limit_mb) * 100 : 0;

          return {
            name: containerInfo.name.replace('/lxc/', ''),
            memory_usage: `${mem_usage_mb.toFixed(2)} MB / ${mem_limit_mb.toFixed(0)} MB (${mem_percent.toFixed(1)}%)`,
          };
        });

        const resolvedContainers = (await Promise.all(containerPromises)).filter(c => c !== null);
        containers.value = resolvedContainers as Container[];

      } catch (e: any) {
        error.value = e.message;
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      containers,
      loading,
      error,
    };
  },
});
</script>

<style scoped>
/* Basic styling can be kept for fallback or specific overrides */
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
</style>
