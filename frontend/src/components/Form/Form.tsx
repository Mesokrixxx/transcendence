import type { ComponentProps } from 'react'
import { StyledForm } from './Form.styles'

type FormProps = ComponentProps<'form'>

function Form({ children, ...props }: FormProps){
    return(
        <StyledForm {...props}> {children} </StyledForm>
    )
}

export default Form