// mongoose-plugin-model-paginate.ts
import {
    IPaginationResponse,
    IPaginationOptions,
    IColumnSearch
} from '../mongoose-plugin-model-paginate'; 

class PaginationHelper {
    static async advancedFilter(filter: any, filterSchema: string[]) {
        const advancedFilter: any[] = [];

        for (const key in filterSchema) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const element = filter[key];
                const item: any = {};
                item[key] = element;

                advancedFilter.push(item);
            }
        }

        return advancedFilter;
    }

    static async search(search: string, columns: any) {
        if (!search) return [];

        const searchOR: IColumnSearch[] = columns.map((column:any) => {
            const item: IColumnSearch = {};
            item[column] = { $regex: search, $options: "i" }

            return item;
        });

        return searchOR;
    }

    static async filterFind(advancedFilter: any) {
        let filterFind: any = {};

        if (advancedFilter.length > 0) {
            filterFind = { $and: advancedFilter };
        }

        return filterFind;
    }

    static async sort_by(sort_by: string) {
        let sort: any = {};
        const sortSplit = sort_by.split(",");

        for (const iterator of sortSplit) {
            const [key, order] = iterator.split(":");

            sort[key] = (order === "desc") ? -1 : 1;
        }

        return sort;
    }

    static async skip(page: number, page_size: number) {
        let skip = (page - 1) * page_size;

        return skip;
    }
}

class MongooseModelPaginatePlugin {
    apply(schema: any, optionsSchema: any) {
        const { fieldsForFilter = [], fieldsForSearch = [] } = optionsSchema;

        schema.statics.paginate = async function (filter: any, options: IPaginationOptions): Promise<IPaginationResponse> {
            const { sort_by, page_size, page, populate, search } = options;

            const advancedFilter = await PaginationHelper.advancedFilter(filter, fieldsForSearch);
            const searchFilter = await PaginationHelper.search(search, fieldsForFilter);
            const filterFind = await PaginationHelper.filterFind(advancedFilter);

            if (search) {
                if (searchFilter.length > 0) {
                    filterFind.$or = searchFilter;
                }
            }

            const countPromise = this.countDocuments(filterFind).exec();
            const paginationSortBy = await PaginationHelper.sort_by(sort_by);
            const paginationSkip = await PaginationHelper.skip(page, page_size);

            let docsPromise = this.find(filterFind)
                .sort(paginationSortBy)
                .skip(paginationSkip)
                .limit(page_size);

            if (populate) {
                populate.split(",").forEach((populateOption: any) => {
                    docsPromise = docsPromise.populate(
                        populateOption
                            .split(".")
                            .reverse()
                            .reduce((a: any, b: any) => ({ path: b, populate: a }))
                    );
                });
            }

            docsPromise = docsPromise.exec();

            const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
            const totalPages = Math.ceil(totalResults / page_size);
            const result: IPaginationResponse = {
                results: results,
                page: page,
                page_size: page_size,
                num_pages: totalPages,
                count: totalResults,
            };

            return result;
        };
    }
}

export default new MongooseModelPaginatePlugin().apply;