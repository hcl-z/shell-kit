---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "ShellKit"
  text: "提升命令行工具开发效率的工具框架"
  tagline: "快速实现命令行工具"
  image:
    src: /logo.svg
    alt: shellkit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/intro
    - theme: alt
      text: API参考
      link: /reference/config
    - theme: alt
      text: Github

features:
  - title: 标准流程定义
    details: 通过传入一个配置对象可以轻松实现标准的命令行工具
  - title: 核心工具封装
    details: 内部实现了命令行工具的核心能力
  - title: 功能简单扩展
    details: 可自定义扩展功能，快速增加应用需要的其他非核心功能
---
<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
