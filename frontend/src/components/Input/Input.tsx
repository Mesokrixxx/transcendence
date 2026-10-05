import type { ComponentProps } from 'react';
import { Field, Label, StyledInput} from './Input.styles'

type InputProps = ComponentProps<'input'> & {
    id: string
    label: string
}

function Input({ id, label, ...props }: InputProps){
    return (
        <Field>
            <Label htmlFor={id}>{label}</Label>
            <StyledInput id={id} {...props}></StyledInput>
        </Field>
    )
}

export default Input