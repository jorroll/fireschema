import {
  $adapter,
  $allow,
  $collectionGroups,
  $docLabel,
  $functions,
  $schema,
} from '../constants/symbols'
import { Type } from '../lib/type'
import { FTypes } from './FTypes'

export const allowOptions = {
  read: {
    read: null,
    get: null,
    list: null,
  },
  write: {
    write: null,
    create: null,
    update: null,
    delete: null,
  },
}

export declare namespace STypes {
  export type ConditionExp = string | true
  // type DataTypes =
  //   | 'string'
  //   | 'int'
  //   | 'float'
  //   | 'bool'
  //   | 'null'
  //   | 'timestamp'
  //   | 'list'
  //   | 'map';

  export type DataSchemaOptionsWithType<T> = { __T__: T } & DataSchemaOptions<T>

  export type DataSchemaOptions<T> = {
    [K in keyof T]: T[K] extends null
      ? 'null'
      : T[K] extends string
      ? 'string'
      : T[K] extends string | null
      ? 'string | null'
      : T[K] extends number
      ? 'int' | 'float'
      : T[K] extends number | null
      ? 'int' | 'float | null'
      : T[K] extends boolean
      ? 'bool'
      : T[K] extends boolean | null
      ? 'bool | null'
      : T[K] extends FTypes.Timestamp
      ? 'timestamp'
      : T[K] extends FTypes.Timestamp | null
      ? 'timestamp | null'
      : T[K] extends any[]
      ? 'list'
      : T[K] extends any[] | null
      ? 'list | null'
      : T[K] extends {}
      ? 'map'
      : T[K] extends {} | null
      ? 'map | null'
      : never
  }

  export type FunctionsOptions = {
    [key: string]: string
  }

  export namespace RootOptions {
    export type Meta = {
      [$functions]: FunctionsOptions
      [$collectionGroups]: CollectionOptions.Children
    }
    export type Children = {
      [K in string]: CollectionOptions.All
    }

    export type All = Meta & Children
  }

  export namespace CollectionOptions {
    export type Meta = {
      [$schema]:
        | DataSchemaOptionsWithType<unknown>
        | DataSchemaOptionsWithType<unknown>[]
      [$adapter]: Adapter<any, any, any>
      [$docLabel]: string
      // [$collectionGroup]?: boolean
      [$allow]: AllowOptions
    }
    export type Children = {
      [K in string]: Meta & Children
    }

    export type All = Meta & Children
  }

  export type AllowOptions = {
    [K in keyof (typeof allowOptions.read & typeof allowOptions.write)]+?:
      | string
      | true
  }

  // export type CollectionInterface<T> = null

  export type Selectors<SL, F extends FTypes.FirestoreApp> = {
    [K in keyof SL]: SL[K] extends (...args: infer A) => FTypes.Query<infer U>
      ? (...args: A) => FTypes.Query<U, F>
      : SL[K]
  }

  export type Adapter<T, SL, F extends FTypes.FirestoreApp> = ((
    q: FTypes.Query<T>,
  ) => Adapted<SL, F>) & {
    __SL__: SL
  }

  export type Adapted<SL, F extends FTypes.FirestoreApp> = {
    select: Selectors<SL, F>
  }

  export type DocumentSchemaLoc<L extends string[]> = {
    __loc__: L
  }

  type DocFieldToWrite<
    T,
    F extends FTypes.FirestoreApp = FTypes.FirestoreApp
  > = T extends FTypes.Timestamp ? FTypes.Timestamp<F> : T

  type WithoutLoc<T> = T extends DocumentSchemaLoc<any>
    ? Type.Except<T, '__loc__'>
    : T

  export type DocDataToWrite<
    T,
    F extends FTypes.FirestoreApp = FTypes.FirestoreApp,
    _T = WithoutLoc<T>
  > = {
    [K in keyof _T]: DocFieldToWrite<_T[K], F> | FTypes.FieldValue<F>
  }
}
