# App Specifications

More coming soon.

```typescript
interface Specifications {
    register(specification);
    build(): IocContainer;
}

interface SpecificationBuilder {
    builder(specs: Specifications): IocContainer;
}

// Container objects that contains objects build from `Specifications`
interface IocContainer {
    $actions: object;
}
```
