import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NavBar from './NavBar';

const mockUsePathname = vi.fn();
const mockUseTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NavBar', () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUseTheme.mockReset();
    mockSetTheme.mockReset();

    mockUsePathname.mockReturnValue('/');
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    });
  });

  it('renders the brand link and all navigation links', () => {
    render(<NavBar />);

    expect(
      screen.getByRole('link', {
        name: /f1 tracker/i,
      }),
    ).toHaveAttribute('href', '/');

    expect(screen.getByRole('link', { name: 'Drivers' })).toHaveAttribute(
      'href',
      '/drivers',
    );
    expect(screen.getByRole('link', { name: 'Constructors' })).toHaveAttribute(
      'href',
      '/constructors',
    );
    expect(screen.getByRole('link', { name: 'Races' })).toHaveAttribute(
      'href',
      '/races',
    );
    expect(screen.getByRole('link', { name: 'Championships' })).toHaveAttribute(
      'href',
      '/championships',
    );
  });

  it('marks a link as active when pathname matches exactly', () => {
    mockUsePathname.mockReturnValue('/constructors');

    render(<NavBar />);

    const activeLink = screen.getByRole('link', { name: 'Constructors' });
    const inactiveLink = screen.getByRole('link', { name: 'Drivers' });

    expect(activeLink).toHaveStyle({
      color: 'var(--f1-red)',
    });
    expect(activeLink).toHaveClass('text-foreground');

    expect(inactiveLink).toHaveClass('text-muted');
    expect(inactiveLink).not.toHaveStyle({
      borderBottom: '2px solid var(--f1-red)',
    });
  });

  it('marks a link as active for nested routes', () => {
    mockUsePathname.mockReturnValue('/drivers/44');

    render(<NavBar />);

    const activeLink = screen.getByRole('link', { name: 'Drivers' });
    const inactiveLink = screen.getByRole('link', { name: 'Races' });

    expect(activeLink).toHaveStyle({
      color: 'var(--f1-red)',
    });
    expect(activeLink).toHaveClass('text-foreground');
    expect(inactiveLink).toHaveClass('text-muted');
  });

  it('keeps the settings menu open after changing the theme', async () => {
    const user = userEvent.setup();

    render(<NavBar />);

    const menuTrigger = screen.getByRole('button', {
      name: /open settings menu/i,
    });
    await user.click(menuTrigger);

    expect(
      screen.getByRole('dialog', { name: /theme settings/i }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: /dark mode/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(
      screen.getByRole('dialog', { name: /theme settings/i }),
    ).toBeVisible();
  });

  it('closes the settings menu when Escape is pressed', async () => {
    const user = userEvent.setup();

    render(<NavBar />);

    await user.click(
      screen.getByRole('button', {
        name: /open settings menu/i,
      }),
    );

    expect(
      screen.getByRole('dialog', { name: /theme settings/i }),
    ).toBeVisible();

    expect(screen.getByRole('button', { name: /light mode/i })).toHaveAttribute(
      'title',
      'Light',
    );
    expect(screen.getByRole('button', { name: /dark mode/i })).toHaveAttribute(
      'title',
      'Dark',
    );
    expect(
      screen.getByRole('button', { name: /system mode/i }),
    ).toHaveAttribute('title', 'System');

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('dialog', { name: /theme settings/i }),
    ).not.toBeInTheDocument();
  });
});
