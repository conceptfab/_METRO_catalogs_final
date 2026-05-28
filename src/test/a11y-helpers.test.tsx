import { createElement } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from './a11y-helpers';

describe('a11y-helpers', () => {
  it('passes for a button with accessible name', async () => {
    const { container } = render(
      <button aria-label="Save changes">Save</button>,
    );
    await expectNoA11yViolations(container);
  });

  it('fails for an image without alt text', async () => {
    // Intentionally render an <img> without an alt attribute via
    // createElement to bypass the JSX-level lint while still exercising
    // the axe missing-alt failure path.
    const { container } = render(createElement('img', { src: '/x.webp' }));
    await expect(expectNoA11yViolations(container)).rejects.toThrow();
  });
});
