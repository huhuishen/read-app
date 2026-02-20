import { ObjectId } from "mongodb";
import { type Schema, SchemaError } from "./core";

export const objectId = (): Schema<ObjectId> => ({
    _def: { kind: "ObjectId" },

    check(v, ctx = {}, path = '') {
        if (!(v instanceof ObjectId)) {
            throw new SchemaError(path, 'ObjectId', v);
        }
        return v;
    }
});

export const date = (): Schema<Date> => ({
    _def: { kind: "Date" },

    check(v, ctx = {}, path = '') {
        if (!(v instanceof Date) || isNaN(v.getTime())) {
            throw new SchemaError(path, 'Date', v);
        }
        return v;
    }
});