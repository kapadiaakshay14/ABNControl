import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Input,
  Field,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ABN_DIGIT_LENGTH,
  formatAbn,
  stripToDigits,
  validateAbn,
} from "./abnUtils";

export interface ABNInputProps {
  /** Raw value coming from the bound field (may already be formatted). */
  value: string | null | undefined;
  /** Placeholder shown when the field is empty. */
  placeholder?: string;
  /** Whether the control is read-only (form is in view mode). */
  disabled?: boolean;
  /** Whether to auto-format the value as the user types. */
  autoFormat?: boolean;
  /**
   * Fired whenever the *formatted* value changes.
   * - `formatted` is what the user sees (e.g. "51 824 753 556")
   * - `digits` is the raw 11-digit string (or shorter while typing)
   * - `isValid` is the current validation status
   */
  onChange: (formatted: string, digits: string, isValid: boolean) => void;
  /** Width in px from PCF allocatedWidth (-1 = auto). */
  width?: number;
}

const useStyles = makeStyles({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },
  input: {
    width: "100%",
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    minHeight: "16px",
  },
});

export const ABNInput: React.FC<ABNInputProps> = (props) => {
  const {
    value,
    placeholder,
    disabled = false,
    autoFormat = true,
    onChange,
    width,
  } = props;

  const styles = useStyles();

  // Local "display" state so the caret behaves naturally while typing.
  const [display, setDisplay] = React.useState<string>(() =>
    autoFormat ? formatAbn(value) : stripToDigits(value)
  );
  const [touched, setTouched] = React.useState<boolean>(false);

  // Re-sync when the bound value changes externally (e.g. record reload).
  React.useEffect(() => {
    const next = autoFormat ? formatAbn(value) : stripToDigits(value);
    setDisplay((prev) => (prev === next ? prev : next));
  }, [value, autoFormat]);

  const validation = React.useMemo(() => validateAbn(display), [display]);
  const showError = touched && !validation.isValid;

  const handleChange = React.useCallback(
    (_ev: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
      const raw = data.value ?? "";
      const digits = stripToDigits(raw);
      const next = autoFormat ? formatAbn(digits) : digits;
      setDisplay(next);
      const result = validateAbn(next);
      onChange(next, digits, result.isValid);
    },
    [autoFormat, onChange]
  );

  const handleBlur = React.useCallback(() => {
    setTouched(true);
    // On blur, always re-emit so the host knows the final state.
    const digits = stripToDigits(display);
    const finalDisplay = autoFormat ? formatAbn(digits) : digits;
    if (finalDisplay !== display) {
      setDisplay(finalDisplay);
    }
    const result = validateAbn(finalDisplay);
    onChange(finalDisplay, digits, result.isValid);
  }, [autoFormat, display, onChange]);

  const containerStyle: React.CSSProperties =
    typeof width === "number" && width > 0 ? { width: `${width}px` } : { width: "100%" };

  return (
    <FluentProvider theme={webLightTheme} style={containerStyle}>
      <div className={styles.root}>
        <Field
          validationState={showError ? "error" : "none"}
          validationMessage={showError ? validation.errorMessage : undefined}
        >
          <Input
            className={styles.input}
            value={display}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
            // 11 digits + 3 separator spaces = 14 chars max
            maxLength={ABN_DIGIT_LENGTH + 3}
            inputMode="numeric"
            spellCheck={false}
            aria-label="Australian Business Number"
          />
        </Field>
      </div>
    </FluentProvider>
  );
};

export default ABNInput;
