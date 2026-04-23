import React from 'react';

const sections = [
  {
    title: 'Product',
    items: [
      { title: 'Virtual Office', href: '/virtual-office' },
      { title: 'Drop-In Meetings', href: '/drop-in-meetings' },
      { title: 'Theater', href: '/theater' },
      { title: 'AInbox', href: '/ainbox' },
      { title: 'Lobby', href: '/lobby' },
      { title: 'Magicast', href: '/magicast' },
      { title: 'Magic Minutes', href: '/magic-minutes' },
      { title: 'On-It', href: '/on-it' },
      { title: 'On-Air', href: '/on-air' },
      { title: 'Mobile', href: '/mobile' },
    ],
  },
  {
    title: 'Company',
    items: [
      { title: 'Our Story', href: '/about/story' },
      { title: 'Our Team', href: '/about/team' },
      { title: 'Careers', href: '/about/careers' },
      { title: 'Pricing', href: '/pricing' },
      { title: 'Download', href: '/download' },
      { title: 'Sign In', href: 'https://ro.am/r/' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Virtual Office Platform', href: '/virtual-office-platform' },
      { title: 'Video Conferencing', href: '/video-conferencing' },
      { title: 'Enterprise Messaging', href: '/enterprise-chat' },
      { title: 'AI Note Taker', href: '/ai-note-taker' },
      { title: 'Meeting Scheduler', href: '/meeting-scheduler' },
      { title: 'Screen Recorder', href: '/screen-recorder' },
      { title: 'Virtual Events', href: '/virtual-events' },
      { title: 'AI Assistant for Work', href: '/ai-assistant' },
      { title: 'Virtual All-Hands', href: '/virtual-all-hands' },
    ],
  },
  {
    title: 'Solutions',
    items: [
      { title: 'AI Startups', href: '/industries/ai' },
      { title: 'Crypto & Web3', href: '/industries/crypto' },
      { title: 'Design Agencies', href: '/industries/design-agency' },
      { title: 'Ecommerce Agencies', href: '/industries/ecommerce-agency' },
      { title: 'Insurance Teams', href: '/industries/insurance' },
      { title: 'Mortgage Teams', href: '/industries/mortgage' },
      { title: 'Remote Teams', href: '/industries/remote-team' },
      { title: 'Executive Assistants', href: '/roles/executive-assistant' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Support', href: '/support' },
      { title: 'Reviews', href: '/reviews' },
      { title: '!deas', href: '/ideas' },
      { title: 'Developer API', href: 'https://developer.ro.am' },
      { title: 'Roam Influencer', href: '/influencer' },
      { title: 'Certified Partner', href: '/partner' },
      { title: 'Partner Directory', href: '/partner/directory' },
      { title: 'Terms of Use', href: '/terms' },
      { title: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    title: 'Follow',
    items: [
      { title: 'X', href: 'https://x.com/roam', external: true },
      { title: 'LinkedIn', href: 'https://linkedin.com/company/roam-hq-inc', external: true },
      { title: 'Instagram', href: 'https://instagram.com/roam', external: true },
      { title: 'Reddit', href: 'https://reddit.com/r/roam', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="sc-footer">
      <div className="sc-footer-inner">
        <nav className="sc-footer-nav">
          {sections.map((section) => (
            <div key={section.title} className="sc-footer-col">
              <h3 className="sc-footer-title">{section.title}</h3>
              <ul className="sc-footer-list">
                {section.items.map((it) => (
                  <li key={it.title}>
                    <a
                      href={it.href}
                      target={it.external ? '_blank' : undefined}
                      rel={it.external ? 'noopener noreferrer' : undefined}
                    >
                      {it.icon && (
                        <span
                          className="sc-footer-social-icon"
                          aria-hidden="true"
                          style={{ WebkitMaskImage: `url(${it.icon})`, maskImage: `url(${it.icon})` }}
                        />
                      )}
                      {it.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
