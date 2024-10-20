import { ResponseHelper } from "./response.helper";
import { StatementScopeHelper } from "./statement-scope.helper";
interface LooseObject {
    [key: string]: any
}
export const paginate = async <T = any>(model: {
    count: (args: any) => Promise<any>,
    findMany: (args: any) => Promise<any>
}, options?: StatementScopeHelper, include?: T,): Promise<ResponseHelper> => {
    const includeCount: LooseObject = include || {}
    const countOptions = {
        ...options.paginationOptions(),
    }

    if (!countOptions?.where) {
        Object.assign(countOptions, { where: {} })
    }

    if (!includeCount?.where) {
        Object.assign(includeCount, { where: {} })
    }

    countOptions.where = {
        ...countOptions.where,
        ...includeCount.where
    }

    delete countOptions.take
    delete countOptions.skip

    const totalCount = await model.count({
        ...countOptions
    });

    const result = await model.findMany({
        ...options.paginationOptions(),
        ...include
    });

    return new ResponseHelper({
        data: {
            count: totalCount,
            currentPage: (options.paginationOptions().skip / options.paginationOptions().take) + 1,
            limit: +options.paginationOptions().take,
            result,
        }
    });
}