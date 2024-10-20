<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { employeeSchema } from '@/schema/index';
import doRequest from '@/helpers/do-request.helper';
import { ResponseMessage } from '@/helpers';
import { IPagination } from '@/interfaces/index'
import { DataTablePageEvent } from 'primevue/datatable';
import moment from 'moment'
import { useRouter } from 'vue-router';

const router = useRouter()

onMounted(() => {
    getData()
});

const toast = useToast();
const dt = ref();
const employees = ref<IPagination<any>>({
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
const employeeDialog = ref(false);
const deleteemployeeDialog = ref(false);
const deleteemployeesDialog = ref(false);
const employee = ref<any>({});
const selectedemployees = ref();
const isEdit = ref<boolean>(false);
const id = ref(null)
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
function openNew() {
    isEdit.value = false;
    id.value = null;
    employeeRef.value.name = '';
    employee.value = {};
    submitted.value = false;
    employeeDialog.value = true;
}

function hideDialog() {
    employeeRef.value.name = ''
    employeeDialog.value = false;
    submitted.value = false;
}

const saveemployee = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: isEdit.value ? 'employee/' + id.value : 'employee',
                method: isEdit.value ? "PATCH" : "POST",
                data: employeeRef.value
            })

            toast.add({ severity: 'success', summary: 'Berhasil', detail: `${isEdit.value ? 'Berhasil mengubah data' : 'Berhasil menambah data'}`, life: 3000 });
            employeeRef.value.name = '';
            employeeDialog.value = false;
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
    employees.value.loading = true;
    try {
        const employeeRequest = await doRequest({
            url: '/member-work-result',
            method: "get",
            params: {
                page: Math.floor(employees.value.first / employees.value.rows) + 1, // Calculate page number
                limit: employees.value.rows,
                search: employees.value.search
            }
        })
        employees.value.value = employeeRequest.data.result;
        employees.value.totalRecords = employeeRequest.data.count;
        employees.value.loading = false;
    } catch (error: any) {
        employees.value.loading = false;
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}
const onPagination = (event: DataTablePageEvent) => {
    employees.value.first = event.page * event.rows; // Set first index correctly
    employees.value.rows = event.rows; // Update the number of rows
    getData()
}

const onSearch = (event: KeyboardEvent) => {
    const target = event.target as any
    if (event.key == "Enter") {
        employees.value.search = target.value;
        getData()
    }
}

function editemployee(data: any) {
    employeeRef.value.name = data.name;
    isEdit.value = true;
    id.value = data.id;
    employeeDialog.value = true;
}

function confirmDeleteemployee(prod: any) {
    employee.value = prod;
    deleteemployeeDialog.value = true;
}

const deleteemployee = async () => {
    try {
        await doRequest({
            url: 'employee/' + employee.value.id,
            method: "DELETE",
        })
        deleteemployeeDialog.value = false;
        employee.value = {};
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
    deleteemployeesDialog.value = true;
}

const deleteSelectedemployees = async () => {
    try {
        await Promise.all(
            selectedemployees.value.map(async (item: any) => {
                await doRequest({
                    url: 'employee/' + item.id,
                    method: "DELETE",
                })
            })
        )
        deleteemployeesDialog.value = false;
        selectedemployees.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'employees Deleted', life: 3000 });
        getData()
    } catch (error) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}

const employeeRef = ref({
    name: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(employeeSchema, employeeRef, {
    mode: 'lazy',
});


const handleClickName = (data: any) => {
    router.push({
        name: 'member-work-result-detail',
        params: {
            id: data.id
        }
    })
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedemployees || !selectedemployees.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :lazy="employees.lazy" v-model:selection="selectedemployees" :value="employees.value"
                dataKey="id" :paginator="true" :rows="employees.rows" :filters="filters" :first="employees.first"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="employees.rowsPerPageOptions" :page-link-size="employees.pageLinkSize"
                :loading="employees.loading" :total-records="employees.totalRecords" v-on:page="onPagination"
                currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} pekerja">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Kelola Pekerja</h4>
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
                <Column field="employee.name" header="Nama" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        <div>
                            <span class="text-blue-500 cursor-pointer font-bold"
                                @click="handleClickName(slotProps.data)">{{
                                    slotProps.data.employee.name
                                }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="date" header="Periode" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        <span>{{ moment(slotProps.data.date).format('DD MMMM YYYY') }}</span>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="employeeDialog" :style="{ width: '450px' }" header="Pekerja Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Pekerja" label="Pekerja" v-model="employeeRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-8" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveemployee" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteemployeeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="employee">Are you sure you want to delete <b>{{ employee.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteemployeeDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteemployee" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteemployeesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="employee">Are you sure you want to delete the selected employees?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteemployeesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedemployees" />
            </template>
        </Dialog>
    </div>
</template>
