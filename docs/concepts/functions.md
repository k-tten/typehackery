---
layout: default
title: "variance in functions"
nav_order: 1
parent: "important concepts"
---

# Variance in functions

When we say "variance", we are trying to describe how one type `F<A>` "varies" with another type `F<B>`.
In other words, variance describes the relationship between `F<A>` and `F<B>` given `A` and `B`.

### Covariance

For our first example, let's imagine that `A` is assignable to `B`, and we'll use this graph below, where an arrow represents assignability.
Then, if `F<A>` is assignable `F<B>`, we call that behaviour **covariance**.
The relationship of `F<A>` and `F<B>` _co-varies in the same direction_ with the relationship of `A` and `B`.

```mermaid
graph LR;
    A-->B;
    C("F<​A>")-->D("F<​B>")
```

In functions, it just so happens that their _return types_ are covariant.

```ts
type F<V> = () => V;

function covariance<B, A extends B>(a: A, b: B, coA: F<A>, coB: F<B>) {
    b = a; // Okay, A is assignable to B
    a = b; // Error, B is NOT assignable to A

    // Covariant types "match" the type parameter's relationship

    coB = coA; // Okay, since F<...> is covariant
    coA = coB; // Error, since F<...> is covariant
}
```

Another example of covariance in TypeScript is in mutable arrays and object properties.
If you have `A extends B`, then `A[] extends B[]` is also true.
However, this is actually **unsound**!
Read [this answer][unsoundarrays] if you are interested in why.

### Contravariance

However, for contravariance, instead of `F<A>` being assignable to `F<B>`, we have `F<B>` being assignable to `F<A>` (`A` is still assignable to `B`).
Essentially, the directions flip, and `F<A>` and `F<B>` _contra-varies in the opposite directions_.

```mermaid
graph LR;
    A-->B;
    D("F<​B>")-->C("F<​A>");
```

So how does this relate to functions?
It's actually a pretty common misunderstanding that functions are covariant, but they're actually only covariant with respect to their return types.
Instead, their parameters are **contravariant**.

But why? Let's look at a simple example. Imagine that we have this code:

```ts
function onlyHello(string: "hello") {
    console.log(string + " world");
}

function passString(fn: (string: string) => void) {
    fn("goodbye");
}

passString(onlyHello);
```

`onlyHello` only wants `"hello"`, a string literal type.
`passString` wants a function that can take any string, and it happens to pass `"goodbye"` as the argument.
If functions were covariant by their return types, `onlyHello` would be given `"goodbye"` in this code snippet!
Notice that `"hello"` is assignable to `string`, but `(string: "hello") => void` is not assignable to `(string: string) => void`.
In fact, it's the other way around: `(string: string) => void` is assignable to `(string: "hello") => void`.

Thankfully, TypeScript catches the error:

```ts
passString(onlyHello);
//         ~~~~~~~~~ Type 'string' is not assignable to type '"hello"'.
```

Now back to the original example with `F`:

```ts
type F<V> = (value: V) => void;

function contravariance<B, A extends B>(a: A, b: B, contraA: F<A>, contraB: F<B>) {
    b = a; // Okay, A is assignable to B
    a = b; // Error, B is NOT assignable to A

    // Contravariant types are the opposite of the type parameter's relationship

    contraB = contraA; // Error, since F<...> is contravariant
    contraA = contraB; // Okay, since F<...> is contravariant
}
```

### Invariance

Now, what happens if we have _both_ a covariant and contravariant type?
It becomes **invariant**, meaning that it no longer varies with respect to the relationship of `A` and `B`.
If `F` is invariant, then `F<A>` is not assignable to `F<B>` and `F<B>` is not assignable to `F<A>`.
This is actually what happens most of the time!

```mermaid
graph LR;
    A-->B;
    C("F<​A>") x--x D("F<​B>");
```

In invariant types, it actually doesn't matter if `A extends B` or if `B extends A`; the resulting types `F<A>` and `F<B>` will never be assignable to each other anyways.
So where could this happen? Well, if you combine the last two examples of covariance and contravariance, you get:

```ts
type F<V> = (value: V) => V;

function invariance<B, A extends B>(a: A, b: B, inA: F<A>, inB: F<B>) {
    b = a; // Okay, A is assignable to B
    a = b; // Error, B is NOT assignable to A

    // Invariant types disregard the relationship between A and B
    // Assignments between F<A> and F<B> *never* work

    inB = inA; // Error, since F<...> is invariant
    inA = inB; // Error, since F<...> is invariant
}
```

### Bivariance

This is like the opposite of invariance.
It is neither covariant or contravariant.
If `A` is assignable to `B`, then `F<A>` is assignable to `F<B>` and `F<B>` is assignable to `F<A>`, and similarly to invariance, it doesn't actually matter if `A extends B` or if `B extends A`.
If a type satisfies this behaviour, it is **bivariant**, meaning it varies with and against the relation between `A` and `B`.

```mermaid
graph LR;
    A-->B;
    C("F<​A>") <--> D("F<​B>");
```

It is possible to demonstrate that only _constant_ types are truly bivariant:

```ts
type F<T> = number;
```

1. `T extends unknown` is true for all `T`.
2. That means `F<T> extends F<unknown>`.
3. And also `F<unknown> extends F<T>`.
4. If `A extends B` and `B extends A`, (in a sound type system) `A` and `B` are the same.
5. `F<T>` and `F<unknown>` are the same for all T.
6. `F<T>` must be a constant.

In a sound type system, this essentially never happens for any non-trivial definition.
Lucky for us, TypeScript is unsound.
There is only one notable case where TypeScript demonstrates bivariance, and that is the parameter type of methods:

```ts
type F<V> = { method(v: V): void };

function bivariance<B, A extends B>(a: A, b: B, biA: F<A>, biB: F<B>) {
    b = a; // Okay, A is assignable to B
    a = b; // Error, B is NOT assignable to A

    // Bivariant types disregard the relationship between A and B
    // Assignments between F<A> and F<B> *always* work

    inB = inA; // Okay, since F<...> is bivariant
    inA = inB; // Okay, since F<...> is bivariant
}
```

### `in`/`out` modifiers

Another way to think about variance in functions is input/output.
You already know that outputs are covariant (return types) and inputs are contravariant (parameter types).
[TypeScript 4.7][variancenotes] introduced optional annotations for variance of generic type parameters: `in`/`out`.

If a type parameter is solely used as an _input_, then annotate it with `in` (contravariance):

```ts
type F<in V> = (value: V) => void;
```

If a type parameter is solely used as an _output_, then annotate it with `out` (covariance):

```ts
type F<out V> = () => V;
```

If a type parameter is used in both contexts, you can annotate it with `in out` (invariance):

```ts
type F<in out V> = (value: V) => V;
```

But why would you bother annotating if TypeScript can figure it out for you?
One of the most important benefits to annotating variance that we will come to know soon is performance.
Explicitly annotating types allows the compiler to do less work comparing and computing variance and to do more work computing the types we want.

Another reason for annotating variance is that it allows the compiler to check our work.
If we use the type parameter incorrectly, say, an `in` (input, contravariant) parameter in an output context, it can tell us that it's not supposed to be there!

```ts
type F<in V> = () => V;
//     ~~~~
//     Type 'F<super-V>' is not assignable to type 'F<sub-V>' as implied by variance annotation.
//         Type 'super-V' is not assignable to type 'sub-V'.
```

If you don't understand, replace `super-V` with `B` and `sub-V` with `A`.
Again, assuming that `A` is assignable to `B`, if `F` is defined as `F<in V>`, `F<B>` should be assignable to `F<A>`.
However, since `V` is being used in an output context, it violates the `in` annotation, and TypeScript emits an error.

### Conclusion

Variance is an important concept to understand as you progress on your mastery of TypeScript.
Many people fumble over the idea of contravariance in functions and get confused as to why there is an error.
My goal here was to explain what and why, and so I'll leave you here with some tips to memorize the direction of variance:

-   Covariance: **co**operate, `F<A>` and `F<B>` mirror `A` and `B`.
-   Contravariance: **contra**dict, `F<A>` and `F<B>` are the opposite of `A` and `B`.
-   Invariance: **in**different, `F<A>` and `F<B>` are stubborn and indifferent to `A` and `B`.
-   Bivariance: **bi**directional, `F<A>` and `F<B>` work both ways regardless of `A` and `B`.

[variancenotes]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#optional-variance-annotations-for-type-parameters
[unsoundarrays]: https://stackoverflow.com/a/60922930/18244921
