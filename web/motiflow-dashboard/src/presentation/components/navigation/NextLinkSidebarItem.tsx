'use client';

import Link from 'next/link';
import type { SidebarItemProps } from '@fabio.caffarello/react-design-system';
import { SIDEBAR_TOKENS, getNestedIndentClass } from '@fabio.caffarello/react-design-system';

/**
 * NextLinkSidebarItem
 * 
 * Wrapper component that combines Next.js Link with SidebarItem styling.
 * This allows us to use client-side navigation while maintaining design system consistency.
 */
export function NextLinkSidebarItem({
  href,
  isActive = false,
  icon,
  nested = false,
  iconSize = 'md',
  children,
  className = '',
  ...props
}: SidebarItemProps) {
  // Calculate nested level
  const nestedLevel = typeof nested === 'number' ? nested : (nested ? 1 : 0);
  
  // Get indent class based on nested level
  const indentClass = getNestedIndentClass(nestedLevel);

  // Base classes using tokens
  const baseClasses = [
    "flex",
    "items-center",
    indentClass,
    SIDEBAR_TOKENS.spacing.itemPaddingY,
    SIDEBAR_TOKENS.text.sm,
    "font-medium",
    "rounded-md",
    "transition-colors",
    "hover:bg-gray-100",
  ];

  // Active classes using tokens
  const activeClasses = isActive
    ? `${SIDEBAR_TOKENS.colors.active.bg} ${SIDEBAR_TOKENS.colors.active.text} border-r-2 ${SIDEBAR_TOKENS.colors.active.border}`
    : `${SIDEBAR_TOKENS.colors.inactive.text} ${SIDEBAR_TOKENS.colors.inactive.hover}`;

  // Icon size class from tokens
  const iconSizeClass = SIDEBAR_TOKENS.icon[iconSize];

  const classes = [
    ...baseClasses,
    activeClasses,
    className,
  ].filter(Boolean).join(" ");

  return (
    <Link 
      href={href} 
      className={classes}
      aria-current={isActive ? 'page' : undefined}
      role="menuitem"
      {...props}
    >
      {icon && (
        <span 
          className={`${iconSizeClass} ${SIDEBAR_TOKENS.spacing.iconMargin} shrink-0`}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
    </Link>
  );
}
