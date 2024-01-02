"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class PaginationHelper {
    static advancedFilter(filter, filterSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            const advancedFilter = [];
            for (const key in filterSchema) {
                if (Object.prototype.hasOwnProperty.call(filter, key)) {
                    const element = filter[key];
                    const item = {};
                    item[key] = element;
                    advancedFilter.push(item);
                }
            }
            return advancedFilter;
        });
    }
    static search(search, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!search)
                return [];
            const searchOR = columns.map((column) => {
                const item = {};
                item[column] = { $regex: search, $options: "i" };
                return item;
            });
            return searchOR;
        });
    }
    static filterFind(advancedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            let filterFind = {};
            if (advancedFilter.length > 0) {
                filterFind = { $and: advancedFilter };
            }
            return filterFind;
        });
    }
    static sort_by(sort_by) {
        return __awaiter(this, void 0, void 0, function* () {
            let sort = {};
            const sortSplit = sort_by.split(",");
            for (const iterator of sortSplit) {
                const [key, order] = iterator.split(":");
                sort[key] = (order === "desc") ? -1 : 1;
            }
            return sort;
        });
    }
    static skip(page, page_size) {
        return __awaiter(this, void 0, void 0, function* () {
            let skip = (page - 1) * page_size;
            return skip;
        });
    }
}
class MongooseModelPaginatePlugin {
    apply(schema, optionsSchema) {
        const { filterSchema = [], columnsShema = [] } = optionsSchema;
        schema.statics.paginate = function (filter, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { sort_by, page_size, page, populate, search } = options;
                const advancedFilter = yield PaginationHelper.advancedFilter(filter, filterSchema);
                const searchFilter = yield PaginationHelper.search(search, columnsShema);
                const filterFind = yield PaginationHelper.filterFind(advancedFilter);
                if (search) {
                    if (searchFilter.length > 0) {
                        filterFind.$or = searchFilter;
                    }
                }
                const countPromise = this.countDocuments(filterFind).exec();
                const paginationSortBy = yield PaginationHelper.sort_by(sort_by);
                const paginationSkip = yield PaginationHelper.skip(page, page_size);
                let docsPromise = this.find(filterFind)
                    .sort(paginationSortBy)
                    .skip(paginationSkip)
                    .limit(page_size);
                if (populate) {
                    populate.split(",").forEach((populateOption) => {
                        docsPromise = docsPromise.populate(populateOption
                            .split(".")
                            .reverse()
                            .reduce((a, b) => ({ path: b, populate: a })));
                    });
                }
                docsPromise = docsPromise.exec();
                const [totalResults, results] = yield Promise.all([countPromise, docsPromise]);
                const totalPages = Math.ceil(totalResults / page_size);
                const result = {
                    results: results,
                    page: page,
                    page_size: page_size,
                    num_pages: totalPages,
                    count: totalResults,
                };
                return result;
            });
        };
    }
}
exports.default = new MongooseModelPaginatePlugin();
