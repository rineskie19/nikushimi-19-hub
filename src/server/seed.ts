import type { Project, ReleaseFile } from "@/lib/catalog";

const guide = "https://monster-hunter-tri-android-apk.vercel.app/";
const triRelease = "https://github.com/Dling11/monster_hunter_tri_emulator/releases/download/rowell-1.4.14/";
const triGameFiles: ReleaseFile[] = [{
  id: "game-data", label: "Open game download", description: "European / PAL edition · RVZ", provider: "Romsfun", enabled: true,
  url: "https://romsfun.com/download/monster-hunter-3-tri-id1-13483/2",
}];

export const initialApps: Project[] = [
  {
    slug: "warcraft-iii-bvo", title: "Warcraft III – BVO", category: "Warcraft",
    summary: "Bleach vs One Piece New World 5.0 on Android.",
    description: "The Warcraft III custom map with touch controls, adjustable layouts, and an in-game shop. Import compatible Warcraft III game data separately. AI and same-Wi-Fi play are available for testing.",
    cover: "/art/bvo-gameplay.png", icon: "/art/bvo-icon.png", status: "published", featured: true,
    videos: [
      { id: "9nlK5cVrZUA", title: "Warcraft III on Android · BVO New World 5.0" },
      { id: "eXeA5O7Hp1o", title: "Warcraft III on Android · BVO New World 5.0 Part 2" },
    ],
    releases: [{
      id: "v102", version: "v102", platform: "Android", sizeMb: 7, status: "published",
      createdAt: "2026-11-27T12:38:29Z", releasedOn: "2026-11-27",
      notes: "Tap outside the shop to dismiss it. The last ordinary skill tap during stun casts when the stun ends. Hold Shift retains its separate queue.",
      download: { url: "https://www.mediafire.com/file/ozf3jflr7jdcxt2/Warcraft-III-BVO-Mobile-v102.apk/file", enabled: true, label: "Download APK on MediaFire" },
      files: [
        {
          id: "game-data", label: "Open Warcraft III game data",
          description: "Warcraft_3_updated.zip · MediaFire", enabled: true,
          url: "https://www.mediafire.com/file/31b1cupqppf2zk9/Warcraft_3_updated.zip/file?action=check",
        },
        {
          id: "bvo-map", label: "Open BVO 5.0 map on Epic War",
          description: "BVONewWorld5fix02.w3x · BVO New World 5.0", enabled: true,
          url: "https://www.epicwar.com/maps/342305/",
        },
      ],
      guide: { enabled: true },
      setup: [
        "Install the v102 APK and open the Warcraft III – BVO launcher.",
        "Import Warcraft_3_updated.zip as game data and let the import finish.",
        "If the map is missing, download BVONewWorld5fix02.w3x from Epic War and import it with the launcher’s map import option.",
        "Start the game and choose Custom Game → Maps → download → BVO New World 5.0.",
      ].join("\n"),
    }],
  },
  {
    slug: "monster-hunter-tri", title: "Monster Hunter Tri", category: "Monster Hunter",
    summary: "Standard Android, 32-bit Low Spec, and Windows downloads.",
    description: "Choose the build for your device, then get the European/PAL game file and follow the setup guide.",
    cover: "/art/tri-icon.png", icon: "/art/tri-icon.png", status: "published", featured: false,
    showYouTube: true,
    videos: [
      { id: "RKuLSMLXcCE", title: "Monster Hunter Tri on Android · Download and setup" },
      { id: "3WGar102UVg", title: "The Last Hunts Before the Final Boss · Episode 7" },
    ],
    shared: {
      files: triGameFiles,
      guide: { url: guide + "#setup-guide", enabled: true },
      setup: [
        "Install the APK for your phone’s architecture. On Windows, extract the ZIP into its own folder and start the app.",
        "Choose your European/PAL RVZ or ISO. Extract ZIP or RAR game archives first.",
        "Keep the app open until the first import finishes. Leave room for the game and extracted data.",
        "Low Spec has a separate MH3_Low_Spec folder. Use save export and import to move progress between editions.",
      ].join("\n"),
    },
    releases: [
      {
        id: "android", name: "Android · 64-bit", version: "1.4-rowell.14", platform: "Android",
        requirements: "Android 10+ · ARM64 · OpenGL ES 3.0", sizeMb: 20.8, status: "published",
        createdAt: "2026-11-11T15:56:34Z", releasedOn: "2026-11-11",
        notes: "Gameplay stability update. Save in Tri before updating. Physical gameplay testing is pending.",
        features: ["English settings", "Touch & combo controls", "Solo speed up to 1.5×"],
        releaseNotesUrl: "https://github.com/Dling11/monster_hunter_tri_emulator/releases/tag/rowell-1.4.14",
        download: { url: triRelease + "MH3_Rowell_Dev-arm64.apk", enabled: true, label: "Download 64-bit APK" },
        guide: { url: guide + "#setup-guide", enabled: true },
      },
      {
        id: "low-spec", name: "Android · 32-bit Low Spec", version: "0.1-low-spec.2", platform: "Android",
        requirements: "Android 10+ · ARMv7 · OpenGL ES 3.0", sizeMb: 20.4, status: "published",
        createdAt: "2026-11-09T23:33:16Z", releasedOn: "2026-11-10",
        notes: "Experimental build. Requires 32-bit app support. Physical-phone performance is still being tested.",
        features: ["30 FPS default", "Lower resolution", "Separate app and saves"],
        download: { url: "https://rowell-mode-app.vercel.app/download/mh-tri-low-spec/android", enabled: true, label: "Download 32-bit APK" },
        guide: { url: guide + "#setup-guide", enabled: true },
      },
      {
        id: "windows", name: "Windows · 64-bit", version: "1.4-rowell.14", platform: "Windows",
        requirements: "Windows 10/11 · x64", sizeMb: 20.2, status: "published",
        createdAt: "2026-11-11T15:56:34Z", releasedOn: "2026-11-11",
        notes: "Extract the ZIP into its own folder, then open the app. Your game image is separate.",
        features: ["Keyboard controls", "Editable key bindings", "Portable ZIP"],
        download: { url: triRelease + "MH3-Rowell-Windows-x64.zip", enabled: true, label: "Download Windows ZIP" },
        guide: { url: guide + "#setup-guide", enabled: true },
      },
    ],
  },
  {
    slug: "monster-hunter-3-ultimate", title: "Monster Hunter 3 Ultimate", category: "Monster Hunter",
    summary: "Native Android installer, game files, and setup guide.",
    description: "Install the community Native port by khorne-hub, then choose the folder containing your extracted USA game image.",
    cover: "/art/mh3u-logo.webp", icon: "/art/mh3u-logo.webp", status: "published", featured: false,
    videos: [{ id: "DmghTKJ4MIY", title: "MH3U Native · Day 1 on Android and PC" }],
    releases: [{
      id: "android", name: "MH3U Native", version: "1.0.2.1", platform: "Android",
      requirements: "Android 9+ · ARM64 · Vulkan", sizeMb: 8.7, status: "published",
      createdAt: "2026-11-23T16:56:25Z", releasedOn: "2026-11-24",
      notes: "Updating from 1.0.2? Install over your existing official app and keep using your current game code.",
      download: {
        url: "https://github.com/khorne-hub/3u-native/releases/download/v1.0.2.1/MH3U-1.0.2.1.apk",
        enabled: true, label: "Download Android APK",
      },
      files: [{
        id: "game-data", label: "Open MH3U game file", description: "USA · 3DS · Romsfun", enabled: true,
        url: "https://romsfun.com/download/monster-hunter-3-ultimate-2-1-42910/2",
      }],
      guide: { url: guide + "mh3u/", enabled: true },
      setup: [
        "Install the APK and extract your compatible USA 3DS game if it is in an archive.",
        "Open the app, allow file access, and select the folder containing your .3ds or .cci image.",
        "Choose Build on this phone → Build. Keep internet access on for the first tool download, then tap Play after the build.",
      ].join("\n"),
    }],
  },
  {
    slug: "monster-hunter-4-ultimate", title: "Monster Hunter 4 Ultimate", category: "Monster Hunter",
    summary: "Two Android editions with separate setup guides.",
    description: "Choose the Native port by khorne-hub or the customized AzaharPlus edition. Each has its own installer and setup guide.",
    cover: "/art/mh4u-gameplay.webp", icon: "/art/mh4u-logo.jpg", status: "published", featured: false,
    editions: [
      {
        id: "mh4u-native", label: "Native port", preview: "/art/mh4u-gameplay.webp",
        previewAlt: "MH4U Native gameplay with gold touch controls",
      },
      {
        id: "mh4u-azahar", label: "Customized Azahar", preview: "/art/mh4u-azahar-gameplay.webp",
        previewAlt: "Customized Azahar gameplay with teal touch controls",
      },
    ],
    videos: [
      { id: "b27ig-mL-fA", edition: "mh4u-azahar", title: "MH4U Azahar · Gameplay, menus, and controls" },
      { id: "gXAe833ctis", edition: "mh4u-native", title: "MH4U Native · Kecha Wacha and Tetsucabra" },
    ],
    releases: [
      {
        id: "android", edition: "mh4u-native", name: "MH4U Native", version: "1.0.1.1", platform: "Android",
        requirements: "Android 9+ · ARM64 · Vulkan", sizeMb: 7.7, status: "published",
        createdAt: "2026-11-18T01:47:22Z", releasedOn: "2026-11-18",
        notes: "Community native port by khorne-hub. This build includes a gathering crash fix and the lighter Brick graphics mode.",
        download: { url: "https://github.com/khorne-hub/4u-native/releases/download/v1.0.1.1/MH4U-1.0.1.1.apk", enabled: true, label: "Download Native APK" },
        files: [{
          id: "game-data", label: "Open Native game files",
          description: "USA game and matching files · APKVision archive page", enabled: true,
          url: "https://apkvision.org/games/monster-hunter-4-ultimate-135599/download/v0.1.8-obb/",
        }],
        guide: { url: guide + "mh4u/#mh4u-setup-guide", enabled: true },
        setup: [
          "Install the Native APK. For updates, back up your save and install over your existing Native app.",
          "Extract your compatible game files and select the extracted game folder when prompted.",
          "If the app asks for a matching code library, follow the Build on this phone prompt.",
        ].join("\n"),
      },
      {
        id: "azahar", edition: "mh4u-azahar", name: "MH4U · Customized Azahar", version: "1.0.17", platform: "Android",
        requirements: "Android 10+ · ARM64 · Vulkan", sizeMb: 16.3, status: "published",
        createdAt: "2026-11-10T12:39:32Z", releasedOn: "2026-11-10",
        notes: "Customized AzaharPlus build with a touch interface. It appears as Monster Hunter 4 on Android.",
        download: { url: "https://github.com/Dling11/MH4-ULTIMATE/releases/download/rowell-1.0.17/Monster-Hunter-4-1.0.17.apk", enabled: true, label: "Download Azahar APK" },
        files: [
          {
            id: "game-data", label: "Open Azahar game files on Ziperto",
            description: "USA image · three matching archive parts", enabled: true,
            url: "https://www.ziperto.com/monster-hunter-4-ultimate-3ds-decrypted-rom/",
          },
          {
            id: "game-alternate", label: "Open Azahar game file on Romsfun",
            description: "Alternative download · single USA archive", enabled: true,
            url: "https://romsfun.com/download/monster-hunter-4-ultimate-72059-42763/2",
          },
        ],
        guide: { url: guide + "mh4u/#mh4u-azahar", enabled: true },
        setup: [
          "Install the customized APK and open Monster Hunter 4.",
          "Tap Add game and select your decrypted USA .3ds, .cci, or .cxi image.",
          "You can also import a supported ZIP or 7Z. Extract split archives before importing.",
        ].join("\n"),
      },
    ],
  },
];
