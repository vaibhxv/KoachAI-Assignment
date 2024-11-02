import { ArraySchema as ColyseusArraySchema } from '@colyseus/schema';

declare module '@colyseus/schema' {
    interface ArraySchema<V> extends Array<V> {
        clone(): ArraySchema<V>;
    }
}