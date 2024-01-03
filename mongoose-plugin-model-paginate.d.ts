// mongoose-plugin-model-paginate.d.ts

import { Document } from 'mongoose';

interface IPaginationResponse {
    results: T[];
    page: number;
    page_size: number;
    num_pages: number;
    count: number;
}

interface IPaginationOptions {
    sort_by: string;
    page_size: number;
    page: number;
    populate: string;
    search: string;
}

interface IColumnSearch {
    [key: string]: {
        $regex: string;
        $options: string;
    };
}

export function paginate(filter: any, options: IPaginationOptions): Promise<IPaginationResponse<Document[]>>;

export function configure(fieldsForFilter: string[], fieldsForSearch: string[]): void;
