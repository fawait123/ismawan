<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { activitySchema } from '@/schema/index';
import doRequest from '@/helpers/do-request.helper';
import { ResponseMessage } from '@/helpers';
import { IPagination } from '@/interfaces/index'
import { DataTablePageEvent } from 'primevue/datatable';

onMounted(() => {
    getData()
});

const toast = useToast();
const dt = ref();
const activitys = ref<IPagination<any>>({
    value: [],
    pageLinkSize: 10,
    rowsPerPageOptions: [10, 20, 50, 100],
    lazy: true,
    loading: false,
    first: 0,
    rows: 10,
    totalRecords: 0,
    search: null
});
const activityDialog = ref(false);
const deleteactivityDialog = ref(false);
const deleteactivitysDialog = ref(false);
const activity = ref<any>({});
const selectedactivitys = ref();
const isEdit = ref<boolean>(false);
const id = ref(null)
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
function openNew() {
    isEdit.value = false;
    id.value = null;
    activityRef.value.name = '';
    activity.value = {};
    submitted.value = false;
    activityDialog.value = true;
}

function hideDialog() {
    activityRef.value.name = ''
    activityDialog.value = false;
    submitted.value = false;
}

const saveactivity = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: isEdit.value ? 'activity/' + id.value : 'activity',
                method: isEdit.value ? "PATCH" : "POST",
                data: activityRef.value,
            })

            toast.add({ severity: 'success', summary: 'Berhasil', detail: `${isEdit.value ? 'Berhasil mengubah data' : 'Berhasil menambah data'}`, life: 3000 });
            activityRef.value.name = '';
            activityDialog.value = false;
            isEdit.value = false;
            id.value = null;
            getData()
        } else {
            scrolltoError('.text-red-500')
        }
    } catch (error: any) {
        console.log(error.message)
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}

const getData = async () => {
    activitys.value.loading = true;
    try {
        const activityRequest = await doRequest({
            url: 'activity',
            method: "get",
            params: {
                page: Math.floor(activitys.value.first / activitys.value.rows) + 1, // Calculate page number
                limit: activitys.value.rows,
                search: activitys.value.search,
                where: {
                    type: 'DEFAULT'
                }
            }
        })
        activitys.value.value = activityRequest.data.result;
        activitys.value.totalRecords = activityRequest.data.count;
        activitys.value.loading = false;
    } catch (error: any) {
        activitys.value.loading = false;
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}
const onPagination = (event: DataTablePageEvent) => {
    activitys.value.first = event.page * event.rows; // Set first index correctly
    activitys.value.rows = event.rows; // Update the number of rows
    getData()
}

const onSearch = (event: KeyboardEvent) => {
    const target = event.target as any
    if (event.key == "Enter") {
        activitys.value.search = target.value;
        getData()
    }
}

function editactivity(data: any) {
    activityRef.value.name = data.name;
    isEdit.value = true;
    id.value = data.id;
    activityDialog.value = true;
}

function confirmDeleteactivity(prod: any) {
    activity.value = prod;
    deleteactivityDialog.value = true;
}

const deleteactivity = async () => {
    try {
        await doRequest({
            url: 'activity/' + activity.value.id,
            method: "DELETE",
        })
        deleteactivityDialog.value = false;
        activity.value = {};
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil dihapus', life: 3000 });
        getData()
    } catch (error) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteactivitysDialog.value = true;
}

const deleteSelectedactivitys = async () => {
    try {
        await Promise.all(
            selectedactivitys.value.map(async (item: any) => {
                await doRequest({
                    url: 'activity/' + item.id,
                    method: "DELETE",
                })
            })
        )
        deleteactivitysDialog.value = false;
        selectedactivitys.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'activitys Deleted', life: 3000 });
        getData()
    } catch (error) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}



const activityRef = ref({
    name: '',
    type: 'DEFAULT'
})

const { validate, isValid, getError, scrolltoError } = useValidation(activitySchema, activityRef, {
    mode: 'lazy',
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedactivitys || !selectedactivitys.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :lazy="activitys.lazy" v-model:selection="selectedactivitys" :value="activitys.value"
                dataKey="id" :paginator="true" :rows="activitys.rows" :filters="filters" :first="activitys.first"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="activitys.rowsPerPageOptions" :page-link-size="activitys.pageLinkSize"
                :loading="activitys.loading" :total-records="activitys.totalRecords" v-on:page="onPagination"
                currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} aktifitas">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Kelola Aktifitas Pekerja</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" @keyup="onSearch" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="id" header="id" sortable style="min-width: 12rem"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem" header="#">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                            @click="editactivity(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteactivity(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="activityDialog" :style="{ width: '450px' }" header="Aktifitas Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Aktifitas" label="Aktifitas" v-model="activityRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-8" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveactivity" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteactivityDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="activity">Are you sure you want to delete <b>{{ activity.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteactivityDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteactivity" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteactivitysDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="activity">Are you sure you want to delete the selected activitys?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteactivitysDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedactivitys" />
            </template>
        </Dialog>
    </div>
</template>
