import { EventEmitter } from "events";

interface BasePromptOptions {
    name: string;
    type: string;
    message: string | (() => string | Promise<string>);

    // UI customization
    prefix?: string;                 // символ перед питанням
    suffix?: string;                 // символ після питання
    header?: string;                 // текст перед повідомленням
    footer?: string;                 // текст після повідомлення
    styles?: Record<string, any>;    // внутрішні стилі
    highlight?: (text: string) => string; // функція підсвічування
    format?: (value: any) => string | Promise<string>;
    result?: (value: any) => any | Promise<any>;
    symbols?: {
        ellipsis?: string,
        pointer?: string,
        check?: string,
        cross?: string,
    }

    // Logic
    skip?: boolean | ((state: any) => boolean | Promise<boolean>);
    required?: boolean;
    initial?: any;
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
    onSubmit?: (name: string, value: any, prompt: Prompt) => boolean | Promise<boolean>;
    onCancel?: (name: string, value: any, prompt: Prompt) => boolean | Promise<boolean>;

    // Streams
    stdin?: ReadStream;
    stdout?: WriteStream;

}

export interface Choice {
  name: string
  message?: string
  value?: unknown
  hint?: string
  role?: string
  enabled?: boolean
  disabled?: boolean | string
}

export type ArrayTypes = 'autocomplete'
    | 'editable'
    | 'form'
    | 'multiselect'
    | 'select'
    | 'survey'
    | 'list'
    | 'scale'

export interface SelectPromptOptions extends BasePromptOptions {
  type: ArrayTypes
  choices: (string | Choice)[]
  maxChoices?: number
  multiple?: boolean
  initial?: number
  delay?: number
  separator?: boolean
  sort?: boolean
  linebreak?: boolean
  edgeLength?: number
  align?: 'left' | 'right'
  scroll?: boolean,
  pointer?: string
}

interface BooleanPromptOptions extends BasePromptOptions {
  type: 'confirm'
  initial?: boolean
}

export type StringTypes = 'input' | 'invisible' | 'list' | 'password' | 'text'

export interface StringPromptOptions extends BasePromptOptions {
  type: StringTypes
  initial?: string
  multiline?: boolean
}

export interface NumberPromptOptions extends BasePromptOptions {
  type: 'numeral'
  min?: number
  max?: number
  delay?: number
  float?: boolean
  round?: boolean
  major?: number
  minor?: number
  initial?: number
}

interface SnippetPromptOptions extends BasePromptOptions {
  type: 'snippet'
  newline?: string
  template?: string
}

interface SortPromptOptions extends BasePromptOptions {
  type: 'sort'
  hint?: string
  drag?: boolean
  numbered?: boolean
}

interface ValuePrompt<T = any> extends Prompt {
    value: T;
    state: {
        message?: string;
        [key: string]: any;
    };
}

export type PromptOptions =
  | BasePromptOptions
  | SelectPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions

declare class BasePrompt extends EventEmitter {
    state: Record<string, any>;
    options: PromptOptions;

    constructor(options?: PromptOptions);

    render(): void;
    run(): Promise<any>;
    submit(): void;
    cancel(): void;
    write(str: string): void;
    clear(): void;
    cursorHide(): void;
    cursorShow(): void;
  }

declare class Enquirer<T = object> extends EventEmitter {
  constructor(options?: object, answers?: T);

  /**
   * Register a custom prompt type.
   *
   * @param type
   * @param fn `Prompt` class, or a function that returns a `Prompt` class.
   */
  register(type: string, fn: typeof BasePrompt | (() => typeof BasePrompt)): this;

  /**
   * Register a custom prompt type.
   */
  register(type: { [key: string]: typeof BasePrompt | (() => typeof BasePrompt) }): this;

  /**
   * Prompt function that takes a "question" object or array of question objects,
   * and returns an object with responses from the user.
   *
   * @param questions Options objects for one or more prompts to run.
   */
  prompt(
    questions:
      | PromptOptions
      | ((this: Enquirer) => PromptOptions)
      | (PromptOptions | ((this: Enquirer) => PromptOptions))[]
  ): Promise<T>;

  /**
   * Use an enquirer plugin.
   *
   * @param plugin Plugin function that takes an instance of Enquirer.
   */
  use(plugin: (this: this, enquirer: this) => void): this;
}

export interface KeyPressed {
    name: string,
    ctrl: boolean,
    meta: boolean,
    shift: boolean,
    option: boolean,
    sequence: string,
    raw: string,
}

declare namespace Enquirer {
  function prompt<T = object>(questions: PromptOptions): Promise<T>;

  class Prompt<T = any> extends BasePrompt {
      value?: T;
      v?: T;
      prefix?: string;
      suffix?: string;
      highlight?: (choice: string) => string;
      pointer?: string;
      symbols?: Record<string, string>;

      constructor(options: PromptOptions) {

          this.on("keypress", (ch: string, key: KeyPressed) => this.onKeypress(ch, key));
      };

      up(): void {}
      down(): void {}
      left(): void {}
      right(): void {}

      render(): void {}
      run(): Promise<T> {
          return Promise.resolve(this.value);
      }

      submit(): void {}
      cancel(): void {}
      clear(): void {}
      write(str: string): void {}
      cursorHide(): void {}
      cursorShow(): void {}

      onKeypress(ch: string, key: KeyPressed): void {
          if (key.name === "return") this.submit();
      }
      onSubmit(name: string, value: any): boolean | Promise<boolean> {
          return true;
      }
      onCancel(name: string, value: any): boolean | Promise<boolean> {
          return false;
      }
  }
}

export = Enquirer;