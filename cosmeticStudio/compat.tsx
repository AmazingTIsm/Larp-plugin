import { Button as NativeButton, type ButtonProps } from "@components/Button";
import { Text as NativeText, type TextSize, type TextWeight } from "@components/Text";
import type { HTMLAttributes } from "react";

export function Button({size,...props}: Omit<ButtonProps,"size"> & {size?:ButtonProps["size"]|"tiny"}) {
    return <NativeButton {...props} size={size==="tiny"?"xs":size}/>;
}
export function Text({variant="text-sm/normal",...props}:HTMLAttributes<HTMLDivElement> & {variant?:string}) {
    const [size,weight]=variant.replace("text-","").split("/");
    return <NativeText {...props} size={size as TextSize} weight={weight as TextWeight}/>;
}
export const Forms={FormText:({children,...props}:HTMLAttributes<HTMLDivElement>)=><NativeText {...props} size="sm">{children}</NativeText>};
