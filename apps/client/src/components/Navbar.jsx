import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";

/**
 * Props (all optional):
 * - onSearch: (query) => void
 */
export default function Navbar(props) {
  const onSearch = props?.onSearch || (() => {});
  const navigate = useNavigate();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [queryDesktop, setQueryDesktop] = useState("");
  const [queryMobile, setQueryMobile] = useState("");

  const avatarBtnRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const avatarItemRefs = useRef([]);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!avatarOpen) return;
      if (avatarBtnRef.current?.contains(e.target)) return;
      if (avatarMenuRef.current?.contains(e.target)) return;
      setAvatarOpen(false);
    }

    function onEscape(e) {
      if (e.key === "Escape") {
        if (avatarOpen) {
          setAvatarOpen(false);
          avatarBtnRef.current?.focus();
        } else if (mobileOpen) {
          setMobileOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [avatarOpen, mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      requestAnimationFrame(() => mobileSearchRef.current?.focus());
    }
  }, [mobileOpen]);

  function onAvatarMenuKeyDown(e) {
    const items = avatarItemRefs.current.filter(Boolean);
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(currentIndex + 1 + items.length) % items.length];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const previous = items[(currentIndex - 1 + items.length) % items.length];
      previous.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  }

  function onAvatarTriggerKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAvatarOpen(true);
      requestAnimationFrame(() => {
        avatarItemRefs.current[0]?.focus();
      });
    }
  }

  function submitDesktop(e) {
    e.preventDefault();
    const trimmedQuery = queryDesktop.trim();
    if (trimmedQuery) onSearch(trimmedQuery);
  }

  function submitMobile(e) {
    e.preventDefault();
    const trimmedQuery = queryMobile.trim();
    if (trimmedQuery) onSearch(trimmedQuery);
    setMobileOpen(false);
  }

  async function handleLogout() {
    try {
      const response = await fetch("https://api.ucenpulse.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setAvatarOpen(false);
      setMobileOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <nav className="bg-white text-gray-900 shadow-sm">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3">
        <a href="/" aria-label="Home" className="flex items-center gap-2">
          <img src="/logopng.png" alt="UCEN Pulse" className="h-8 w-auto hidden lg:block" />
          <img src="/Emblem.png" alt="UCEN Pulse Emblem" className="h-8 w-auto block lg:hidden" />
        </a>

        <form
          role="search"
          aria-label="Site search"
          className="hidden md:block md:max-w-md md:w-full md:mx-6 relative"
          onSubmit={submitDesktop}
        >
          <label htmlFor="desktop-record-search" className="sr-only">
            Search for a record
          </label>

          <div className="flex gap-2">
            <input
              id="desktop-record-search"
              type="search"
              placeholder="Search..."
              className="w-full border rounded-md px-3 h-10 text-textmuted placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={queryDesktop}
              onChange={(e) => setQueryDesktop(e.target.value)}
            />
            <button
              type="submit"
              className="py-2 px-4 text-sm bg-transparent text-black border rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-center"
            >
              <FaSearch className="text-textmuted" />
            </button>
          </div>

          <GlobalSearch value={queryDesktop} controlId="desktop-record-search" />
        </form>

        <div className="hidden md:block relative">
          <button
            id="user-menu-button"
            ref={avatarBtnRef}
            type="button"
            className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-haspopup="true"
            aria-expanded={avatarOpen}
            aria-controls="user-menu"
            aria-label="Open user menu"
            onClick={() => setAvatarOpen((open) => !open)}
            onKeyDown={onAvatarTriggerKeyDown}
          >
            <img src="/Avatar.svg" alt="Your profile" className="h-10 w-10 rounded-full border border-gray-200 block" />
            <svg
              className={`h-4 w-4 text-gray-600 transition-transform ${avatarOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.39a.75.75 0 0 1 .02-1.18z" />
            </svg>
          </button>

          <div aria-hidden className="absolute left-0 right-0 top-full h-2" />

          <div
            className={`absolute right-0 top-full w-48 rounded-lg border bg-white shadow-lg transition ${
              avatarOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onKeyDown={onAvatarMenuKeyDown}
          >
            <ul
              ref={avatarMenuRef}
              id="user-menu"
              role="menu"
              aria-labelledby="user-menu-button"
              className="py-1 focus:outline-none"
            >
              <li role="none">
                <a
                  ref={(el) => (avatarItemRefs.current[0] = el)}
                  role="menuitem"
                  href="#profile"
                  className="block w-full text-left px-4 py-2 text-sm text-textmuted font-semibold hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Profile
                </a>
              </li>

              <li role="none">
                <a
                  ref={(el) => (avatarItemRefs.current[1] = el)}
                  role="menuitem"
                  href="#settings"
                  className="block w-full text-left px-4 py-2 text-sm text-textmuted font-semibold hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Settings
                </a>
              </li>

              <li role="none">
                <button
                  ref={(el) => (avatarItemRefs.current[2] = el)}
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-textmuted font-semibold hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={mobileOpen ? "Close main menu" : "Open main menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            ...
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden border-t transition-[max-height,opacity] duration-200 ease-out overflow-hidden ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-4 sm:px-6 pt-3 pb-4 space-y-3">
          <form role="search" aria-label="Site search (mobile)" onSubmit={submitMobile}>
            <label htmlFor="mobile-record-search" className="sr-only">
              Search for a record
            </label>

            <div className="flex gap-2">
              <input
                ref={mobileSearchRef}
                id="mobile-record-search"
                type="search"
                placeholder="Search..."
                className="w-full border rounded-md px-3 h-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={queryMobile}
                onChange={(e) => setQueryMobile(e.target.value)}
              />
              <button
                type="submit"
                className="py-2 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>

          <div className="border-t pt-3">
            <div className="flex items-center gap-3">
              <img src="/Avatar.svg" alt="Your profile" className="h-10 w-10 rounded-full border border-gray-200" />
              <div>
                <p className="text-sm font-medium">My Account</p>
                <p className="text-xs text-gray-500">you@example.com</p>
              </div>
            </div>

            <ul className="mt-3 space-y-1" role="menu" aria-label="Account">
              <li role="none">
                <a role="menuitem" href="#profile" className="block px-2 py-2 text-sm rounded hover:bg-gray-100">
                  Profile
                </a>
              </li>
              <li role="none">
                <a role="menuitem" href="#settings" className="block px-2 py-2 text-sm rounded hover:bg-gray-100">
                  Settings
                </a>
              </li>
              <li role="none">
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
