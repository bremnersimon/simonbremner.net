import { cn } from '@/lib/utils'
import React from 'react'

type ContainerProps = {
    children: React.ReactNode,
    className?: string
}

export const Container = ({ children, className }: ContainerProps) => {
    return (
        <div className={cn("container mx-auto", className)}>
            {children}
        </div>
    )
}