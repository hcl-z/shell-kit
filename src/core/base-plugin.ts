import { ShellKit } from "..";

export abstract class BasePlugin {
    constructor(protected ctx: ShellKit) { }
    [key: string]: any
} 