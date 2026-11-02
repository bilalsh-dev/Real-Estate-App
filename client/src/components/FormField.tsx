"use client";

import type { ComponentProps } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseFieldProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  className?: string;
};

export type FieldOption = {
  value: string;
  label: string;
};

type FormFieldProps<TValues extends FieldValues> = BaseFieldProps<TValues> & {
  multiline?: boolean;
} & Pick<
    ComponentProps<"input">,
    "type" | "placeholder" | "disabled" | "autoComplete" | "step" | "min"
  >;

export function FormField<TValues extends FieldValues>({
  control,
  name,
  label,
  className,
  type = "text",
  multiline = false,
  ...inputProps
}: FormFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {multiline ? (
            <Textarea
              {...field}
              id={field.name}
              placeholder={inputProps.placeholder}
              disabled={inputProps.disabled}
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              {...inputProps}
              id={field.name}
              type={type}
              aria-invalid={fieldState.invalid}
            />
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function SwitchField<TValues extends FieldValues>({
  control,
  name,
  label,
  className,
}: BaseFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" className={className}>
          <Switch
            id={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
          />
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        </Field>
      )}
    />
  );
}

export function SelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  className,
  options,
  placeholder,
}: BaseFieldProps<TValues> & { options: FieldOption[]; placeholder: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select value={(field.value as string | undefined) ?? ""} onValueChange={field.onChange}>
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function MultiChoiceField<TValues extends FieldValues>({
  control,
  name,
  label,
  className,
  options,
}: BaseFieldProps<TValues> & { options: FieldOption[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = (field.value as string[] | undefined) ?? [];
        const toggle = (value: string) =>
          field.onChange(
            selected.includes(value)
              ? selected.filter((item) => item !== value)
              : [...selected, value],
          );
        return (
          <FieldSet data-invalid={fieldState.invalid} className={className}>
            <FieldLegend variant="label">{label}</FieldLegend>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(option.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm",
                      isSelected
                        ? "border-primary-700 bg-primary-700 text-white"
                        : "border-gray-200",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        );
      }}
    />
  );
}

export function PhotoField<TValues extends FieldValues>({
  control,
  name,
  label,
  className,
}: BaseFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errors = Array.isArray(fieldState.error)
          ? (fieldState.error as ({ message?: string } | undefined)[])
          : [fieldState.error];
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <PhotoUpload
              id={field.name}
              value={(field.value as File[] | undefined) ?? []}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={errors} />}
          </Field>
        );
      }}
    />
  );
}
