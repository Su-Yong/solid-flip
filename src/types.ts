type ValueOf<T> = T[keyof T];
export type CSSStyleKeys = ValueOf<{
  [Key in keyof CSSStyleDeclaration]: Key extends string ? CSSStyleDeclaration[Key] extends string ? Key : never : never;
}>;
