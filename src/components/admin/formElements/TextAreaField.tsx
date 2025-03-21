import { Field } from "formik";

interface TextAreaFieldProps {
    name: string;
    label: string;
    rows?: number;
    required?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ name, label, rows, required }) => (
    <div className="space-y-2">
        <label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            {label}
        </label>
        <Field
            as="textarea"
            id={name}
            name={name}
            rows={rows}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required={required}
        />
    </div>
);

export default TextAreaField;
