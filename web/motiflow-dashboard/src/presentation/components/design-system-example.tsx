/**
 * Exemplo de uso do Design System
 * 
 * Este arquivo demonstra como usar os componentes do design system
 * no Motiflow Dashboard.
 */

'use client';

import { Button, Input, Text, Info } from '@fabio.caffarello/react-design-system';

export function DesignSystemExample() {
  return (
    <div className="p-6 space-y-4">
      <Text as="h1">Design System Example</Text>
      
      <div className="space-y-2">
        <Text as="h2">Buttons</Text>
        <div className="flex gap-2">
          <Button variant="regular">Regular Button</Button>
          <Button variant="error">Error Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Text as="h2">Input</Text>
        <Input placeholder="Enter text..." />
      </div>

      <div className="space-y-2">
        <Text as="h2">Info Messages</Text>
        <Info variant="info">This is an info message</Info>
        <Info variant="warning">This is a warning message</Info>
        <Info variant="error">This is an error message</Info>
      </div>
    </div>
  );
}
