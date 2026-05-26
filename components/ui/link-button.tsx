import * as React from 'react';
import Link from 'next/link';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ href, className, variant, size, children, ...props }) => {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  );
};

export default LinkButton;
