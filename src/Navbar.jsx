import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";


const productsMenu = [
  {
    heading: "Virtual Office Platform",
    items: [
      { title: "Virtual Office", description: "Company Visualization", href: "#/feature/virtual-office" },
      { title: "Drop-In Meetings", description: "Virtual Meeting Rooms", href: "#/feature/drop-in-meetings" },
      { title: "Theater", description: "All-Hands Presentations", href: "#/feature/theater" },
      { title: "AInbox", description: "Enterprise Messaging", href: "#/feature/ainbox" },
      { title: "Lobby", description: "Meeting Scheduler", href: "#/feature/lobby" },
      { title: "Magicast", description: "Integrated AI Screen Recorder", href: "#/feature/magicast" },
      { title: "Magic Minutes", description: "AI Meeting Summarization", href: "#/feature/magic-minutes" },
      { title: "On-It", description: "Your AI Assistant", href: "#/feature/on-it" },
      { title: "On-Air", description: "Immersive Events", href: "#/feature/on-air" },
      { title: "Mobile", description: "Roam While You Roam", href: "#/feature/mobile" },
    ],
  },
];

const slideMedia = [
  { src: "https://roamstatic.com/website/top-hero-map-3@2x-OMTNGG7K.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-map-2@2x-LB2YURUK.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-theater-1@2x-WHJDYGTK.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-magic-minutes-1@2x-QB3OS4XB.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-lobby-1@2x-7Y3RG7PC.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-magicast-1@2x-HUTVH6T5.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-magic-minutes-1@2x-QB3OS4XB.png", type: "image" },
  { src: "https://roamstatic.com/website/top-hero-on-it-1@2x-ZHJSAEHN.mp4", type: "video" },
  { src: "https://roamstatic.com/website/top-hero-on-air-1@2x-WQWNYBSP.mp4", type: "video" },
  { src: "https://roamstatic.com/website/top-hero-mobile-1@2x-B4W6NMSU.png", type: "image" },
];

const resourcesMenu = [
  {
    heading: "Solutions",
    items: [
      { title: "Roam vs Zoom", description: "", href: "/solutions/vszoom" },
      { title: "Roam vs Slack", description: "", href: "/solutions/vsslack" },
      { title: "Roam vs Teams", description: "", href: "/solutions/vsteams" },
      { title: "Roam vs Meet", description: "", href: "/solutions/vsmeet" },
      { title: "Roam vs Discord", description: "", href: "/solutions/vsdiscord" },
      { title: "Roam vs Webex", description: "", href: "/solutions/vswebex" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { title: "Platform Guide", description: "", href: "/virtual-office-platform-guide" },
      { title: "Support", description: "", href: "/support" },
      { title: "Contact Us", description: "", href: "/support/contact-us" },
      { title: "Download", description: "", href: "/download" },
    ],
  },
  {
    heading: "Features",
    items: [
      { title: "Google Calendar Sync", description: "", href: "/features/google-calendar-sync" },
      { title: "Google Meetings", description: "", href: "/features/google-meetings" },
      { title: "Outlook Meetings", description: "", href: "/features/outlook-meetings" },
    ],
  },
];

const companyMenu = [
  {
    heading: "Company",
    items: [
      { title: "Roam Makes Remote Work", description: "", href: "/about-us" },
      { title: "Our Team", description: "", href: "/about-us#team" },
      { title: "Careers", description: "", href: "/careers" },
    ],
  },
  {
    heading: "Legal & Support",
    items: [
      { title: "Support", description: "", href: "/support" },
      { title: "Terms of Use", description: "", href: "/terms" },
      { title: "Privacy Policy", description: "", href: "/privacy" },
    ],
  },
];

const navItems = [
  { label: "Products", href: "#", menu: productsMenu },
  { label: "Resources", href: "#", menu: resourcesMenu },
  { label: "Company", href: "#", menu: companyMenu },
  { label: "Pricing", href: "/pricing" },
];

const existingMembersMenu = [
  {
    heading: "Existing Members",
    items: [
      { title: "Download", description: "", href: "/download" },
      { title: "Sign In", description: "", href: "/sign-in" },
    ],
  },
];

const allMenuItems = [
  ...navItems,
  { label: "Existing Members", href: "#", menu: existingMembersMenu },
];

function MegaMenu({ columns, align = "left", cascade = "none", spacious = false, onItemClick }) {
  const isSingleColumn = columns.length === 1;
  const cascadeStyle = (index) => {
    if (cascade === "in") return {
      opacity: 0,
      animation: 'menu-cascade-in 250ms ease-out forwards',
      animationDelay: `${150 + index * 50}ms`,
    };
    if (cascade === "out") return {
      animation: 'menu-cascade-out 120ms ease-in forwards',
      animationDelay: `${index * 15}ms`,
    };
    return undefined;
  };
  const itemPadding = spacious ? "py-2.5 px-5" : "py-1 px-3";
  const headingPadding = spacious ? "px-5" : "px-3";
  const itemGap = spacious ? "gap-2.5" : "gap-1";

  if (isSingleColumn) {
    const items = columns[0].items;

    // Small lists: single vertical column (like Existing Members)
    if (items.length <= 4) {
      const isRight = align === "right";
      return (
        <div className={`flex px-3 py-8 ${isRight ? "justify-end" : ""}`}>
          <div className={isRight ? "text-right" : ""}>
            <h3 className={`mb-2 text-xs text-white/60 ${headingPadding}`} style={cascadeStyle(0)}>
              {columns[0].heading}
            </h3>
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li key={item.title} style={cascadeStyle(i + 1)}>
                  <a href={item.href} onClick={() => onItemClick && onItemClick()} className={`group/link block py-1.5 px-5`}>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium text-white transition-colors group-hover/link:text-white/70 ${isRight ? "flex-row-reverse" : ""}`}>
                      {item.title}
                      {isRight ? (
                        <svg className="inline-block w-2.5 h-2.5 opacity-0 translate-x-1 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0 text-white/50 -scale-x-100" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg className="inline-block w-2.5 h-2.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0 text-white/50" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // Larger lists: split into 3 columns (Products)
    const colSize = Math.ceil(items.length / 3);
    const col1 = items.slice(0, colSize);
    const col2 = items.slice(colSize, colSize * 2);
    const col3 = items.slice(colSize * 2);

    return (
      <div className="px-3 py-8">
        <h3 className={`mb-4 text-xs font-bold uppercase tracking-[0.5px] text-white/60 ${headingPadding}`} style={{ fontFamily: "var(--font-possibility), sans-serif", ...cascadeStyle(0) }}>
          {columns[0].heading}
        </h3>
        <div className="flex gap-10">
          {[col1, col2, col3].map((col, i) => (
            <div key={i}>
              <ul className="flex flex-col">
                {col.map((item, j) => (
                  <li key={item.title} style={cascadeStyle(i * colSize + j + 1)}>
                    <a
                      href={item.href}
                      onClick={() => onItemClick && onItemClick()}
                      className={`group/link block ${itemPadding}`}
                    >
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-white transition-colors group-hover/link:text-white/70">
                        {item.title}
                        <svg className="inline-block w-2.5 h-2.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0 text-white/50" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      {item.description && (
                        <span className="block text-xs text-white/40 mt-0.5">{item.description}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-10 px-3 py-8">
      {columns.map((column) => (
        <div key={column.heading}>
          <h3 className={`mb-2 text-xs text-white/60 ${headingPadding}`} style={cascadeStyle(0)}>
            {column.heading}
          </h3>
          <ul className="flex flex-col">
            {column.items.map((item, i) => (
              <li key={item.title} style={cascadeStyle(i + 1)}>
                <a
                  href={item.href}
                  onClick={() => onItemClick && onItemClick()}
                  className="group/link block py-1.5 px-5"
                >
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white transition-colors group-hover/link:text-white/70">
                    {item.title}
                    <svg className="inline-block w-2.5 h-2.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0 text-white/50" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Navbar() {
  // Desktop state
  const [activeMenu, setActiveMenu] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedMenu, setDisplayedMenu] = useState(null);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);
  const menuContentRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);
  const prevMenuRef = useRef(null);
  const [slideDirection, setSlideDirection] = useState("none");
  const [menuVersion, setMenuVersion] = useState("v4");
  const [cascadeState, setCascadeState] = useState("none");
  const closeGenRef = useRef(0);

  const [v3Hovered, setV3Hovered] = useState(false);
  const [v5Muted, setV5Muted] = useState(true);
  const v5VideoRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadingSlide, setFadingSlide] = useState(null);
  const prevSlideRef = useRef(0);
  const slideVideoRefs = useRef([]);

  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState(null);
  // Mobile-only: fade in a small Book Demo CTA on the right of the
  // navbar once the user has scrolled past 300px. The page scrolls
  // inside `.sc-viewport`, not the window, so we attach the listener
  // there (with a window fallback for any other host).
  const [showMobileCta, setShowMobileCta] = useState(false);
  useEffect(() => {
    const target = document.querySelector('.sc-viewport') || window;
    const getY = () => (target === window ? window.scrollY : target.scrollTop);
    const onScroll = () => setShowMobileCta(getY() > 300);
    onScroll();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  // Desktop menu logic
  const closeMenu = useCallback(() => {
    if (menuVersion !== "v1") {
      const gen = ++closeGenRef.current;
      setCascadeState("out");
      setTimeout(() => {
        if (closeGenRef.current !== gen) return;
        setIsAnimating(false);
        setTimeout(() => {
          if (closeGenRef.current !== gen) return;
          setDisplayedMenu(null);
          setCascadeState("none");
        }, 300);
      }, 150);
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setDisplayedMenu(null);
      }, 250);
    }
  }, [menuVersion]);

  useEffect(() => {
    if (activeMenu) {
      closeGenRef.current++;
      const menuLabels = allMenuItems.filter(n => n.menu).map(n => n.label);
      const prevIndex = prevMenuRef.current ? menuLabels.indexOf(prevMenuRef.current) : -1;
      const nextIndex = menuLabels.indexOf(activeMenu);

      const isSwitching = prevMenuRef.current && prevMenuRef.current !== activeMenu && prevIndex !== -1;
      if (isSwitching) {
        setSlideDirection(nextIndex > prevIndex ? "right" : "left");
        setCascadeState("none");
      } else {
        setSlideDirection("none");
        const isInitialOpen = !prevMenuRef.current;
        setCascadeState(menuVersion !== "v1" && isInitialOpen ? "in" : "none");
      }

      prevMenuRef.current = activeMenu;
      setDisplayedMenu(activeMenu);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      prevMenuRef.current = null;
      setSlideDirection("none");
      closeMenu();
    }
  }, [activeMenu, closeMenu, menuVersion]);

  useLayoutEffect(() => {
    if (displayedMenu && menuContentRef.current) {
      const activeEl = menuContentRef.current.querySelector(
        `[data-menu="${displayedMenu}"]`
      );
      if (activeEl) {
        setMenuHeight(activeEl.scrollHeight);
      }
    }
  }, [displayedMenu, menuVersion]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile: lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Mobile: close on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileActivePanel(null);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuIsOpen = displayedMenu !== null;
  const isV2 = menuVersion === "v2";
  const isV3 = menuVersion === "v3";
  const isV4 = menuVersion === "v4";
  const isV5 = menuVersion === "v5";
  const isUnified = isV3 || isV4 || isV5;
  const isEnhanced = isV2 || isV3 || isV4 || isV5;
  const isSwitchingMenus = isEnhanced && slideDirection !== "none";
  const transitionDuration = isSwitchingMenus ? "400ms" : "300ms";

  // Sync nav inset as CSS variable for page-level alignment
  useEffect(() => {
    const leftInset = isUnified ? '29px' : isV2 ? '20px' : '0px';
    const topInset = isEnhanced ? '16px' : '0px';
    document.documentElement.style.setProperty('--nav-left-inset', leftInset);
    document.documentElement.style.setProperty('--nav-top-inset', topInset);
    document.documentElement.dataset.menuVersion = menuVersion;
    const hasBadgeBlur = isV4 || isV5;
    document.documentElement.style.setProperty('--badge-backdrop', hasBadgeBlur ? 'blur(12px)' : 'none');
    document.documentElement.style.setProperty('--badge-bg', hasBadgeBlur ? 'rgba(255,255,255,0.1)' : 'transparent');
    document.documentElement.style.setProperty('--badge-border', hasBadgeBlur ? '1px solid rgba(255,255,255,0.1)' : 'none');
  }, [isV2, isUnified, isEnhanced, menuVersion]);

  // V4: Auto-advance slideshow
  useEffect(() => {
    if (!isV4) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideMedia.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isV4, currentSlide]);

  // V4: Track previous slide for fade-out
  useEffect(() => {
    if (prevSlideRef.current !== currentSlide) {
      setFadingSlide(prevSlideRef.current);
      prevSlideRef.current = currentSlide;
      const timer = setTimeout(() => setFadingSlide(null), 600);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  // V4: Restart video when slide changes
  useEffect(() => {
    const video = slideVideoRefs.current[currentSlide];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [currentSlide]);

  function handleMouseEnter(label, hasMenu) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasMenu) {
      setActiveMenu(label);
    } else if (menuIsOpen) {
      // Keep menu open but don't switch
    } else {
      setActiveMenu(null);
    }
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  }

  function handleMenuMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  // Mobile handlers
  function toggleMobileMenu() {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setTimeout(() => setMobileActivePanel(null), 300);
    } else {
      setMobileMenuOpen(true);
    }
  }

  function openMobilePanel(label) {
    setMobileActivePanel(label);
  }

  function closeMobilePanel() {
    setMobileActivePanel(null);
  }

  const activeItem = allMenuItems.find((item) => item.label === displayedMenu);

  return (
    <>
    <nav
      ref={navRef}
      className="absolute top-0 left-0 right-0 z-50"
      onMouseLeave={handleMouseLeave}
    >
      {/* ===== V3 Desktop — Unified Container ===== */}
      {isUnified && (
        <div className="hidden lg:block mx-4 mt-4 relative z-10">
          <div
            className="rounded-lg overflow-hidden transition-all duration-150 ease-out"
            style={{
              backgroundColor: activeMenu !== null ? 'var(--bg-surface-primary)' : 'var(--nav-bg, var(--bg-surface-primary))',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: activeMenu !== null ? 'var(--border)' : 'var(--nav-border, var(--border))',
              backdropFilter: isV5 ? 'blur(12px)' : 'none',
              WebkitBackdropFilter: isV5 ? 'blur(12px)' : 'none',
            }}
            onMouseEnter={() => { handleMenuMouseEnter(); setV3Hovered(true); }}
            onMouseLeave={() => setV3Hovered(false)}
          >
            {/* Header */}
            <div className="grid h-[60px] grid-cols-[1fr_auto_1fr] items-stretch px-3">
              <div className="flex items-stretch overflow-hidden">
                {navItems.map((item) => (
                  <button key={item.label} onMouseEnter={() => handleMouseEnter(item.label, !!item.menu)} onClick={() => item.menu ? setActiveMenu(activeMenu === item.label ? null : item.label) : setActiveMenu(null)} className={`flex items-center gap-1.5 px-5 text-sm font-normal leading-5 tracking-[-0.15px] transition-colors duration-200 ${activeMenu === item.label ? "text-white" : "text-white/50 hover:text-white"}`}>
                    {item.label}
                    {item.menu && (<svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-250 ${activeMenu === item.label ? "rotate-180" : ""}`}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <a href="#/" aria-label="Roam home" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <img src="/icons/roam-logo.png" alt="Roam" style={{ width: 109, height: 32, objectFit: 'contain', cursor: 'pointer' }} />
                </a>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onMouseEnter={() => handleMouseEnter("Existing Members", true)} onClick={() => setActiveMenu(activeMenu === "Existing Members" ? null : "Existing Members")} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] transition-colors duration-200 ${activeMenu === "Existing Members" ? "text-white" : "text-white/50 hover:text-white"}`}>
                  Existing Members
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${activeMenu === "Existing Members" ? "rotate-180" : ""}`}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button className="rounded-md bg-white/5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] text-white shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/10">Book Demo</button>
                <button className="rounded-md bg-white/5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] text-white shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/10">Free Trial</button>
              </div>
            </div>
            {/* Menu expander */}
            {displayedMenu && activeItem?.menu && (
              <div
                className="overflow-hidden"
                style={{
                  height: isAnimating && menuHeight ? menuHeight + 1 : 0,
                  transition: `height ${transitionDuration} ease-out`,
                }}
              >
                <div className="h-px bg-white/[0.06] transition-opacity duration-150 ease-out" style={{ opacity: activeMenu !== null ? 1 : 0 }} />
                <div ref={menuContentRef} className="relative" style={{ height: menuHeight || 'auto' }}>
                  {allMenuItems.filter(n => n.menu).map((navItem) => {
                    const isActive = displayedMenu === navItem.label;
                    const menuLabels = allMenuItems.filter(n => n.menu).map(n => n.label);
                    const myIndex = menuLabels.indexOf(navItem.label);
                    const activeIndex = displayedMenu ? menuLabels.indexOf(displayedMenu) : -1;
                    let translateX = "0px";
                    if (!isActive && slideDirection !== "none") { translateX = myIndex < activeIndex ? "-150px" : "150px"; }
                    const itemCascade = isActive ? cascadeState : "none";
                    return (
                      <div key={navItem.label} data-menu={navItem.label} className="absolute inset-x-0 top-0" style={{ opacity: isActive && isAnimating ? 1 : 0, transform: `translateX(${isActive ? "0px" : translateX})`, pointerEvents: isActive ? "auto" : "none", transition: `opacity 150ms ease-out, transform ${transitionDuration} ease-out` }}>
                        <MegaMenu columns={navItem.menu} align={navItem.label === "Existing Members" ? "right" : "left"} cascade={itemCascade} spacious onItemClick={() => setActiveMenu(null)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Dismiss zone (no blur) */}
          {displayedMenu && activeItem?.menu && (
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setActiveMenu(null)}
              onMouseEnter={() => setActiveMenu(null)}
            />
          )}
        </div>
      )}

      {/* ===== Desktop Header (v1/v2) ===== */}
      {!isUnified && (
        <div className={`hidden lg:grid h-[56px] grid-cols-[1fr_auto_1fr] items-stretch ${isV2 ? "pl-5 pr-10 pt-3" : "pr-1"}`}>
          <div className="flex items-stretch overflow-hidden">
            {navItems.map((item) => (
              <button key={item.label} onMouseEnter={() => handleMouseEnter(item.label, !!item.menu)} onClick={() => item.menu ? setActiveMenu(activeMenu === item.label ? null : item.label) : setActiveMenu(null)} className={`flex items-center gap-1.5 px-5 text-sm font-normal leading-5 tracking-[-0.15px] transition-colors duration-200 ${activeMenu === item.label ? "text-white" : "text-white/50 hover:text-white"}`}>
                {item.label}
                {item.menu && (<svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-250 ${activeMenu === item.label ? "rotate-180" : ""}`}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <a href="#/" aria-label="Roam home" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img src="/icons/roam-logo.png" alt="Roam" style={{ width: 109, height: 32, objectFit: 'contain', cursor: 'pointer' }} />
            </a>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onMouseEnter={() => handleMouseEnter("Existing Members", true)} onClick={() => setActiveMenu(activeMenu === "Existing Members" ? null : "Existing Members")} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] transition-colors duration-200 ${activeMenu === "Existing Members" ? "text-white" : "text-white/50 hover:text-white"}`}>
              Existing Members
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${activeMenu === "Existing Members" ? "rotate-180" : ""}`}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="rounded-md bg-white/5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] text-white shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/10">Book Demo</button>
            <button className="rounded-md bg-white/5 px-4 py-2 text-sm font-normal leading-5 tracking-[-0.15px] text-white shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/10">Free Trial</button>
          </div>
        </div>
      )}

      {/* ===== Mobile Header ===== */}
      <div
        className="relative z-10 flex lg:hidden h-[56px] items-center justify-between pl-1 pr-4"
        style={{
          background: "transparent",
          transition: mobileMenuOpen
            ? "background-color 400ms cubic-bezier(0.33,1,0.68,1)"
            : "background-color 300ms cubic-bezier(0.32,0,0.67,0)",
        }}
      >
        {/* Logo — hidden on mobile; brand sits with the hero icon */}
        <a href="#/" aria-label="Roam home" style={{ display: 'none' }}>
          <img src="/icons/roam-logo.png" alt="Roam" style={{ width: 90, height: 26, objectFit: 'contain', cursor: 'pointer' }} />
        </a>

        {/* Hamburger / Close button */}
        <button
          onClick={toggleMobileMenu}
          className="relative flex items-center justify-center w-10 h-10"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <div className="relative w-[16px] h-[7px]">
            <span
              className="absolute left-0 right-0 h-[1.5px] rounded-full transition-all duration-300 ease-out"
              style={
                mobileMenuOpen
                  ? { top: "3px", transform: "rotate(45deg)", backgroundColor: "var(--icon-secondary)" }
                  : { top: 0, transform: "rotate(0deg)", backgroundColor: "var(--icon-secondary)" }
              }
            />
            <span
              className="absolute left-0 right-0 h-[1.5px] rounded-full transition-all duration-300 ease-out"
              style={
                mobileMenuOpen
                  ? { top: "3px", transform: "rotate(-45deg)", backgroundColor: "var(--icon-secondary)" }
                  : { top: "6px", transform: "rotate(0deg)", backgroundColor: "var(--icon-secondary)" }
              }
            />
          </div>
        </button>

        {/* Scroll-triggered CTA — fades in past 300px, fades out on
            exit. Always rendered so opacity/transform transitions
            animate in both directions. */}
        <a
          href="#book-demo"
          aria-label="Book Demo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            padding: '0 14px',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '-0.15px',
            color: 'var(--btn-text)',
            background: 'var(--btn-bg)',
            borderRadius: 999,
            textDecoration: 'none',
            opacity: showMobileCta ? 1 : 0,
            transform: showMobileCta ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.94)',
            pointerEvents: showMobileCta ? 'auto' : 'none',
            transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'opacity, transform',
          }}
        >
          Book Demo
        </a>
      </div>

      {/* ===== Desktop Mega Menu (v1/v2) ===== */}
      {!isUnified && displayedMenu && activeItem?.menu && (
        <div className="hidden lg:block">
          {/* Background */}
          {isV2 ? (
            <>
              {/* Nav bar background removed in v2 — transparent nav */}
              {/* Menu panel background - inset with rounded corners */}
              <div
                className="pointer-events-none absolute z-[-1] rounded-lg"
                style={{
                  opacity: isAnimating ? 1 : 0,
                  left: 40,
                  right: 40,
                  top: 72,
                  height: isAnimating && menuHeight ? menuHeight : 0,
                  background: "#131415",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: `all ${transitionDuration} ease-out`,
                }}
              />
            </>
          ) : (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[-1]"
              style={{
                opacity: isAnimating ? 1 : 0,
                height: isAnimating && menuHeight ? 56 + 1 + menuHeight : 56,
                background: "#131415",
                transformOrigin: "top",
                transition: `all ${transitionDuration} ease-out`,
              }}
            />
          )}
          {/* Dark blur scrim over the rest of the page */}
          <div
            className="fixed inset-0 z-[-2]"
            style={{
              opacity: isAnimating ? 1 : 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(20px) brightness(0.4)",
              WebkitBackdropFilter: "blur(20px) brightness(0.4)",
              transition: `opacity ${transitionDuration} ease-out`,
            }}
            onClick={() => setActiveMenu(null)}
            onMouseEnter={() => setActiveMenu(null)}
          />
          {/* V2: Hover bridge between nav and menu + side dismiss zones */}
          {isV2 && (
            <>
              <div
                className="h-[16px]"
                onMouseEnter={handleMenuMouseEnter}
              />
              <div
                className="absolute z-[51]"
                style={{ left: 0, width: 40, top: 72, height: isAnimating && menuHeight ? menuHeight : 0 }}
                onMouseEnter={() => setActiveMenu(null)}
              />
              <div
                className="absolute z-[51]"
                style={{ right: 0, width: 40, top: 72, height: isAnimating && menuHeight ? menuHeight : 0 }}
                onMouseEnter={() => setActiveMenu(null)}
              />
            </>
          )}
          {/* Menu content */}
          <div
            ref={menuContentRef}
            onMouseEnter={handleMenuMouseEnter}
            className={`relative z-50 overflow-hidden ${isV2 ? "mx-[40px] rounded-lg" : ""}`}
            style={{
              height: isAnimating && menuHeight ? menuHeight : 0,
              transition: `height ${transitionDuration} ease-out`,
            }}
          >
            {allMenuItems.filter(n => n.menu).map((navItem) => {
              const isActive = displayedMenu === navItem.label;
              const menuLabels = allMenuItems.filter(n => n.menu).map(n => n.label);
              const myIndex = menuLabels.indexOf(navItem.label);
              const activeIndex = displayedMenu ? menuLabels.indexOf(displayedMenu) : -1;

              let translateX = "0px";
              if (!isActive && slideDirection !== "none") {
                translateX = myIndex < activeIndex ? "-150px" : "150px";
              } else if (isActive && slideDirection !== "none") {
                translateX = "0px";
              }

              const itemCascade = isEnhanced && isActive ? cascadeState : "none";

              return (
                <div
                  key={navItem.label}
                  data-menu={navItem.label}
                  className="absolute inset-x-0 top-0"
                  style={{
                    opacity: isActive && isAnimating ? 1 : 0,
                    transform: `translateX(${isActive ? "0px" : translateX})`,
                    pointerEvents: isActive ? "auto" : "none",
                    transition: `opacity 150ms ease-out, transform ${transitionDuration} ease-out`,
                  }}
                >
                  <MegaMenu
                    columns={navItem.menu}
                    align={navItem.label === "Existing Members" ? "right" : "left"}
                    cascade={itemCascade}
                    spacious={isEnhanced}
                    onItemClick={() => setActiveMenu(null)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Mobile Menu Overlay ===== */}
      <div
        className="fixed inset-0 z-[5] overflow-hidden lg:hidden"
        style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            opacity: mobileMenuOpen ? 1 : 0,
            background: "rgba(0, 0, 0, 0.5)",
            transition: mobileMenuOpen
              ? "opacity 400ms cubic-bezier(0.33, 1, 0.68, 1)"
              : "opacity 300ms cubic-bezier(0.32, 0, 0.67, 0)",
          }}
          onClick={toggleMobileMenu}
        />

        {/* Menu panel — slides down from top */}
        <div
          className="relative h-full overflow-hidden"
          style={{
            background: "#000000",
            transform: mobileMenuOpen ? "translateY(0)" : "translateY(-110%)",
            opacity: mobileMenuOpen ? 1 : 0,
            transition: mobileMenuOpen
              ? "transform 400ms cubic-bezier(0.33, 1, 0.68, 1), opacity 400ms cubic-bezier(0.33, 1, 0.68, 1)"
              : "transform 300ms cubic-bezier(0.32, 0, 0.67, 0), opacity 300ms cubic-bezier(0.32, 0, 0.67, 0)",
          }}
        >
          {/* Root panel */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: mobileActivePanel ? "translateX(-100%)" : "translateX(0)",
            }}
          >
            {/* Top gradient fade — fixed above scroll */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[80px] bg-gradient-to-b from-black to-transparent" />
            {/* Bottom gradient fade — fixed below scroll */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-black to-transparent" />

            {/* Pinned button at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 z-40 px-6 pb-[calc(env(safe-area-inset-bottom,12px)+16px)] pt-3"
              style={{
                opacity: mobileMenuOpen ? 1 : 0,
                transition: mobileMenuOpen
                  ? "opacity 300ms ease-out 200ms"
                  : "opacity 150ms ease-in",
              }}
            >
              <a
                href="/demo"
                className="flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-medium leading-6 tracking-[-0.32px] text-[#1a1a1a] active:bg-white/90"
              >
                Book Demo
              </a>
            </div>

            {/* Scrollable content — full height, padded for nav and button */}
            <div className="absolute inset-0 overflow-y-auto px-6 pt-[72px] pb-[calc(env(safe-area-inset-bottom,12px)+80px)]">
                {/* Products inline */}
                <h3
                  className="animate-silver-swipe bg-[length:500%_100%] bg-no-repeat bg-clip-text pt-2 pb-[16px] text-[11px] font-bold uppercase tracking-[0.5px] text-transparent"
                  style={{
                    fontFamily: "var(--font-possibility), sans-serif",
                    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) 35%, #e0e0e0 50%, rgba(255,255,255,0.3) 65%, rgba(255,255,255,0.3) 100%)",
                  }}
                >
                  Virtual Office Platform
                </h3>
                <div className="flex flex-col gap-[16px]">
                  {productsMenu[0].items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="active:opacity-70"
                    >
                      <span className="block text-[15px] font-medium text-white">{item.title}</span>
                      {item.description && (
                        <span className="block text-[12px] text-white/40 mt-0.5">{item.description}</span>
                      )}
                    </a>
                  ))}
                </div>

                <div className="my-[24px] -mx-6 h-px bg-white/10" />

                {/* Nav items + Existing Members */}
                <div className="flex flex-col gap-[16px]">
                  {navItems.filter(item => item.label !== "Products").map((item) =>
                    item.menu ? (
                      <button
                        key={item.label}
                        onClick={() => openMobilePanel(item.label)}
                        className="flex w-full items-center justify-between text-[17px] font-semibold text-white active:opacity-70"
                      >
                        {item.label}
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0 ml-4 text-white/30">
                          <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={toggleMobileMenu}
                        className="text-[17px] font-semibold text-white active:opacity-70"
                      >
                        {item.label}
                      </a>
                    )
                  )}

                  <button
                    onClick={() => openMobilePanel("Existing Members")}
                    className="flex w-full items-center justify-between text-[17px] font-semibold text-white/60 active:opacity-70"
                  >
                    Existing Members
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0 ml-4 text-white/30">
                      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

              </div>
          </div>

          {/* Sub-panels */}
          {allMenuItems
            .filter((n) => n.menu)
            .map((navItem) => (
              <div
                key={navItem.label}
                className="absolute inset-0 overflow-y-auto transition-transform duration-300 ease-out"
                style={{
                  transform:
                    mobileActivePanel === navItem.label
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
              >
                <div className="flex flex-col px-6 pt-[72px] pb-[env(safe-area-inset-bottom,24px)]">
                  {/* Back button */}
                  <button
                    onClick={closeMobilePanel}
                    className="flex items-center gap-2 py-3 text-[15px] font-medium text-white/50 active:opacity-70"
                  >
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="text-white/40">
                      <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </button>

                  {/* Menu columns stacked vertically */}
                  {navItem.menu.map((column, colIndex) => (
                    <div key={column.heading} className="py-3">
                      {/* Only show heading if multiple columns or if it differs from the nav item label */}
                      {(navItem.menu.length > 1 || column.heading !== navItem.label) && (
                        <h3
                          className="pb-2 text-[11px] font-bold uppercase tracking-[0.5px] text-white/35"
                          style={{ fontFamily: "var(--font-possibility), sans-serif" }}
                        >
                          {column.heading}
                        </h3>
                      )}
                      <div className="flex flex-col">
                        {column.items.map((item) => (
                          <a
                            key={item.title}
                            href={item.href}
                            onClick={toggleMobileMenu}
                            className="py-2.5 active:opacity-70"
                          >
                            <span className="block text-[15px] font-medium text-white">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="block text-[12px] text-white/40 mt-0.5">
                                {item.description}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                      {colIndex < navItem.menu.length - 1 && (
                        <div className="mt-3 -mx-6 h-px bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Version toggle tab - desktop only */}
    </nav>
    </>
  );
}
