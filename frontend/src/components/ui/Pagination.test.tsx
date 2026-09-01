import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';
import { renderWithProviders } from '@/test/testUtils';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = renderWithProviders(
      <Pagination page={0} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page for assistive tech', () => {
    renderWithProviders(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);

    // page is 0-based; the third page displays as "3".
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = renderWithProviders(
      <Pagination page={0} totalPages={4} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    rerender(<Pagination page={3} totalPages={4} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('emits the 0-based index of the clicked page', async () => {
    const onPageChange = vi.fn();
    renderWithProviders(<Pagination page={0} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('collapses long ranges with an ellipsis', () => {
    renderWithProviders(<Pagination page={9} totalPages={20} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument();
  });
});
