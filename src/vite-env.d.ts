/// <reference types="vite/client" />
declare module 'virtual:content' {
  interface RawNode { slug: string; title: string; tagline?: string; tools: string[]; bigtech?: string; body: string; file: string; children: RawNode[] }
  interface RouteStep { id: string; note?: string }
  interface RoutePhase { name: string; goal?: string; steps: RouteStep[] }
  interface Route { title: string; intro?: string; phases: RoutePhase[] }
  export const tree: RawNode
  export const route: Route
}
