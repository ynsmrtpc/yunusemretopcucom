import { Field } from "formik";

interface TextFieldProps {
    name: string;
    label: string;
    required?: boolean;
    type?: string;
}

const TextField: React.FC<TextFieldProps> = ({ name, label, required, type = "text" }) => (
    <div className="space-y-2">
        <label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            {label}
        </label>
        <Field
            id={name}
            name={name}
            type={type}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required={required}
        />
    </div>
);

export default TextField;