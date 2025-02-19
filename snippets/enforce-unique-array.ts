type EnforceUnique<T extends readonly unknown[]> = T extends readonly [
    infer First extends { id: string },
    ...infer Rest extends readonly { id: string }[],
]
    ? First["id"] extends Rest[number]["id"]
        ? First["id"] | EnforceUnique<Rest>
        : EnforceUnique<Rest>
    : never;

declare function uniqueOnly<const T extends readonly { id: string }[]>(
    a: [EnforceUnique<T>] extends [never]
        ? T
        : {
              [K in keyof T]: T[K]["id"] extends EnforceUnique<T>
                  ? {
                        id: `${T[K]["id"]} is not unique`;
                    }
                  : T[K];
          },
): void;

uniqueOnly([
    {
        id: "1",
    },
    {
        id: "2",
    },
    {
        id: "1",
    },
]);
