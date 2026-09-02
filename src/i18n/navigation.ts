import { createNavigation } from 'next-intl/navigation';
import { routing } from './config';

// Locale-aware navigation primitives. ALWAYS import Link / redirect /
// usePathname / useRouter from here — never from 'next/link' or
// 'next/navigation' — so the /nl prefix is applied automatically and the
// default locale stays unprefixed.
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
