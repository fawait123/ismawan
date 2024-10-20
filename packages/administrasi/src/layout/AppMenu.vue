<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Master Data',
        items: [
            {
                label: 'Pengguna',
                icon: 'pi pi-fw pi-book',
                to: '/user'
            },
            {
                label: 'Aktifitas',
                icon: 'pi pi-calendar',
                to: '/activity'
            },
            {
                label: 'Pekerja',
                icon: 'pi pi-th-large',
                to: '/employee'
            },
            {
                label: 'Perusahaan',
                icon: 'pi pi-server',
                to: '/company'
            },
        ]
    },
    {
        label: "Transaksi",
        items: [
            {
                label: 'Hasil Kerja Anggota',
                icon: 'pi pi-stopwatch',
                to: '/member-work-result'
            },
            {
                label: 'Tambah Hasil Kerja Anggota',
                icon: 'pi pi-stop-circle',
                to: '/member-work-result/form'
            },
            {
                label: 'Invoice',
                icon: 'pi pi-link',
                to: '/invoice'
            },
            {
                label: 'Tambah Invoice',
                icon: 'pi pi-stop-circle',
                to: '/invoice/form'
            },
        ]
    },
    {
        label: 'Akutansi',
        items: [{ label: 'Laba Rugi', icon: 'pi pi-percentage', to: '/' }]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
