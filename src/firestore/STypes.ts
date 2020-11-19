import { Type } from '../lib/type'
import { FTypes } from '../types/FTypes'
import { fadmin, fweb } from '../types/_firestore'
import { GetDeep } from '../types/_object'
import {
  $adapter,
  $allow,
  $collectionGroups,
  $docLabel,
  $functions,
  $schema,
} from './constants/symbols'
import { ParseCollectionPath } from './_types'

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

export declare namespace STypeUtils {
  export type GetDocT<
    D extends FTypes.FirestoreApp | FTypes.DocumentRef<unknown>
  > = D extends FTypes.DocumentRef<infer T> ? T : never

  export type GetCollectionT<
    C extends FTypes.CollectionRef<unknown>
  > = C extends FTypes.CollectionRef<infer T> ? T : never

  export type GetSchemaU<
    C extends STypes.CollectionOptions.Meta,
    CS = C[typeof $schema]
  > = CS extends STypes.DocumentSchema<any> ? CS['__U__'] : never

  export type OmitLast<T extends any[]> = T extends [
    ...(infer U extends any[] ? infer U : never),
    unknown,
  ]
    ? U
    : never

  export type Parent<F extends FTypes.FirestoreApp = FTypes.FirestoreApp> =
    | F
    | FTypes.DocumentRef<STypes.HasLoc<string[]>, F>

  export type GetFFromParent<
    P extends Parent<any>
  > = P extends FTypes.FirestoreApp
    ? P
    : P extends fweb.DocumentReference<any>
    ? fweb.Firestore
    : fadmin.Firestore

  export type GetFFromDocumentRef<
    D extends FTypes.DocumentRef<any>
  > = D extends fweb.DocumentReference ? fweb.Firestore : fadmin.Firestore

  export type GetFFromCollectionRef<
    D extends FTypes.CollectionRef<any>
  > = D extends fweb.CollectionReference ? fweb.Firestore : fadmin.Firestore

  export type EnsureOptions<_C> = _C extends STypes.CollectionOptions.Meta
    ? _C
    : never

  export type GetL<P extends Parent, N> = [...GetPL<P>, N]
  export type GetPL<P extends Parent> = P extends FTypes.FirestoreApp
    ? []
    : GetDocT<P>['__loc__']

  export type GetSL<_C> = EnsureOptions<
    _C
  >[typeof $adapter] extends STypes.CollectionAdapter<any, any>
    ? EnsureOptions<_C>[typeof $adapter]['__SL__']
    : {}

  export type GetT<_C> = EnsureOptions<_C>[typeof $schema]['__T__']

  export type SchemaUWithLoc<
    C extends STypes.CollectionOptions.Meta,
    L extends string[]
  > = GetSchemaU<C> & STypes.HasLoc<L> & STypes.HasT<C[typeof $schema]['__T__']>

  export type SchemaUWithLocAndMeta<
    F extends FTypes.FirestoreApp,
    _C,
    L extends string[]
  > = STypes.DocumentMeta<F> & SchemaUWithLoc<EnsureOptions<_C>, L>
}

export declare namespace STypes {
  export type ConditionExp = string | boolean

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

  export type Decoder<T, U> = (
    snapshot: FTypes.QueryDocumentSnap<T>,
    options: FTypes.SnapshotOptions,
  ) => U

  export type DocumentSchema<T, U = T> = {
    __T__: T
    __U__: U
    schema: string
    decoder: Decoder<T, U> | undefined
  }

  export namespace CollectionOptions {
    export type Meta = {
      [$docLabel]: string
      [$schema]: DocumentSchema<any>
      [$adapter]: STypes.CollectionAdapter<any, any> | null
      // [$collectionGroup]?: boolean
      [$allow]: AllowOptions
    }
    export type Children = {
      [K in string]: Meta & Children
    }

    export type All = Meta & Children
  }

  export type AllowOptions = {
    [K in keyof (typeof allowOptions.read &
      typeof allowOptions.write)]+?: ConditionExp
  }

  export type Select<
    F extends FTypes.FirestoreApp,
    L extends string[],
    // P extends Utils.Parent,
    // N extends Extract<keyof PC, string>,
    // PC,
    _C
  > = (
    q: Selectors<STypeUtils.GetT<_C>, L, STypeUtils.GetSL<_C>, F>,
  ) => FTypes.Query<STypeUtils.SchemaUWithLocAndMeta<F, _C, L>, F>

  export type Selectors<
    T,
    L extends string[] | null,
    SL,
    F extends FTypes.FirestoreApp
  > = {
    [K in keyof SL]: SL[K] extends (...args: infer A) => FTypes.Query<infer U>
      ? (
          ...args: A
        ) => FTypes.Query<
          U & STypes.DocumentMeta<F> & HasLoc<NonNullable<L>> & HasT<T>,
          F
        >
      : SL[K]
  }

  export type CollectionAdapter<T, SL extends Selectors<any, any, any, any>> = {
    selectors: (q: FTypes.Query<T>) => SL
  } & {
    __SL__: SL
  }

  export type HasLoc<L extends string[]> = {
    __loc__: L
  }
  export type HasT<T> = {
    __T__: T
  }

  export type UAt<
    S extends STypes.RootOptions.All,
    F extends FTypes.FirestoreApp,
    CP extends string,
    L extends string[] = ParseCollectionPath<CP>,
    _C = GetDeep<S, L>
  > = STypeUtils.EnsureOptions<_C>[typeof $schema]['__U__'] &
    DocumentMeta<F> &
    HasLoc<L> &
    HasT<STypeUtils.EnsureOptions<_C>[typeof $schema]['__T__']>

  type DocFieldToWrite<
    T,
    F extends FTypes.FirestoreApp = FTypes.FirestoreApp
  > = T extends FTypes.Timestamp ? FTypes.Timestamp<F> : T

  export type DocumentMeta<
    F extends FTypes.FirestoreApp = FTypes.FirestoreApp
  > = {
    _createdAt: FTypes.Timestamp<F>
    _updatedAt: FTypes.Timestamp<F>
  }

  type WithoutLoc<T> = T extends HasLoc<any> ? Type.Except<T, '__loc__'> : T
  type WithoutMeta<T> = T extends DocumentMeta
    ? Type.Except<T, keyof DocumentMeta>
    : T

  export type DocDataToWrite<
    T,
    F extends FTypes.FirestoreApp = FTypes.FirestoreApp,
    _T = WithoutMeta<WithoutLoc<T>>
  > = {
    [K in keyof _T]: DocFieldToWrite<_T[K], F> | FTypes.FieldValue<F>
  }
}
