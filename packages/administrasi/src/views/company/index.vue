<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { companySchema } from '@/schema/index';
import doRequest from '@/helpers/do-request.helper';
import { ResponseMessage } from '@/helpers';
import { IPagination } from '@/interfaces/index'
import { DataTablePageEvent } from 'primevue/datatable';

onMounted(() => {
    getData()
});

const toast = useToast();
const dt = ref();
const companys = ref<IPagination<any>>({
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
const companyDialog = ref(false);
const deletecompanyDialog = ref(false);
const deletecompanysDialog = ref(false);
const company = ref<any>({});
const selectedcompanys = ref();
const isEdit = ref<boolean>(false);
const id = ref(null)
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
function openNew() {
    isEdit.value = false;
    id.value = null;
    companyRef.value.name = '';
    companyRef.value.address = '';
    companyRef.value.email = '';
    companyRef.value.phone = '';
    company.value = {};
    submitted.value = false;
    companyDialog.value = true;
}

function hideDialog() {
    companyRef.value.name = '';
    companyRef.value.address = '';
    companyRef.value.email = '';
    companyRef.value.phone = '';
    companyDialog.value = false;
    submitted.value = false;
}

const savecompany = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: isEdit.value ? 'company/' + id.value : 'company',
                method: isEdit.value ? "PATCH" : "POST",
                data: companyRef.value
            })

            toast.add({ severity: 'success', summary: 'Berhasil', detail: `${isEdit.value ? 'Berhasil mengubah data' : 'Berhasil menambah data'}`, life: 3000 });
            companyRef.value.name = '';
            companyDialog.value = false;
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
    companys.value.loading = true;
    try {
        const companyRequest = await doRequest({
            url: 'company',
            method: "get",
            params: {
                page: Math.floor(companys.value.first / companys.value.rows) + 1, // Calculate page number
                limit: companys.value.rows,
                search: companys.value.search
            }
        })
        companys.value.value = companyRequest.data.result;
        companys.value.totalRecords = companyRequest.data.count;
        companys.value.loading = false;
    } catch (error: any) {
        companys.value.loading = false;
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}
const onPagination = (event: DataTablePageEvent) => {
    companys.value.first = event.page * event.rows; // Set first index correctly
    companys.value.rows = event.rows; // Update the number of rows
    getData()
}

const onSearch = (event: KeyboardEvent) => {
    const target = event.target as any
    if (event.key == "Enter") {
        companys.value.search = target.value;
        getData()
    }
}

function editcompany(data: any) {
    companyRef.value.name = data.name;
    companyRef.value.address = data.address;
    companyRef.value.email = data.email;
    companyRef.value.phone = data.phone;
    isEdit.value = true;
    id.value = data.id;
    companyDialog.value = true;
}

function confirmDeletecompany(prod: any) {
    company.value = prod;
    deletecompanyDialog.value = true;
}

const deletecompany = async () => {
    try {
        await doRequest({
            url: 'company/' + company.value.id,
            method: "DELETE",
        })
        deletecompanyDialog.value = false;
        company.value = {};
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
    deletecompanysDialog.value = true;
}

const deleteSelectedcompanys = async () => {
    try {
        await Promise.all(
            selectedcompanys.value.map(async (item: any) => {
                await doRequest({
                    url: 'company/' + item.id,
                    method: "DELETE",
                })
            })
        )
        deletecompanysDialog.value = false;
        selectedcompanys.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'companys Deleted', life: 3000 });
        getData()
    } catch (error) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}



const companyRef = ref({
    name: '',
    address: '',
    email: '',
    phone: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(companySchema, companyRef, {
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
                        :disabled="!selectedcompanys || !selectedcompanys.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :lazy="companys.lazy" v-model:selection="selectedcompanys" :value="companys.value"
                dataKey="id" :paginator="true" :rows="companys.rows" :filters="filters" :first="companys.first"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="companys.rowsPerPageOptions" :page-link-size="companys.pageLinkSize"
                :loading="companys.loading" :total-records="companys.totalRecords" v-on:page="onPagination"
                currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} Perusahaan">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Kelola Perusahaan</h4>
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
                <Column field="name" header="Nama Perusahaan" sortable style="min-width: 16rem"></Column>
                <Column field="address" header="Alamat" sortable style="min-width: 16rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
                <Column field="phone" header="Telepon" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem" header="#">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                            @click="editcompany(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeletecompany(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="companyDialog" :style="{ width: '450px' }" header="Perusahaan Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Perusahaan" label="Perusahaan" v-model="companyRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Alamat" label="Alamat" v-model="companyRef.address"
                    :invalid="!!getError('address')" :error-message="getError('address')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Email" label="Email" v-model="companyRef.email"
                    :invalid="!!getError('email')" :error-message="getError('email')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Telepon" label="Telepon" v-model="companyRef.phone"
                    :invalid="!!getError('phone')" :error-message="getError('phone')" class-name="mb-1" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="savecompany" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletecompanyDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="company">Are you sure you want to delete <b>{{ company.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletecompanyDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deletecompany" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletecompanysDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="company">Are you sure you want to delete the selected companys?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletecompanysDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedcompanys" />
            </template>
        </Dialog>
    </div>
</template>
