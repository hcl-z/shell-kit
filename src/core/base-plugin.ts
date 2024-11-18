import { ShellKit } from "..";
import { ExtendPromptObject } from "../mixin/prompt";

export abstract class BasePlugin {
    constructor(protected ctx: ShellKit) { }
    [key: string]: any
}


