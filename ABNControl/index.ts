import * as React from "react";
import { ABNInput, ABNInputProps } from "./components/ABNInput";
import { stripToDigits, formatAbn, validateAbn } from "./components/abnUtils";
import { IOutputs } from "./generated/ManifestTypes";

/**
 * ABN Control — virtual (React) PCF component.
 *
 * Behavior:
 *  - Auto-formats input as `XX XXX XXX XXX` while typing.
 *  - Validates that the ABN contains exactly 11 digits.
 *  - On invalid input, shows an inline error and reports the field as invalid
 *    via `notifyOutputChanged` (the bound column receives `null`), which blocks
 *    record save when the field is required.
 *  - Stores the *formatted* string (with spaces) in the bound text column.
 *    Change `getOutputs` if you prefer to store only digits.
 */
export class ABNControl {
  private notifyOutputChanged!: () => void;
  private context!: any;

  /** The value the host should read back from `getOutputs`. */
  private currentValue: string = "";
  /** Whether the current value passes validation. */
  private isValid: boolean = true;

  public init(
    context: any,
    notifyOutputChanged: () => void,
    state: any
  ): void {
    this.context = context;
    this.notifyOutputChanged = notifyOutputChanged;

    // Seed local state from the bound field.
    const initial = context.parameters.abnValue?.raw ?? "";
    const autoFormat = context.parameters.autoFormat?.raw !== false;
    this.currentValue = autoFormat ? formatAbn(initial) : stripToDigits(initial);
    this.isValid = validateAbn(this.currentValue).isValid;
  }

  public updateView(context: any): React.ReactElement {
    this.context = context;

    const bound = context.parameters.abnValue?.raw ?? "";
    const placeholder = context.parameters.placeholderText?.raw ?? undefined;
    const autoFormat = context.parameters.autoFormat?.raw !== false;
    const disabled =
      context.mode.isControlDisabled || context.parameters.abnValue.security?.editable === false;

    // Keep internal state in sync with the bound value when the platform
    // pushes a new value into the control (e.g. record reload).
    if (bound !== this.currentValue) {
      const normalized = autoFormat ? formatAbn(bound) : stripToDigits(bound);
      if (normalized !== this.currentValue) {
        this.currentValue = normalized;
        this.isValid = validateAbn(normalized).isValid;
      }
    }

    const props: ABNInputProps = {
      value: this.currentValue,
      placeholder,
      disabled,
      autoFormat,
      width: context.mode.allocatedWidth,
      onChange: this.handleChange,
    };

    return React.createElement(ABNInput, props);
  }

  /**
   * Receives every keystroke / blur from the React component.
   * Reports the new value & validity to the host.
   */
  private handleChange = (
    formatted: string,
    _digits: string,
    isValid: boolean
  ): void => {
    const changed = formatted !== this.currentValue || isValid !== this.isValid;
    this.currentValue = formatted;
    this.isValid = isValid;
    if (changed) {
      this.notifyOutputChanged();
    }
  };

  /**
   * Returned to the host. When the value is invalid we return `undefined`,
   * which clears the bound column and (combined with `required="true"` in the
   * manifest) prevents the record from saving.
   */
  public getOutputs(): IOutputs {
    if (!this.isValid) {
      return { abnValue: undefined };
    }
    return { abnValue: this.currentValue };
  }

  public destroy(): void {
    // No-op: React cleanup is handled by the framework.
  }
}
