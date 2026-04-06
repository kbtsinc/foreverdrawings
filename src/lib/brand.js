// src/lib/brand.js
// Forever Drawings — all brand copy in one place.
// Import and use these instead of hardcoding strings anywhere in the app.

export const BRAND = {

  // ─── Core identity ─────────────────────────────────────────────────────────
  name:        "Forever Drawings",
  domain:      "foreverdrawings.com",
  tagline:     "Every drawing, kept forever.",
  taglineAlt:  "Preserve every drawing, forever.",
  description: "A safe, beautiful home for your child's artwork — organized, backed up, and always within reach.",

  // ─── Auth screen ───────────────────────────────────────────────────────────
  auth: {
    headline:    "Forever Drawings",
    subheadline: "Every drawing, kept forever.",
    signIn:      "Welcome back",
    signInBtn:   "Sign In →",
    signUp:      "Start your vault",
    signUpBtn:   "Create Your Vault →",
    emailLabel:  "Email address",
    passLabel:   "Password",
    nameLabel:   "Your name",
    namePlaceholder: "e.g. Alex Johnson",
    demo:        "Demo mode — sign in with any credentials",
  },

  // ─── Onboarding ────────────────────────────────────────────────────────────
  onboarding: {
    welcomeTitle:   "Welcome to Forever Drawings",
    welcomeBody:    "Start by adding your first child, then upload their first drawing. It takes about a minute.",
    addFirstChild:  "Add your first child",
    addFirstArt:    "Upload your first drawing",
    step1:          "Add a child",
    step2:          "Upload a drawing",
    step3:          "Create an album",
  },

  // ─── Gallery / home ─────────────────────────────────────────────────────────
  gallery: {
    empty:          "No drawings yet.",
    emptyBody:      "Upload your first drawing to get started — snap a photo or forward a school email.",
    emptyFilter:    "No drawings match these filters.",
    emptyFilterBody:"Try removing a tag filter or switching to a different child.",
    totalLabel:     "drawings",
    thisYearLabel:  "this school year",
    favoritesLabel: "favorites",
    selectedLabel:  "selected",
    uploadBtn:      "+ Add Drawing",
    shareBtn:       "Share Selected",
    clearBtn:       "Clear",
    favoritesToggle:"Favorites",
    searchPlaceholder: "Search drawings…",
    allChildren:    "All Children",
  },

  // ─── Upload ─────────────────────────────────────────────────────────────────
  upload: {
    title:          "Add a Drawing",
    dropzone:       "Drop photos here or tap to browse",
    dropzoneFormats:"JPG, PNG, HEIC supported",
    titleLabel:     "Drawing title",
    titlePlaceholder:"e.g. Sunshine Dragon",
    childLabel:     "Which child made this?",
    gradeLabel:     "Grade",
    dateLabel:      "Date created",
    uploading:      "Saving drawing…",
    uploadBtn:      "Save to Vault",
    successToast:   "Drawing saved! ✓",
  },

  // ─── Children ───────────────────────────────────────────────────────────────
  children: {
    addTitle:        "Add a Child",
    editTitle:       "Edit Child",
    namePlaceholder: "e.g. Emma",
    schoolPlaceholder:"e.g. Maple Street Elementary",
    addBtn:          "Add Child",
    saveBtn:         "Save Changes",
    avatarLabel:     "Avatar",
    colorLabel:      "Color",
    noChildren:      "Add your first child to start organizing their drawings.",
    archiveConfirm:  "Archive this child's vault? Their drawings will still be saved.",
  },

  // ─── Albums ─────────────────────────────────────────────────────────────────
  albums: {
    title:           "Albums",
    empty:           "No albums yet.",
    emptyBody:       "Create an album to organize drawings by theme, holiday, or school year.",
    newTitle:        "New Album",
    editTitle:       "Edit Album",
    nameLabel:       "Album name",
    namePlaceholder: '"Best of Kindergarten"',
    forChildLabel:   "For child",
    allChildren:     "All Children",
    iconLabel:       "Icon",
    colorLabel:      "Color",
    smartLabel:      "Smart Album",
    smartBody:       "Auto-fills with matching drawings — no manual curation needed.",
    smartTagsLabel:  "Include drawings tagged with:",
    createBtn:       "Create Album",
    saveBtn:         "Save Changes",
    deleteConfirm:   "Delete this album? Drawings won't be removed from your vault.",
    artworksCount:   (n) => `${n} drawing${n !== 1 ? "s" : ""}`,
    backBtn:         "← Back to Albums",
    noDrawings:      "No drawings in this album yet.",
    noDrawingsBody:  "Drawings tagged with this album's rules will appear here automatically.",
  },

  // ─── Tags ───────────────────────────────────────────────────────────────────
  tags: {
    manageTitle:     "Manage Tags",
    existingLabel:   "Your Tags",
    createLabel:     "Create New Tag",
    nameLabel:       "Tag name",
    namePlaceholder: '"3rd Grade" or "Easter"',
    iconLabel:       "Icon",
    colorLabel:      "Color",
    createBtn:       "+ Create Tag",
    saveBtn:         "Save Changes",
    deleteConfirm:   "Delete this tag? It will be removed from all drawings.",
    editTitle:       (name) => `Tags for "${name}"`,
    saveTagsBtn:     "Save Tags",
    noTags:          "No tags yet. Create your first tag to start organizing.",
  },

  // ─── Cloud sync ─────────────────────────────────────────────────────────────
  cloud: {
    title:           "Cloud Storage",
    subtitle:        "Connect your personal accounts — each is isolated to your login only.",
    connected:       "Connected · Syncing automatically",
    notConnected:    "Not connected",
    connecting:      "Connecting…",
    syncing:         "Syncing…",
    syncNow:         "Sync Now",
    syncSuccess:     (n) => `${n} drawings synced ✓`,
    connect:         "Connect",
    disconnect:      "Disconnect",
    disconnectConfirm: "Disconnect? Your drawings will remain in your cloud storage.",
    privacyNote:     "Your data is yours. Each account is linked only to your login — no other parent can see your vault. Drawings sync to a Forever Drawings folder in your chosen service.",
    providers: {
      google_drive: "Google Drive",
      onedrive:     "OneDrive",
      dropbox:      "Dropbox",
    },
  },

  // ─── Vault email ────────────────────────────────────────────────────────────
  vaultEmail: {
    title:           "Your Vault Email",
    subtitle:        "Forward school emails or email photos directly — they'll appear in your vault automatically.",
    howToTitle:      "How to use it",
    tips: [
      { icon: "📩", title: "Forward school emails",  body: "When your school emails artwork photos, forward the email to this address." },
      { icon: "📸", title: "Email from your phone",  body: "Take a photo and email it directly. Attach up to 10 photos per email." },
      { icon: "👨‍👩‍👧", title: "Share with family",     body: "Give grandparents this address so they can add drawings to your vault too." },
      { icon: "✉️", title: "Any email works",        body: "Send from Gmail, Apple Mail, Outlook — we'll match it to your account." },
    ],
    savedNote:       "JPG, PNG, and HEIC photos are saved automatically. The email subject becomes the drawing title. You'll get a confirmation email when it's saved.",
    copyBtn:         "Copy",
    copiedBtn:       "✓ Copied",
    shareBtn:        "Share",
    testBtn:         "Send a test email",
    testSending:     "Sending…",
    testSuccess:     "Test email sent! Check your vault in a moment.",
  },

  // ─── Backup ─────────────────────────────────────────────────────────────────
  backup: {
    title:           "Backup & Recovery",
    subtitle:        "Your vault is backed up nightly with 30-day retention.",
    totalLabel:      "total drawings",
    lastBackupLabel: "last backup",
    retentionLabel:  "retention",
    retentionValue:  "30 days",
    runBtn:          "Run Manual Backup",
    running:         "Running backup…",
    complete:        "✓ Backup Complete",
    historyTitle:    "Backup History",
    automatic:       "Automatic backup",
    manual:          "Manual backup",
    success:         "✓ Success",
    failed:          "✗ Failed",
    features: [
      { icon: "🌙", label: "Nightly automatic backup",  desc: "Runs at 2 AM daily — 30-day retention" },
      { icon: "🖼️",  label: "Drawing file snapshot",     desc: "All photos backed up to S3 storage" },
      { icon: "🗄️",  label: "Database export",           desc: "Full pg_dump on every backup cycle" },
      { icon: "♻️",   label: "Auto-rotation policy",      desc: "Backups older than 30 days auto-deleted" },
    ],
  },

  // ─── Share ──────────────────────────────────────────────────────────────────
  share: {
    title:           (n) => `Share ${n} Drawing${n !== 1 ? "s" : ""}`,
    generateBtn:     "✨ Create Share Link",
    generating:      "Creating link…",
    expiry:          "Link expires in 30 days · View-only · No account needed",
    emailBtn:        "Email",
    textBtn:         "Text Message",
    copyBtn:         "Copy",
    copiedBtn:       "✓ Copied",
  },

  // ─── Install / PWA ──────────────────────────────────────────────────────────
  pwa: {
    installTitle:    "Add to Home Screen",
    installBody:     "Install for quick access — upload drawings straight from your camera roll.",
    installBtn:      "Install",
    iosTitle:        "Install Forever Drawings",
    iosSubtitle:     "Add to your iPhone home screen",
    iosSteps: [
      "Tap the Share button at the bottom of Safari",
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" — the app will appear on your home screen',
    ],
    offlineTitle:    "You're offline",
    offlineBody:     "No connection right now. Your vault is safe — reconnect to sync and upload drawings.",
    offlineTips: [
      "Browse drawings you've already viewed — they're cached on your device",
      "Queue photos to upload — they'll sync automatically when you reconnect",
      "View your favorites and previously opened drawings",
    ],
    updateBanner:    "✨ A new version is available",
    updateBtn:       "Update Now",
    queueSyncing:    (n) => `Syncing ${n} queued upload${n !== 1 ? "s" : ""}…`,
    queueOffline:    (n) => `${n} upload${n !== 1 ? "s" : ""} queued — will sync when online`,
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  notifications: {
    newDrawingSaved:  "Drawing saved to your vault",
    cloudSyncDone:    (provider) => `Drawings synced to ${provider}`,
    emailReceived:    (n) => `${n} drawing${n !== 1 ? "s" : ""} added via email`,
    backupComplete:   "Vault backup complete",
  },

  // ─── Confirmation emails ────────────────────────────────────────────────────
  emailTemplates: {
    confirmSubject:  (n) => `✓ ${n} drawing${n !== 1 ? "s" : ""} saved to your Forever Drawings vault`,
    confirmBody:     (titles) =>
      `Your drawing${titles.length !== 1 ? "s have" : " has"} been saved to your Forever Drawings vault!\n\n` +
      titles.map((t, i) => `${i + 1}. ${t}`).join("\n") +
      `\n\nView your vault at https://foreverdrawings.com`,
  },

  // ─── Footer / legal ─────────────────────────────────────────────────────────
  footer: {
    copyright:  `© ${new Date().getFullYear()} Forever Drawings`,
    tagline:    "Every drawing, kept forever.",
    privacy:    "Privacy Policy",
    terms:      "Terms of Service",
    contact:    "hello@foreverdrawings.com",
  },

};

export default BRAND;
