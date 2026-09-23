<script setup lang="ts">
export type IconName =
  | 'logo' | 'search' | 'edit' | 'user' | 'maximize' | 'minimize' | 'broken-chain'
  | 'padlock' | 'bookmark' | 'upvote' | 'downvote' | 'share' | 'facebook' | 'twitter'
  | 'linkedin' | 'email' | 'placeholder' | 'back-arrow' | 'globe' | 'tag' | 'clock'
  | 'reply' | 'flag' | 'comment' | 'stats' | 'check' | 'archive' | 'uparrow'
  | 'downarrow' | 'inbox' | 'warning' | 'shield' | 'fail' | 'instagram' | 'tiktok'
  | 'whatsapp' | 'phone' | 'website' | 'filter' | 'home'

const props = defineProps<{
  name: IconName
  size?: number
}>()

interface IconConfig {
  viewBox: string
  class?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeLinecap?: string
  strokeLinejoin?: string
  width?: string
  height?: string
  style?: string
  paths: Array<{
    d?: string
    cx?: number
    cy?: number
    r?: number
    ry?: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    x?: number
    y?: number
    width?: number
    height?: number
    rx?: number
    points?: string
    type?: 'path' | 'circle' | 'line' | 'rect' | 'polyline' | 'g'
    fill?: string;        // Add this
  stroke?: string;      // Optional: add stroke if needed
  strokeWidth?: number; // Optional: add stroke-width if needed
  }>
}

const icons: Record<IconName, IconConfig> = {
  logo: {
    viewBox: '0 0 789 172',
    fill: 'currentColor',
    width:"180",
    height:"40",
    style:"max-width: 100%; height: auto;",
    paths: [{ d: 'M374 7c-3 15-25 18-41 6l-4-3-23 14-23 15v33l11 7 11 8-9 11a65 65 0 0 0-20 28c-8 32 30 54 65 37q14-8 21-20 5-14-5-3-6 9-19 13c-7 3-28 4-36 2q-20-4-22-17-1-14 22-13 14 1 24 9l5 4 23-14 22-14V68l-4-3-19-10q-2 0 8-10 18-19 18-37 1-5-2-4-3 0-3 3m-60 42v17l-4-3-5-3V46c0-12 0-14 2-16q1-1 4 1l3 1zm13-11c8 3 24 3 30 0l5-2-3 4-5 6-17 14c-12 12-13 12-15 11l-3-1V53l1-17zm10 34 3 1v18l-1 19-8-2c-6-2-8-2-18-2-10-1-12 0-16 2l-6 2 27-26 16-14zm17 27c0 17-1 19-2 20l-5-2-3-2V75l5 3 5 2zM43 11c-9 4-21 15-26 23Q4 55 5 81c1 14 3 21 8 32q13 24 37 29c24 5 56-21 67-53 3-10 4-25 2-35q-5-15-15-28c-6-6-16-14-21-15L59 21l-24 9c0-1 6-10 12-15q5-5 4-6c0-3 0-3-8 2m27 65v48h-6q-11-1-20-10c-6-5-13-15-12-17l16-8 15-6V24l4 2 3 1zm13-39c5 4 13 15 14 19q2 1-11 7l-11 6V50c0-22-1-21 8-13M41 61v26l-5 2-6 2-3-7c-2-7-2-24 0-33q2-14 8-15c6-3 6-4 6 25m60 6 1 5-26 14-1-6 1-5 11-6 12-6zm0 32q-6 17-21 23l-5 2V92l14-7 13-7 1 7zm476-80-14 11 2 2 4 4c2 2 2 4 2 42v40l-5 4q-6 3-5 5 0 2 5-1l3-1 12 7 13 8 18-11 19-10V68l-8-7-9-8-10 7-10 6-1-28-1-28-15 10m29 53 5 6v47l-2-1-9-6-7-3V73l3-3 5-2zm-75-54-8 7-4 4 5 6 7 8 2 2 8-7 8-7-7-7-7-8zm189 12c0 14 0 15 2 14l9 7 8 7-10 6-10 6v52l10 7 13 8c1 1 5-1 20-10l18-10V70l4-2q4-3 1-5 0-3-4 1-3 3-5 1l-55-48q-1-3-1 14m38 70v25l-8-6-9-5V61l9 8 8 7zM230 53l-13 15 2 1 4 3c2 2 2 3 2 23v21l-5 4-5 3v2q1 3 4 0l3-2 9 8 9 7 11-6q14-6 11-7 0-3-4 0-3 2-7-3l-4-4V68l7-1c6 0 6 0 9-4l4-5h-20v-9q1-12-2-10zm175 9-16 9-1 25v25l13 9c12 8 13 8 15 7 4-2 24-20 24-21q0-3-7 1-4 3-7 3-8-1-14-7l-2-3V67l8 6q7 6 8 4l14-11-18-14zm77-3-6 7-6-7-6-6-21 14v2q1 3 4 0l4-2 2 3 3 4v44l-5 3-5 5q0 3 5 0l3-1 9 7 9 7 12-9c12-9 13-9 11-11q0-3-7 2l-3 2-4-2-3-3V70l5 3q21 9 26-16l-1-5-5 2q-6 5-12 0l-3-2zm-347 1q-12 8-10 8h3q4-3 9 1l2 24v22l-3 2-2 3 2 2 12 10 8 7 10-8q13-11 12-5c0 5 7 12 11 12l11-7q12-6 9-8-1-3-5 0-6 5-7-4V67l3-2q4-3 2-5l-1-2-3 2c-4 3-3 3-11-4l-3-3-8 7-8 7 5 4 4 4v43l-4 2-4 3-5-4-5-5V90c-1-23-1-23-3-28l-7-7-4-2zm387 0c-13 8-13 8-11 9q0 3 4 0l4-2 2 3 3 4v44l-5 4-5 4q0 3 5 0l3-1 7 7 9 6 22-18q-2-2-6 1l-4 2-2-2-3-2V68l-6-7-7-8zm145 3-19 10v23l-1 22-4 3q-4 3-2 5t5-1l4-3 13 9 12 8 34-27-1-3q0-2-9 5l-9 7q0 2-11-6c-10-6-10-7-10-10v-4l18-11 18-11-2-3-8-13-7-10zm10 10 6 9 2 3-8 5-8 5V67q3-4 8 6' }]
  },
  search: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'circle', cx: 11, cy: 11, r: 8 },
      { type: 'line', x1: 21, y1: 21, x2: 16.65, y2: 16.65 }
    ]
  },
  edit: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M12 20h9' },
      { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' }
    ]
  },
  user: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
      { type: 'circle', cx: 12, cy: 7, r: 4 }
    ]
  },
  maximize: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M8 8h8v8H8z' },
      { d: 'M16 8h6' },
      { d: 'M16 16h6' },
      { d: 'M8 8V2' },
      { d: 'M8 16v6' }
    ]
  },
  minimize: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M4 4h16v16H4z' },
      { d: 'M2 4h2' },
      { d: 'M2 20h2' },
      { d: 'M20 4h2' },
      { d: 'M20 20h2' }
    ]
  },
  'broken-chain': {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M10 9H8C6.34315 9 5 10.3431 5 12C5 13.6569 6.34315 15 8 15H9M9 15L12 12M9 15L5 19M14 9H15M15 9L19 5M15 9L12 12M14 15H16C17.6569 15 19 13.6569 19 12C19 11.1716 18.6642 10.4216 18.1213 9.87868M8 12H12M15 12H16' }]
  },
  padlock: {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M24,25.28a3.26,3.26,0,0,0-1.64,6.07V36h3.32V31.35a3.28,3.28,0,0,0,1.61-2.8v0A3.27,3.27,0,0,0,24,25.28Z' },
      { type: 'rect', x: 7.38, y: 17.77, width: 33.23, height: 25.73, rx: 4.32 },
      { d: 'M13.35,17.77V15.16a10.66,10.66,0,0,1,21.32,0v2.61' }
    ]
  },
  bookmark: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' }]
  },
  upvote: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z' }]
  },
  downvote: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M17.0001 2V13M22.0001 9.8V5.2C22.0001 4.07989 22.0001 3.51984 21.7821 3.09202C21.5903 2.71569 21.2844 2.40973 20.908 2.21799C20.4802 2 19.9202 2 18.8001 2H8.11806C6.65658 2 5.92584 2 5.33563 2.26743C4.81545 2.50314 4.37335 2.88242 4.06129 3.36072C3.70722 3.90339 3.59611 4.62564 3.37388 6.07012L2.8508 9.47012C2.5577 11.3753 2.41114 12.3279 2.69386 13.0691C2.94199 13.7197 3.4087 14.2637 4.01398 14.6079C4.70358 15 5.66739 15 7.59499 15H8.40005C8.96011 15 9.24013 15 9.45404 15.109C9.64221 15.2049 9.79519 15.3578 9.89106 15.546C10.0001 15.7599 10.0001 16.0399 10.0001 16.6V19.5342C10.0001 20.896 11.104 22 12.4659 22C12.7907 22 13.0851 21.8087 13.217 21.5119L16.5778 13.9502C16.7306 13.6062 16.807 13.4343 16.9278 13.3082C17.0346 13.1967 17.1658 13.1115 17.311 13.0592C17.4753 13 17.6635 13 18.0398 13H18.8001C19.9202 13 20.4802 13 20.908 12.782C21.2844 12.5903 21.5903 12.2843 21.7821 11.908C22.0001 11.4802 22.0001 10.9201 22.0001 9.8Z' }]
  },
  share: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'circle', cx: 18, cy: 5, r: 3 },
      { type: 'circle', cx: 6, cy: 12, r: 3 },
      { type: 'circle', cx: 18, cy: 19, r: 3 },
      { type: 'line', x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 },
      { type: 'line', x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 }
    ]
  },
  twitter: {
    viewBox: '0 0 32 32',
    class: 'filled twitter',
    paths: [{ d: 'M18.3055 13.8561L28.505 2H26.088L17.2318 12.2945L10.1584 2H2L12.6964 17.5671L2 30H4.41709L13.7695 19.1287L21.2396 30H29.3979L18.3049 13.8561H18.3055ZM14.995 17.7042L13.9112 16.1541L5.288 3.81955H9.00051L15.9595 13.7739L17.0433 15.324L26.0892 28.2632H22.3767L14.995 17.7048V17.7042Z' }]
  },
  facebook: {
    viewBox: '0 0 32 32',
    class: 'filled facebook',
    paths: [{ d: 'M11.837 7.423v3.855H9v4.713h2.837V30h5.827V15.991h3.912s.365-2.259.542-4.73h-4.431V8.038c0-.482.635-1.131 1.264-1.131h3.174V2h-4.317c-6.115 0-5.971 4.718-5.971 5.423Z' }]
  },
  linkedin: {
    viewBox: '0 0 32 32',
    class: 'filled linkedin',
    paths: [{ d: 'M30 29.921h-5.783v-9.053c0-2.16-.04-4.936-3.005-4.936-3.011 0-3.472 2.353-3.472 4.78v9.21h-5.783V11.305h5.552v2.542h.075c.774-1.463 2.66-3.007 5.476-3.007 5.86 0 6.94 3.857 6.94 8.868v10.212ZM5.438 8.711a3.356 3.356 0 1 1-.164-6.71 3.356 3.356 0 0 1 .164 6.71ZM2.54 29.921h5.788V11.306H2.54V29.92Z' }]
  },
  email: {
    viewBox: '0 0 24 24',
    class: 'filled email',
    paths: [{ d: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z' }]
  },
  placeholder: {
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M60,0H4C1.789,0,0,1.789,0,4v56c0,2.211,1.789,4,4,4h56c2.211,0,4-1.789,4-4V4C64,1.789,62.211,0,60,0z M8,8h48v32.688l-9.113-9.113c-1.562-1.559-4.094-1.559-5.656,0L16.805,56H8V8z' },
      { type: 'circle', cx: 24, cy: 24, r: 8, fill: 'currentColor' }
    ]
  },
  'back-arrow': {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M15 18L9 12L15 6' }]
  },
  globe: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'circle', cx: 12, cy: 12, r: 10 },
      { d: 'M2 12h20' },
      { d: 'M12 2a15.3 15.3 0 0 1 0 20' },
      { d: 'M12 2a15.3 15.3 0 0 0 0 20' }
    ]
  },
  tag: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'rect', x: 3, y: 3, width: 7, height: 7 },
      { type: 'rect', x: 14, y: 3, width: 7, height: 7 },
      { type: 'rect', x: 3, y: 14, width: 7, height: 7 },
      { type: 'rect', x: 14, y: 14, width: 7, height: 7 }
    ]
  },
  clock: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' }]
  },
  reply: {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M4.687 11.119l9.287 8.933v-5.412c2.813 0 9.973 0.062 9.973 7.426 0 3.855-2.734 7.072-6.369 7.816 5.842-0.792 10.359-5.747 10.359-11.806 0-11.256-12.026-11.352-13.963-11.352v-4.606l-9.287 9.001z' }]
  },
  flag: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M5.75 1C6.16421 1 6.5 1.33579 6.5 1.75V3.6L8.22067 3.25587C9.8712 2.92576 11.5821 3.08284 13.1449 3.70797L13.3486 3.78943C14.9097 4.41389 16.628 4.53051 18.2592 4.1227C19.0165 3.93339 19.75 4.50613 19.75 5.28669V12.6537C19.75 13.298 19.3115 13.8596 18.6864 14.0159L18.472 14.0695C16.7024 14.5119 14.8385 14.3854 13.1449 13.708C11.5821 13.0828 9.8712 12.9258 8.22067 13.2559L6.5 13.6V21.75C6.5 22.1642 6.16421 22.5 5.75 22.5C5.33579 22.5 5 22.1642 5 21.75V1.75C5 1.33579 5.33579 1 5.75 1Z' }]
  },
  comment: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }]
  },
  stats: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'line', x1: 3, y1: 21, x2: 21, y2: 21 },
      { type: 'line', x1: 3, y1: 21, x2: 3, y2: 3 },
      { type: 'rect', x: 6, y: 14, width: 3, height: 7 },
      { type: 'rect', x: 11, y: 10, width: 3, height: 11 },
      { type: 'rect', x: 16, y: 6, width: 3, height: 15 }
    ]
  },
  check: {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M16 2 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 M28 10' },
      { d: 'M9 17l4 4L23 11' }
    ]
  },
  home: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5z' }
    ]
  },
  archive: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8' },
      { type: 'rect', x: 1, y: 3, width: 22, height: 5, rx: 1 },
      { type: 'line', x1: 10, y1: 12, x2: 14, y2: 12 }
    ]
  },
  uparrow: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M12 4l-8 8h6v8h4v-8h6z' }]
  },
  downarrow: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M12 20l8-8h-6V4h-4v8H4z' }]
  },
  inbox: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'polyline', points: '22 12 16 12 14 15 10 15 8 12 2 12' },
      { d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }
    ]
  },
   filter: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    paths: [
      { type: 'polyline', points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }
    ]
  },
  warning: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [{ d: 'M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2V10z' }]
  },
  shield: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { d: 'M12 8v4' },
      { d: 'M12 16h.01' }
    ]
  },
  fail: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'circle', cx: 12, cy: 12, r: 10 },
      { type: 'line', x1: 12, y1: 8, x2: 12, y2: 12 },
      { type: 'line', x1: 12, y1: 16, x2: 12.01, y2: 16 }
    ]
  },
  // 🌟 Newly Added Icons
  instagram: {
    viewBox: '0 0 24 24',
    class: 'filled instagram',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'rect', x: 2, y: 2, width: 20, height: 20, rx: 5, ry: 5 },
      { type: 'path', d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' },
      { type: 'line', x1: 17.5, y1: 6.5, x2: 17.51, y2: 6.5 }
    ]
  },
  tiktok: {
    viewBox: '0 0 24 24',
    class: 'filled tiktok',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5' }
    ]
  },
  whatsapp: {
    viewBox: '0 0 24 24',
    class: 'filled whatsapp',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' }
    ]
  },
  phone: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }
    ]
  },
  website: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    paths: [
      { type: 'circle', cx: 12, cy: 12, r: 10 },
      { type: 'line', x1: 2, y1: 12, x2: 22, y2: 12 },
      { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }
    ]
  },
  
}
</script>

<template>
  <svg
    v-if="icons[name]"
    :width="name === 'logo' ? undefined : (size || 16)"
    :height="name === 'logo' ? undefined : (size || 16)"
    :viewBox="icons[name].viewBox"
    :class="icons[name].class"
    :fill="icons[name].fill || 'currentColor'"
    :stroke="icons[name].stroke"
    :stroke-width="icons[name].strokeWidth"
    v-bind="$attrs"
  >
    <template v-for="(path, index) in icons[name].paths" :key="index">
      <circle
        v-if="path.type === 'circle'"
        :cx="path.cx"
        :cy="path.cy"
        :r="path.r"
        :fill="path.fill"
      />
      <line
        v-else-if="path.type === 'line'"
        :x1="path.x1"
        :y1="path.y1"
        :x2="path.x2"
        :y2="path.y2"
      />
      <rect
        v-else-if="path.type === 'rect'"
        :x="path.x"
        :y="path.y"
        :width="path.width"
        :height="path.height"
        :rx="path.rx"
      />
      <polyline
        v-else-if="path.type === 'polyline'"
        :points="path.points"
      />
      <path v-else :d="path.d" />
    </template>
  </svg>
</template>