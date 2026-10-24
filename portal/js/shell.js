/** Shared authenticated app chrome injector */
(function () {
  if (localStorage.getItem("fp-theme") === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
window.FPShell = {
  navItems: [
    { href: "dashboard.html", label: "Trader Desk", icon: "desk" },
    { href: "accounts.html", label: "Accounts", icon: "accounts" },
    { href: "payouts.html", label: "Rewards", icon: "rewards" },
  ],
  utilities: [
    { href: "tools.html", label: "Tools", icon: "tools" },
    { href: "trade-copier.html", label: "Trade Copier", icon: "copier" },
    { href: "economic-calendar.html", label: "Economic Calendar", icon: "calendar" },
  ],
  more: [
    { href: "competitions.html", label: "Competitions", icon: "trophy" },
    { href: "affiliate.html", label: "Affiliate", icon: "users" },
    { href: "refer-a-friend.html", label: "Refer a Friend", icon: "gift", badge: "New" },
    { href: "leaderboards.html", label: "Leaderboards", icon: "chart" },
    { href: "certificates.html", label: "Certificates", icon: "shield" },
  ],
  svg(body, size) {
    const px = size || 18;
    return `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" aria-hidden="true">${body}</svg>`;
  },
  icons: {
    desk: '<path d="M19.5 9.905V18.25H21V9.905H19.5ZM4.5 18.25V9.905H3V18.25H4.5ZM4.925 8.966 11.175 3.474 10.185 2.347 3.935 7.839 4.925 8.966ZM12.825 3.474 19.075 8.966 20.065 7.839 13.815 2.347 12.825 3.474ZM11.75 15.5H12.25V14H11.75V15.5ZM13.5 16.75V19.25H15V16.75H13.5ZM10.5 19.25V16.75H9V19.25H10.5ZM8.75 19.5H5.75V21H8.75V19.5ZM15.25 21H18.25V19.5H15.25V21ZM9 19.25C9 19.388 8.888 19.5 8.75 19.5V21C9.717 21 10.5 20.217 10.5 19.25H9ZM13.5 19.25C13.5 20.217 14.284 21 15.25 21V19.5C15.112 19.5 15 19.388 15 19.25H13.5ZM12.25 15.5C12.94 15.5 13.5 16.06 13.5 16.75H15C15 15.231 13.769 14 12.25 14V15.5ZM11.75 14C10.231 14 9 15.231 9 16.75H10.5C10.5 16.06 11.06 15.5 11.75 15.5V14ZM11.175 3.474C11.647 3.059 12.353 3.059 12.825 3.474L13.815 2.347C12.777 1.434 11.223 1.434 10.185 2.347L11.175 3.474ZM3 18.25C3 19.769 4.231 21 5.75 21V19.5C5.06 19.5 4.5 18.94 4.5 18.25H3ZM19.5 18.25C19.5 18.94 18.94 19.5 18.25 19.5V21C19.769 21 21 19.769 21 18.25H19.5ZM21 9.905C21 9.114 20.659 8.361 20.065 7.839L19.075 8.966C19.345 9.203 19.5 9.545 19.5 9.905H21ZM4.5 9.905C4.5 9.545 4.655 9.203 4.925 8.966L3.935 7.839C3.341 8.361 3 9.114 3 9.905H4.5Z" fill="currentColor"/>',
    accounts: '<path d="M19.25 20.25C20.355 20.25 21.25 19.355 21.25 18.25V8.75C21.25 7.645 20.355 6.75 19.25 6.75H4.75C3.645 6.75 2.75 7.645 2.75 8.75V18.25C2.75 19.355 3.645 20.25 4.75 20.25H19.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.75 6.75V4.75C7.75 3.645 8.645 2.75 9.75 2.75H14.25C15.355 2.75 16.25 3.645 16.25 4.75V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V13.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 11L12 13L21 11" stroke="currentColor" stroke-width="1.5"/>',
    rewards: '<path d="M7.75 15V21.568C7.75 22.118 8.322 22.481 8.819 22.247L11.681 20.9C11.883 20.805 12.117 20.805 12.319 20.9L15.181 22.247C15.678 22.481 16.25 22.118 16.25 21.568V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.25 9C19.25 13.004 16.004 16.25 12 16.25C7.996 16.25 4.75 13.004 4.75 9C4.75 4.996 7.996 1.75 12 1.75C16.004 1.75 19.25 4.996 19.25 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    tools: '<path d="M14.569 16.111C18.259 16.111 21.25 13.12 21.25 9.431C21.25 8.66 21.12 7.92 20.88 7.231L18.167 9.944C17.031 11.08 15.191 11.08 14.056 9.944C12.92 8.809 12.92 6.969 14.056 5.833L16.769 3.12C16.08 2.88 15.34 2.75 14.569 2.75C10.88 2.75 7.889 5.741 7.889 9.431C7.889 10.342 8.071 11.21 8.401 12.001L3.393 17.086C2.622 17.869 2.627 19.127 3.404 19.904L4.096 20.596C4.873 21.373 6.131 21.378 6.914 20.607L11.999 15.599C12.79 15.929 13.658 16.111 14.569 16.111Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    copier: '<path d="M5.459 5.46C3.785 7.134 2.75 9.446 2.75 12.001C2.75 14.555 3.785 16.868 5.459 18.541M8.366 8.367C7.436 9.297 6.861 10.582 6.861 12.001C6.861 13.42 7.436 14.705 8.366 15.634M15.634 15.634C16.564 14.705 17.139 13.42 17.139 12.001C17.139 10.582 16.564 9.297 15.634 8.367M18.541 18.541C20.215 16.868 21.25 14.555 21.25 12.001C21.25 9.446 20.215 7.134 18.541 5.46M12.75 12C12.75 12.414 12.414 12.75 12 12.75C11.586 12.75 11.25 12.414 11.25 12C11.25 11.586 11.586 11.25 12 11.25C12.414 11.25 12.75 11.586 12.75 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    calendar: '<path d="M5.75 3.75H18.25C19.355 3.75 20.25 4.645 20.25 5.75V7.75V18.25C20.25 19.355 19.355 20.25 18.25 20.25H5.75C4.645 20.25 3.75 19.355 3.75 18.25V7.75V5.75C3.75 4.645 4.645 3.75 5.75 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M3.75 7.75H20.25" stroke="currentColor" stroke-width="1.5"/><path fill="currentColor" d="M8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>',
    trophy: '<path d="M12 18V15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M18.25 4.75H19.25C20.355 4.75 21.25 5.645 21.25 6.75V7.25C21.25 8.907 19.907 10.25 18.25 10.25" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.75 4.75C5.75 3.645 6.645 2.75 7.75 2.75H16.25C17.355 2.75 18.25 3.645 18.25 4.75V9.25C18.25 12.564 15.564 15.25 12.25 15.25H11.75C8.436 15.25 5.75 12.564 5.75 9.25V4.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.75 19.25C6.75 18.422 7.422 17.75 8.25 17.75H15.75C16.578 17.75 17.25 18.422 17.25 19.25V19.75C17.25 20.578 16.578 21.25 15.75 21.25H8.25C7.422 21.25 6.75 20.578 6.75 19.75V19.25Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.75 4.75H4.75C3.645 4.75 2.75 5.645 2.75 6.75V7.25C2.75 8.907 4.093 10.25 5.75 10.25" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    users: '<circle cx="12" cy="8.75" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="9.8" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="9.8" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M7.25 16.625V16.5C7.25 13.877 9.377 11.75 12 11.75C14.623 11.75 16.75 13.877 16.75 16.5V16.625C16.75 17.523 16.023 18.25 15.125 18.25H8.875C7.978 18.25 7.25 17.523 7.25 16.625Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.25 17.26H2.75C1.645 17.26.707 16.354.92 15.27 1.259 13.549 2.15 12.326 4 11.83" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19.75 17.26H21.25C22.355 17.26 23.294 16.354 23.08 15.27 22.741 13.549 21.85 12.326 20 11.83" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    gift: '<path d="M12 7.75V6.083M12 7.75H10.333C8.492 7.75 7 6.258 7 4.417 7 3.496 7.746 2.75 8.667 2.75 10.508 2.75 12 4.242 12 6.083M12 7.75H13.667C15.508 7.75 17 6.258 17 4.417 17 3.496 16.254 2.75 15.333 2.75 13.492 2.75 12 4.242 12 6.083M12 7.75H5.75C4.645 7.75 3.75 8.645 3.75 9.75V10C3.75 10.74 4.152 11.387 4.75 11.732M12 7.75H18.25C19.355 7.75 20.25 8.645 20.25 9.75V10C20.25 10.74 19.848 11.387 19.25 11.732M12 7.75V12M12 20.25H6.75C5.645 20.25 4.75 19.355 4.75 18.25V11.732M12 20.25H17.25C18.355 20.25 19.25 19.355 19.25 18.25V11.732M12 20.25V12M12 12H18.25C18.614 12 18.956 11.903 19.25 11.732M12 12H5.75C5.386 12 5.044 11.903 4.75 11.732" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    chart: '<path d="M11.75 16.75H20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11.75 7.25H20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6.25 9.75V4.75L3.75 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14.932S4.724 14.25 5.609 14.25C6.494 14.25 7.212 14.872 7.212 15.639 7.212 17.439 3.75 17.75 3.75 19.25H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    shield: '<path d="M10.586 2.664 9.36 3.889C8.985 4.264 8.477 4.475 7.946 4.475H6.475C5.37 4.475 4.475 5.37 4.475 6.475V7.947C4.475 8.477 4.264 8.986 3.889 9.361L2.664 10.586C1.883 11.367 1.883 12.633 2.664 13.414L3.889 14.639C4.264 15.014 4.475 15.523 4.475 16.053V17.525C4.475 18.63 5.37 19.525 6.475 19.525H7.946C8.477 19.525 8.985 19.736 9.36 20.111L10.586 21.336C11.367 22.117 12.633 22.117 13.414 21.336L14.639 20.111C15.014 19.736 15.523 19.525 16.053 19.525H17.525C18.629 19.525 19.525 18.63 19.525 17.525V16.053C19.525 15.523 19.735 15.014 20.111 14.639L21.336 13.414C22.117 12.633 22.117 11.367 21.336 10.586L20.111 9.361C19.735 8.986 19.525 8.477 19.525 7.947V6.475C19.525 5.37 18.629 4.475 17.525 4.475H16.053C15.523 4.475 15.014 4.264 14.639 3.889L13.414 2.664C12.633 1.883 11.367 1.883 10.586 2.664Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.68 13.093 10.912 15.06 14.82 9.44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    bell: '<path d="M20.25 16.244C20.25 16.8 19.8 17.25 19.244 17.25H4.756C4.2 17.25 3.75 16.8 3.75 16.244C3.75 16.084 3.788 15.926 3.862 15.783L5.099 13.384C5.229 13.131 5.304 12.853 5.319 12.568L5.504 8.909C5.677 5.459 8.534 2.75 12 2.75C15.466 2.75 18.323 5.459 18.497 8.909L18.681 12.568C18.696 12.853 18.771 13.131 18.901 13.384L20.138 15.783C20.212 15.926 20.25 16.084 20.25 16.244Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 17.25C16 19.459 14.209 21.25 12 21.25C9.791 21.25 8 19.459 8 17.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    basket: '<path d="M1.75 2.75H2.27C2.985 2.75 3.601 3.255 3.741 3.956L5.678 13.642C5.865 14.577 6.686 15.25 7.64 15.25H17.877C18.823 15.25 19.64 14.588 19.834 13.662L21.246 6.956C21.377 6.334 20.903 5.75 20.268 5.75H4.5M9.25 19C9.25 19.69 8.69 20.25 8 20.25C7.31 20.25 6.75 19.69 6.75 19C6.75 18.31 7.31 17.75 8 17.75C8.69 17.75 9.25 18.31 9.25 19ZM18.25 19C18.25 19.69 17.69 20.25 17 20.25C16.31 20.25 15.75 19.69 15.75 19C15.75 18.31 16.31 17.75 17 17.75C17.69 17.75 18.25 18.31 18.25 19Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    collapse: '<path d="M2.75 6.75C2.75 5.645 3.645 4.75 4.75 4.75H19.25C20.355 4.75 21.25 5.645 21.25 6.75V17.25C21.25 18.355 20.355 19.25 19.25 19.25H4.75C3.645 19.25 2.75 18.355 2.75 17.25V6.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.25 8.25V15.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    plus: '<path d="M12 5.25V12M12 12V18.75M12 12H5.25M12 12H18.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    user: '<path d="M15.75 6.5C15.75 8.571 14.071 10.25 12 10.25C9.929 10.25 8.25 8.571 8.25 6.5C8.25 4.429 9.929 2.75 12 2.75C14.071 2.75 15.75 4.429 15.75 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12.501 13.265C12.336 13.255 12.17 13.25 12.001 13.25C8.61 13.25 6.037 15.264 4.984 18.113C4.575 19.218 5.519 20.25 6.698 20.25H12.001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path fill="currentColor" fill-rule="evenodd" d="M19.294 14.063C19.42 14.396 19.763 14.595 20.115 14.538L20.727 14.438C21.035 14.389 21.341 14.534 21.497 14.804L21.8 15.329C21.952 15.591 21.93 15.92 21.746 16.16L21.324 16.71C21.113 16.986 21.118 17.371 21.339 17.641L21.799 18.204C21.997 18.446 22.024 18.784 21.868 19.054L21.565 19.579C21.413 19.842 21.119 19.987 20.818 19.948L20.131 19.858C19.786 19.812 19.455 20.01 19.332 20.335L19.074 21.016C18.964 21.307 18.684 21.5 18.373 21.5H17.766C17.463 21.5 17.19 21.318 17.074 21.038L16.767 20.3C16.637 19.986 16.313 19.799 15.977 19.844L15.186 19.947C14.886 19.987 14.591 19.842 14.439 19.579L14.136 19.054C13.98 18.784 14.007 18.446 14.204 18.205L14.664 17.64C14.884 17.371 14.89 16.986 14.679 16.71L14.258 16.16C14.073 15.92 14.052 15.592 14.203 15.329L14.507 14.804C14.663 14.534 14.969 14.389 15.277 14.439L15.995 14.555C16.338 14.611 16.674 14.424 16.808 14.103L17.074 13.462C17.19 13.182 17.463 13 17.766 13H18.373C18.685 13 18.964 13.193 19.074 13.484L19.294 14.063ZM18.002 15.5C17.035 15.5 16.252 16.284 16.252 17.25C16.252 18.217 17.035 19 18.002 19C18.968 19 19.752 18.217 19.752 17.25C19.752 16.284 18.968 15.5 18.002 15.5Z"/>',
    gear: '<path d="M7.878 5.214 7.175 5.052C6.58 4.915 5.957 5.093 5.525 5.525 5.093 5.957 4.915 6.58 5.052 7.175L5.214 7.878C5.401 8.689 5.067 9.53 4.375 9.992L3.52 10.562C3.039 10.883 2.75 11.422 2.75 12s.289 1.118.77 1.438l.855.57c.692.461 1.026 1.303.84 2.114l-.162.703c-.137.595.042 1.218.473 1.65.432.431 1.055.61 1.65.473l.703-.162c.811-.186 1.652.148 2.114.84l.57.855c.32.481.86.77 1.438.77s1.118-.289 1.438-.77l.57-.855c.462-.692 1.303-1.026 2.114-.84l.703.162c.595.137 1.218-.042 1.65-.473.431-.432.61-1.055.473-1.65l-.162-.703c-.187-.811.147-1.653.84-2.114l.855-.57c.481-.32.77-.86.77-1.438s-.289-1.117-.77-1.438l-.855-.57c-.693-.462-1.027-1.303-.84-2.114l.162-.703c.137-.595-.042-1.218-.473-1.65-.432-.431-1.055-.61-1.65-.473l-.703.162c-.811.187-1.652-.148-2.114-.84l-.57-.855C13.118 3.039 12.578 2.75 12 2.75s-1.117.289-1.438.77l-.57.855c-.462.692-1.303 1.027-2.114.84Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14.75 12A2.75 2.75 0 1 1 9.25 12a2.75 2.75 0 0 1 5.5 0Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    sun: '<path d="M11.998 3.291V1.768M5.84 18.159 4.763 19.236M11.998 22.233V20.709M19.233 4.765 18.156 5.842M20.707 12H22.23M18.156 18.159l1.077 1.077M1.766 12H3.289M4.763 4.765l1.077 1.077M15.71 8.288c2.05 2.05 2.05 5.374 0 7.424s-5.374 2.051-7.424 0-2.051-5.374 0-7.424 5.374-2.05 7.424 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    moon: '<path d="M21.248 11.811A6.5 6.5 0 0 1 12.189 2.752 9.25 9.25 0 1 0 21.25 12c0-.063 0-.126-.002-.189Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    logout: '<path d="M20.25 12H9M20.25 12 15.75 16.5M20.25 12 15.75 7.5M11.25 20.25H5.75A2 2 0 0 1 3.75 18.25V5.75A2 2 0 0 1 5.75 3.75h5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  theme() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  },
  applyTheme(mode) {
    const dark = mode === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    const pill = document.querySelector(".user-menu-pill");
    const icon = document.querySelector(".user-menu-mode svg");
    if (pill) pill.textContent = dark ? "Dark" : "Light";
    if (icon) icon.innerHTML = dark ? this.icons.moon : this.icons.sun;
  },
  link(item) {
    const icon = this.svg(this.icons[item.icon] || "");
    const badge = item.badge ? `<span class="badge">${item.badge}</span>` : "";
    return `<a href="${item.href}" data-nav="${item.href}" title="${item.label}">${icon}<span class="label">${item.label}</span>${badge}</a>`;
  },
  render(activeTitle) {
    const rail = document.getElementById("app-rail");
    const top = document.getElementById("app-topbar");
    if (!rail || !top) return;
    rail.innerHTML = `
      <a class="app-rail-brand" href="dashboard.html" aria-label="Go to Trader Desk">
        <img alt="FundingPips" src="https://fundingpips.com/images/labs/footer-wordmark.svg" width="121" height="24" />
      </a>
      <nav class="app-nav" aria-label="Main Navigation">
        ${this.navItems.map((i) => this.link(i)).join("")}
        <div class="app-nav-group open" data-group="utilities">
          <button type="button" aria-expanded="true"><span>Trading Utilities</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15.64 9.75H8.36C7.722 9.75 7.375 10.494 7.785 10.982L11.426 15.316C11.725 15.673 12.275 15.673 12.574 15.316L16.215 10.982C16.625 10.494 16.278 9.75 15.64 9.75Z" fill="currentColor"/></svg>
          </button>
          <div class="app-nav-sub">${this.utilities.map((i) => this.link(i)).join("")}</div>
        </div>
        ${this.more.map((i) => this.link(i)).join("")}
      </nav>`;
    top.innerHTML = `
      <button class="app-icon-btn app-icon-btn--collapse" type="button" aria-label="Collapse sidebar" title="Collapse sidebar">
        ${this.svg(this.icons.collapse, 18)}
      </button>
      <span class="app-top-title">${activeTitle || "Trader Desk"}</span>
      <div class="app-topbar-spacer"></div>
      <button class="app-icon-btn" type="button" aria-label="View notifications" title="View notifications">
        ${this.svg(this.icons.bell, 18)}
      </button>
      <button class="app-icon-btn" type="button" aria-label="Basket" title="Basket">
        ${this.svg(this.icons.basket, 18)}
      </button>
      <a class="btn-nav-primary" href="new-challenge.html">${this.svg(this.icons.plus, 16)}New Challenge</a>
      <div class="user-menu">
        <button class="app-icon-btn app-icon-btn--settings" type="button" aria-label="Settings" title="Settings" aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu">
          ${this.svg(this.icons.user, 18)}
        </button>
        <div id="user-menu" class="user-menu-panel" role="menu" hidden>
          <div class="user-menu-head">
            <span class="user-menu-avatar">MR</span>
            <div class="user-menu-id">
              <p class="user-menu-name">Muhammad Rehan</p>
              <p class="user-menu-email">muhammadrehankamboh10@gmail.com</p>
            </div>
          </div>
          <div class="user-menu-rule" aria-hidden="true"></div>
          <a class="user-menu-item" role="menuitem" href="dashboard.html">${this.svg(this.icons.gear, 18)}<span>Settings</span></a>
          <button class="user-menu-item user-menu-mode" type="button" role="menuitem">
            ${this.svg(this.theme() === "dark" ? this.icons.moon : this.icons.sun, 18)}
            <span>Mode</span>
            <span class="user-menu-pill">${this.theme() === "dark" ? "Dark" : "Light"}</span>
          </button>
          <button class="user-menu-item user-menu-logout" type="button" role="menuitem">${this.svg(this.icons.logout, 18)}<span>Log out</span></button>
        </div>
      </div>`;
    document.title = `${activeTitle || "Trade Desk"} | FundingPips`;
    this.bindMenu();
    if (window.FPUser) this.applyUser(window.FPUser);
  },
  applyUser(user) {
    if (!user) return;
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Trader";
    const email = user.email || "";
    const initials = name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FP";
    const nameEl = document.querySelector(".user-menu-name");
    const emailEl = document.querySelector(".user-menu-email");
    const avatarEl = document.querySelector(".user-menu-avatar");
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = initials;
    document.querySelectorAll(".greet-card h2").forEach((el) => {
      el.textContent = "Hey, " + (user.first_name || name.split(" ")[0] || "Trader");
    });
  },
  bindMenu() {
    const root = document.querySelector(".user-menu");
    if (!root) return;
    const btn = root.querySelector(".app-icon-btn--settings");
    const panel = root.querySelector(".user-menu-panel");
    const setOpen = (open) => {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(panel.hidden);
    });
    root.querySelector(".user-menu-mode").addEventListener("click", (event) => {
      event.stopPropagation();
      const next = this.theme() === "dark" ? "light" : "dark";
      localStorage.setItem("fp-theme", next);
      this.applyTheme(next);
    });
    const logoutBtn = root.querySelector(".user-menu-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          });
        } catch (_) {
          /* ignore */
        }
        location.href = "/portal/login.html";
      });
    }
    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  },
};
