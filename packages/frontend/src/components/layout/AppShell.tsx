'use client';

import { AppShell, Burger, Group, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './AppShell.module.css';

const links = [
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/customers', label: 'Customers' },
  { link: '/products', label: 'Products' },
  { link: '/orders', label: 'Orders' },
];

export function MainAppShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text className={classes.logo}>TRENDIES</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <nav>
          {links.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link key={item.link} href={item.link} passHref>
                <UnstyledButton
                  className={`${classes.link} ${isActive ? classes.linkActive : ''}`}
                  component="span"
                >
                  {item.label}
                </UnstyledButton>
              </Link>
            );
          })}
        </nav>
        <div className={classes.footer}>
          <Text size="xs">© 2025 Trendies Luxury Brands</Text>
        </div>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}