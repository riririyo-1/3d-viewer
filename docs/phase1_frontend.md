# Phase 1: Frontend Development Design Document

## 1. Overview

Implementation of the initial frontend application based on `3d-viewer`.
The goal of Phase 1 is to port the UI/UX from `mockup.ts` into a clean, scalable Next.js architecture, enabling a "Visionary Geometry" experience.

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Engine**: Three.js / React Three Fiber (drei)
  - _Note: `mockup.ts` uses raw Three.js. We can continue with raw Three.js or wrap it. Given the "clean code" requirement, React Three Fiber (R3F) is often cleaner for React apps, but sticking to `mockup.ts` logic might be faster with raw Three.js in a `useEffect`. We will use raw Three.js initially to faithfully reproduce the mockup logic, wrapped in a component._
- **State Management**: React Context or Zustand (for managing "Recent" files across routes)
- **Icons**: lucide-react (from mockup)

## 3. Architecture & Directory Structure

Adhering to the user rule: `frontend/src/app`.

```
/frontend
  /public
  /src
    /app
      /layout.tsx       # Root layout (Metadata, Fonts, Global Providers)
      /page.tsx         # Home Screen
      /collection
        /page.tsx       # Collection Screen
      /viewer
        /page.tsx       # Viewer Screen (handles state via query param or store)
    /components
      /ui               # Reusable UI components (Buttons, Cards)
      /layout           # Header, Footer
      /three            # 3D Viewer components
      /features         # Feature specific components
    /lib
      /utils.ts         # Utility functions
      /store.ts         # Global state (Recent files, etc.)
    /types              # TypeScript interfaces
```

## 4. Features (Phase 1)

Scope is limited to client-side functionality (no backend communication yet).

### 4.1 Home Screen (`/`)

- "Visionary Geometry" Hero section.
- Background "Blob" animation.
- Navigation to "Collection".
- "Local Import" capability (Mock functionality).

### 4.2 Collection Screen (`/collection`)

- Grid view of 3D assets.
- "New Import" button (File upload -> Local FileReader).
- Asset persistence (Session/LocalStorage for Phase 1).

### 4.3 Viewer Screen (`/viewer`)

- 3D Canvas (Three.js).
- Controls: Wireframe, Grid, Auto-Spin.
- Lighting: Ambient, Hemisphere, Directional (PBR setup).
- File support: .obj, .glb, .gltf (via Loaders).

## 5. Implementation Steps

1.  **Project Initialization**: Setup Next.js in `frontend/`.
2.  **UI Shell**: Implement `MainHeader` and Layout.
3.  **Home Page**: Implement `HomeScreen`.
4.  **Collection Page**: Implement `CollectionScreen`.
5.  **Viewer Implementation**: Adapt `ViewerScreen` logic to a reusable component.
6.  **State Logic**: Connect pages via a Store (Zustand recommended for clean state management) to share `assets`.

## 6. Deviation from Mockup

- `mockup.ts` is a single-file React component.
- We will split this into proper Route-based architecture.
- `mockup.ts` uses `setView("home")`. We will use `router.push("/")`.
- `mockup.ts` passes state props. We will use a Store for global asset data.
