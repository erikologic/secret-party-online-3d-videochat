export const $ = <T extends HTMLElement>(selector: string) =>
    document.querySelector(selector)! as T;
