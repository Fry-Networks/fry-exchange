import * as React from 'react';
import Link from 'next/link';
import { FryNetworksLogo } from '@/components/brand/Logo';
import { Twitter, Github, MessageCircle } from 'lucide-react';

const footerLinks = {
  Products: [
    { label: 'Spot Trading', href: '/trade' },
    { label: 'Swap', href: '/swap' },
    { label: 'Liquidity Pools', href: '/earn' },
    { label: 'API', href: '/api-docs' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-docs' },
    { label: 'Fee Schedule', href: '/fees' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Risk Disclosure', href: '/risk' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/fryexchange', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/fry-exchange', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://discord.gg/fryexchange', label: 'Discord' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <FryNetworksLogo size="lg" className="h-12" />
            <p className="mt-4 text-sm text-muted-foreground">
              The next generation cryptocurrency exchange. Trade with confidence.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fry Networks. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Powered by</span>
              <span className="font-semibold text-fry-red-500">Fry Networks</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
