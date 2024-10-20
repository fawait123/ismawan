<script setup lang="ts">
import { ResponseMessage } from '@/helpers';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { formatNumber } from '@/helpers'

const route = useRoute()
const toast = useToast()
const memberWorkResult = ref<any>({})

onMounted(() => {
    getData()
})

const getData = async () => {
    try {
        const response = await doRequest({
            url: "member-work-result/" + route.params.id,

        })
        memberWorkResult.value = response
    } catch (error: any) {
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}

const totalWide = computed(() => {
    return memberWorkResult?.value?.activities?.reduce((prev: any, next: any) => {
        return prev + next.wide
    }, 0)
})

const total = computed(() => {
    return memberWorkResult?.value?.activities?.reduce((prev: any, next: any) => {
        return prev + next.subTotal
    }, 0)
})

const totalBon = computed(() => {
    return memberWorkResult?.value?.bon?.reduce((prev: any, next: any) => {
        return prev + next.total
    }, 0)
})


</script>


<template>
    <div>
        <Card>
            <template #title>
                <span>Detail Aktifitas Pekerja</span>
            </template>
            <template #subtitle>
                <span>Berikut rincian detail aktifitas pekerja</span>
            </template>
            <template #content>
                <div class="my-8">
                    <h6 class="text-[18px] font-bold">Data Aktifitas</h6>
                    <DataTable :value="memberWorkResult.activities" size="large" :rowHover="true" :lazy="true">
                        <Column field="activity.name" header="Aktifitas"></Column>
                        <Column field="plot" header="Petak"></Column>
                        <Column field="wide" header="Luas"></Column>
                        <Column field="ql" header="QL"></Column>
                        <Column field="price" header="Harga">
                            <template #body="slotProps">
                                <span>{{ slotProps.data.price.toLocaleString('id', 'ID') }}</span>
                            </template>
                        </Column>
                        <Column field="subTotal" header="Sub Total">
                            <template #body="slotProps">
                                <span>{{ slotProps.data.subTotal.toLocaleString('id', 'ID') }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="my-8">
                    <h6 class="text-[18px] font-bold">Data BON</h6>
                    <DataTable :value="memberWorkResult.bon" size="large" :rowHover="true" :lazy="true">
                        <Column field="note" header="Keterangan"></Column>
                        <Column field="total" header="Total">
                            <template #body="slotProps">
                                <span>{{ slotProps.data.total.toLocaleString('id', 'ID') }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

            </template>
            <template #footer>
                <div class="my-8 flex justify-end">
                    <div>
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px] text-red-500">Total BON</span>
                            <span class="font-semibold text-[14px] text-red-500">Rp. {{ totalBon?.toLocaleString('id',
                                'ID')
                                }}</span>
                        </div>
                        <hr>
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px] text-blue-500">Sub Total</span>
                            <span class="font-semibold text-[14px] text-blue-500">Rp. {{ total?.toLocaleString('id')
                                }}</span>
                        </div>
                        <hr>
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px]">Total Bersih</span>
                            <span class="font-semibold text-[14px]">Rp. {{ formatNumber((total - totalBon).toString())
                                }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
