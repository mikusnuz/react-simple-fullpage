# react-simple-fullpage

[![npm version](https://img.shields.io/npm/v/react-simple-fullpage.svg?style=flat-square)](https://www.npmjs.com/package/react-simple-fullpage)
[![npm downloads](https://img.shields.io/npm/dm/react-simple-fullpage.svg?style=flat-square)](https://www.npmjs.com/package/react-simple-fullpage)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-simple-fullpage?style=flat-square)](https://bundlephobia.com/package/react-simple-fullpage)
[![license](https://img.shields.io/npm/l/react-simple-fullpage.svg?style=flat-square)](https://github.com/mikusnuz/react-simple-fullpage/blob/main/LICENSE)

> A lightweight, zero-dependency fullpage scrolling component for React applications with built-in gesture recognition and optimized scroll mechanics.

## 📦 Installation

```bash
# npm
npm install react-simple-fullpage

# yarn
yarn add react-simple-fullpage

# pnpm
pnpm add react-simple-fullpage
```

## 🚀 Features

- 🔄 Smooth section transitions
- 👆 Touch gesture support
- ↔️ Supports vertical and horizontal scrolling
- 🔢 Pagination dots with customization
- 🪶 Lightweight
- ⚡ No dependencies, just React

## 🛠️ Usage

```jsx
import React from "react";
import FullPage from "react-simple-fullpage";

const App = () => (
  <FullPage
    scrollingSpeed={1000}
    direction="vertical"
    showDotsAlways={true}
    dotColor="#333"
    activeDotColor="#ff6600"
    dotSize={10}
  >
    <FullPage.Section>
      <h1>Welcome to my website</h1>
      <p>Scroll down to explore more</p>
    </FullPage.Section>

    <FullPage.Section>
      <h1>About me</h1>
      <p>This is the second section</p>
    </FullPage.Section>

    <FullPage.Section>
      <h1>Contact</h1>
      <p>Reach out to me</p>
    </FullPage.Section>
  </FullPage>
);

export default App;
```

## ⚙️ API Reference

### `<FullPage>` Props

| Prop             | Type                         | Default      | Description                                                                                      |
| ---------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `scrollingSpeed` | `number`                     | `1000`       | Duration of scroll transition in milliseconds                                                    |
| `direction`      | `"vertical" \| "horizontal"` | `"vertical"` | Sets the scroll direction                                                                        |
| `showDotsAlways` | `boolean`                    | `true`       | When `true`, pagination dots are always visible. When `false`, dots appear only during scrolling |
| `dotColor`       | `string`                     | `"#aaa"`     | Color of inactive pagination dots                                                                |
| `activeDotColor` | `string`                     | `"#000"`     | Color of the active pagination dot                                                               |
| `dotSize`        | `number`                     | `10`         | Size of pagination dots in pixels                                                                |
| `children`       | `node`                       | Required     | Section components to be rendered                                                                |

### `<FullPage.Section>` Props

| Prop        | Type     | Default  | Description                               |
| ----------- | -------- | -------- | ----------------------------------------- |
| `className` | `string` | `""`     | Additional CSS class for the section      |
| `children`  | `node`   | Required | Content to be rendered within the section |

## 🧪 Browser Support

- Chrome/Edge 60+
- Firefox 54+
- Safari 10.1+
- iOS Safari 10.3+
- Android Browser 67+

## 📄 License

MIT © [mikusnuz]
