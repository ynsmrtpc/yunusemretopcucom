import { Field, FieldProps } from "formik";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
    name: string;
    label: string;
    options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ name, label, options }) => (
    <Field name={name}>
        {({ field, form }: FieldProps) => (
            <Select

                value={field.value}
                onValueChange={(value) => form.setFieldValue(name, value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{label}</SelectLabel>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        )}
    </Field >
);

export default SelectField;
