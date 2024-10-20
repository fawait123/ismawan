<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { userSchema } from '@/schema/index';
import doRequest from '@/helpers/do-request.helper';
import { ResponseMessage } from '@/helpers';
import { IPagination } from '@/interfaces/index'
import { DataTablePageEvent } from 'primevue/datatable';

onMounted(() => {
    getData()
});

const toast = useToast();
const dt = ref();
const users = ref<IPagination<any>>({
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
const userDialog = ref(false);
const deleteuserDialog = ref(false);
const deleteusersDialog = ref(false);
const user = ref<any>({});
const selectedusers = ref();
const isEdit = ref<boolean>(false);
const id = ref(null)
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
function openNew() {
    isEdit.value = false;
    id.value = null;
    userRef.value.username = '';
    userRef.value.email = '';
    userRef.value.password = '';
    user.value = {};
    submitted.value = false;
    userDialog.value = true;
}

function hideDialog() {
    userRef.value.username = '';
    userRef.value.email = '';
    userRef.value.password = '';
    userDialog.value = false;
    submitted.value = false;
}

const saveuser = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: isEdit.value ? 'user/' + id.value : 'user',
                method: isEdit.value ? "PATCH" : "POST",
                data: userRef.value
            })

            toast.add({ severity: 'success', summary: 'Berhasil', detail: `${isEdit.value ? 'Berhasil mengubah data' : 'Berhasil menambah data'}`, life: 3000 });
            userRef.value.username = '';
            userDialog.value = false;
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
    users.value.loading = true;
    try {
        const userRequest = await doRequest({
            url: 'user',
            method: "get",
            params: {
                page: Math.floor(users.value.first / users.value.rows) + 1, // Calculate page number
                limit: users.value.rows,
                search: users.value.search
            }
        })
        users.value.value = userRequest.data.result;
        users.value.totalRecords = userRequest.data.count;
        users.value.loading = false;
    } catch (error: any) {
        users.value.loading = false;
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}
const onPagination = (event: DataTablePageEvent) => {
    users.value.first = event.page * event.rows; // Set first index correctly
    users.value.rows = event.rows; // Update the number of rows
    getData()
}

const onSearch = (event: KeyboardEvent) => {
    const target = event.target as any
    if (event.key == "Enter") {
        users.value.search = target.value;
        getData()
    }
}

function edituser(data: any) {
    userRef.value.username = data.username;
    userRef.value.email = data.email;
    isEdit.value = true;
    id.value = data.id;
    userDialog.value = true;
}

function confirmDeleteuser(prod: any) {
    user.value = prod;
    deleteuserDialog.value = true;
}

const deleteuser = async () => {
    try {
        await doRequest({
            url: 'user/' + user.value.id,
            method: "DELETE",
        })
        deleteuserDialog.value = false;
        user.value = {};
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil dihapus', life: 3000 });
        getData()
    } catch (error: any) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteusersDialog.value = true;
}

const deleteSelectedusers = async () => {
    try {
        await Promise.all(
            selectedusers.value.map(async (item: any) => {
                await doRequest({
                    url: 'user/' + item.id,
                    method: "DELETE",
                })
            })
        )
        deleteusersDialog.value = false;
        selectedusers.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'users Deleted', life: 3000 });
        getData()
    } catch (error: any) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}



const userRef = ref({
    username: '',
    email: '',
    password: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(userSchema, userRef, {
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
                        :disabled="!selectedusers || !selectedusers.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :lazy="users.lazy" v-model:selection="selectedusers" :value="users.value" dataKey="id"
                :paginator="true" :rows="users.rows" :filters="filters" :first="users.first"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="users.rowsPerPageOptions" :page-link-size="users.pageLinkSize"
                :loading="users.loading" :total-records="users.totalRecords" v-on:page="onPagination"
                currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} Pengguna">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Kelola Pengguna</h4>
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
                <Column field="username" header="Username" sortable style="min-width: 16rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem" header="#">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edituser(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteuser(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Pengguna Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Username" label="Username" v-model="userRef.username"
                    :invalid="!!getError('username')" :error-message="getError('username')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Email" label="email" v-model="userRef.email"
                    :invalid="!!getError('email')" :error-message="getError('email')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Password" label="password" v-model="userRef.password"
                    :invalid="!!getError('password')" :error-message="getError('password')" class-name="mb-1" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveuser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteuserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user">Are you sure you want to delete <b>{{ user.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteuserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteuser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteusersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user">Are you sure you want to delete the selected users?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteusersDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedusers" />
            </template>
        </Dialog>
    </div>
</template>
