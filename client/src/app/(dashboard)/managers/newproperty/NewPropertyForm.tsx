"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  FormField,
  MultiChoiceField,
  PhotoField,
  SelectField,
  SwitchField,
  type FieldOption,
} from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Amenity, Highlight, PropertyType } from "@/lib/constants";
import { toPropertyFormData } from "@/lib/propertyFormData";
import { propertySchema, type PropertyFormData, type PropertyFormInput } from "@/lib/schemas";
import { formatEnumString, withToast } from "@/lib/utils";
import { useCreatePropertyMutation } from "@/state/api";

function optionsOf(values: Record<string, string>): FieldOption[] {
  return Object.values(values).map((value) => ({ value, label: formatEnumString(value) }));
}

const PROPERTY_TYPE_OPTIONS = optionsOf(PropertyType);
const AMENITY_OPTIONS = optionsOf(Amenity);
const HIGHLIGHT_OPTIONS = optionsOf(Highlight);

const DEFAULT_VALUES: PropertyFormInput = {
  name: "",
  description: "",
  pricePerMonth: 1000,
  securityDeposit: 500,
  applicationFee: 100,
  isPetsAllowed: true,
  isParkingIncluded: true,
  photos: [],
  amenities: [],
  highlights: [],
  beds: 1,
  baths: 1,
  squareFeet: 1000,
  propertyType: PropertyType.Apartment,
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <FieldGroup>{children}</FieldGroup>
    </section>
  );
}

export function NewPropertyForm() {
  const router = useRouter();
  const [createProperty] = useCreatePropertyMutation();
  const form = useForm<PropertyFormInput, unknown, PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { control } = form;

  const onSubmit = async (data: PropertyFormData) => {
    try {
      await withToast(createProperty(toPropertyFormData(data)).unwrap(), {
        success: "Property created",
        error: "Could not create the property",
      });
      router.push("/managers/properties");
    } catch {
      return;
    }
  };

  return (
    <div className="rounded-xl bg-white p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-10 p-4">
        <Section title="Basic Information">
          <FormField control={control} name="name" label="Property Name" />
          <FormField control={control} name="description" label="Description" multiline />
        </Section>

        <hr className="border-gray-200" />

        <Section title="Fees">
          <FormField
            control={control}
            name="pricePerMonth"
            label="Price per Month"
            type="number"
            min={0}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="securityDeposit"
              label="Security Deposit"
              type="number"
              min={0}
            />
            <FormField
              control={control}
              name="applicationFee"
              label="Application Fee"
              type="number"
              min={0}
            />
          </div>
        </Section>

        <hr className="border-gray-200" />

        <Section title="Property Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField control={control} name="beds" label="Number of Beds" type="number" min={1} />
            <FormField
              control={control}
              name="baths"
              label="Number of Baths"
              type="number"
              min={0.5}
              step={0.5}
            />
            <FormField
              control={control}
              name="squareFeet"
              label="Square Feet"
              type="number"
              min={1}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SwitchField control={control} name="isPetsAllowed" label="Pets Allowed" />
            <SwitchField control={control} name="isParkingIncluded" label="Parking Included" />
          </div>
          <SelectField
            control={control}
            name="propertyType"
            label="Property Type"
            placeholder="Select a property type"
            options={PROPERTY_TYPE_OPTIONS}
          />
        </Section>

        <hr className="border-gray-200" />

        <Section title="Amenities and Highlights">
          <MultiChoiceField
            control={control}
            name="amenities"
            label="Amenities"
            options={AMENITY_OPTIONS}
          />
          <MultiChoiceField
            control={control}
            name="highlights"
            label="Highlights"
            options={HIGHLIGHT_OPTIONS}
          />
        </Section>

        <hr className="border-gray-200" />

        <Section title="Photos">
          <PhotoField control={control} name="photos" label="Property Photos" />
        </Section>

        <hr className="border-gray-200" />

        <Section title="Address">
          <FormField
            control={control}
            name="address"
            label="Address"
            autoComplete="street-address"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField control={control} name="city" label="City" autoComplete="address-level2" />
            <FormField control={control} name="state" label="State" autoComplete="address-level1" />
            <FormField
              control={control}
              name="postalCode"
              label="Postal Code"
              autoComplete="postal-code"
            />
          </div>
          <FormField control={control} name="country" label="Country" autoComplete="country-name" />
        </Section>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-8 w-full bg-primary-700 text-white"
        >
          Create Property
        </Button>
      </form>
    </div>
  );
}
