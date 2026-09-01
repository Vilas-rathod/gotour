import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';
import { BackLink } from './BackLink';

/** Renders the current path so assertions can read where we ended up. */
function PathProbe() {
  const location = useLocation();
  return <span data-testid="path">{location.pathname}</span>;
}

function renderAt(entries: string[], initialIndex?: number) {
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
      <Routes>
        <Route
          path="/packages"
          element={
            <>
              <span>packages listing</span>
              <PathProbe />
            </>
          }
        />
        <Route
          path="/packages/:slug"
          element={
            <>
              <BackLink fallbackTo="/packages" label="Back to packages" />
              <PathProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BackLink', () => {
  it('renders the supplied label', () => {
    renderAt(['/packages/bali-honeymoon-escape']);
    expect(screen.getByRole('button', { name: /back to packages/i })).toBeInTheDocument();
  });

  it('returns to the previous entry when the user navigated here in-app', async () => {
    // Two entries, currently on the second — there is history to pop.
    renderAt(['/packages', '/packages/bali-honeymoon-escape'], 1);
    expect(screen.getByTestId('path')).toHaveTextContent('/packages/bali-honeymoon-escape');

    await userEvent.click(screen.getByRole('button', { name: /back to packages/i }));

    expect(screen.getByText('packages listing')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/packages');
  });

  it('falls back to the parent route on a cold deep link', async () => {
    // A single entry — the user opened this URL directly, so navigate(-1)
    // would leave the app entirely.
    renderAt(['/packages/bali-honeymoon-escape']);

    await userEvent.click(screen.getByRole('button', { name: /back to packages/i }));

    expect(screen.getByText('packages listing')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/packages');
  });
});
