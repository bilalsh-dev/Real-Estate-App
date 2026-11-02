"use client";

import type { ComponentProps } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormFieldProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
} & Pick<ComponentProps<"input">, "type" | "placeholder" | "disabled" | "autoComplete">;

export function FormField<TValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  ...inputProps
}: FormFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            {...inputProps}
            id={field.name}
            type={type}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
