# 📘 GitHub Actions 打包 Android APK 避坑指南与标准模板

本文档整理了本项目通过 GitHub Actions + Capacitor 自动化编译 Android APK 过程中遇到的常见问题、避坑方案及标准模板，供后续开发与类似项目参考。

---

## 一、 核心避坑注意事项（必读）

### 1. Java JDK 与 Gradle / Capacitor 版本严格匹配
* **常见报错**：
  ```text
  Execution failed for task ':capacitor-android:compileDebugJavaWithJavac'.
  > Java compilation initialization error
      error: invalid source release: 21
  ```
* **原因剖析**：Capacitor 7+ 初始化生成的 Android 工程默认将编译目标（Source & Target Compatibility）设定为 **Java 21**。如果 Actions 环境中只配置了 JDK 17，编译器会直接因版本不匹配报错中断。
* **避坑法则**：统一指定使用 **JDK 21**：
  ```yaml
  - name: Set up Java JDK 21
    uses: actions/setup-java@v4
    with:
      distribution: 'temurin'
      java-version: '21'
  ```

---

### 2. 避免使用有冲突的第三方 Android SDK 安装 Action
* **常见报错**：
  ```text
  Error: The process '/usr/local/lib/android/sdk/cmdline-tools/16.0/bin/sdkmanager' failed with exit code 1
  ```
* **原因剖析**：GitHub 官方的 `ubuntu-latest` 虚拟机环境本身已经自带了完整的 Android SDK、NDK 和命令行工具链。引入第三方 Action（如 `android-actions/setup-android@v3`）反而会在拉取和在线更新组件时触发许可冲突或崩溃。
* **避坑法则**：直接使用系统预装的 `$ANDROID_HOME`，仅需一行命令静默接受许可协议：
  ```yaml
  - name: Accept Android SDK Licenses
    run: |
      yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true
  ```

---

### 3. Node 依赖安装策略（防 lock 文件缺失与 peer 依赖冲突）
* **常见报错**：
  ```text
  Dependencies lock file is not found in /home/runner/work/...
  Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
  ```
  以及：
  ```text
  npm error ERESOLVE could not resolve peer dependency
  ```
* **原因剖析**：
  - `actions/setup-node` 中的 `cache: 'npm'` 以及 `npm ci` 强依赖于仓库中必须存在 `package-lock.json`。若初次提交或跨平台未提交 lock 文件就会直接挂掉。
  - Vite、Tailwind 等前端生态在部分子版本升级时可能存在微小的 peer 依赖警告。
* **避坑法则**：
  - 移除流水线中对 `cache: 'npm'` 的硬性强校验。
  - 安装依赖时统一采用容错率极高的安全安装命令：
    ```bash
    npm install --legacy-peer-deps
    ```

---

### 4. Node.js 运行时版本建议
* **常见警告**：`Node.js 20 is deprecated... being forced to run on Node.js 24`。
* **避坑法则**：统一指定使用当前活跃的 **Node.js 22**：
  ```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: 22
  ```

---

## 二、 生产级标准工作流模板

`.github/workflows/build-apk.yml` 完整配置：

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]  # 推送代码到 main / master 分支自动触发构建
  workflow_dispatch:            # 允许在 GitHub 网页界面手动点击 "Run workflow"

jobs:
  build-apk:
    name: Build & Package Android APK
    runs-on: ubuntu-latest

    steps:
      # 1. 检出仓库代码
      - name: Checkout Code
        uses: actions/checkout@v4

      # 2. 配置 Node.js（推荐使用 Node 22）
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      # 3. 配置 Java JDK（Capacitor 7 必须用 JDK 21）
      - name: Set up Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      # 4. 自动同意系统预装 Android SDK 许可
      - name: Accept Android SDK Licenses
        run: |
          yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true

      # 5. 安全安装 Web 前端依赖
      - name: Install Dependencies
        run: npm install --legacy-peer-deps

      # 6. 编译前端静态资源（生成 dist 文件夹）
      - name: Build Web Application
        run: npm run build

      # 7. 初始化或同步 Capacitor Android 原生工程
      - name: Initialize & Sync Capacitor Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      # 8. 使用 Gradle 编译 Debug APK
      - name: Build Debug APK with Gradle
        run: |
          cd android
          chmod +x ./gradlew
          ./gradlew assembleDebug --stacktrace

      # 9. 上传产物至 Actions Artifacts 供下载
      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: enterprise-oa-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14
```

---

## 三、 提交 Git 时的检查清单（Checklist）

每次迭代前端代码后，在执行 `git push` 前快速自检：

- [x] **1. `capacitor.config.json` 存在且配置无误**：
  - 确认 `webDir` 与构建生成目录一致（本项目为 `"dist"`）。
  - 确认 `appId`（如 `com.enterprise.oa`）符合包名规范。
- [x] **2. 依赖声明完备**：
  - 确认 `package.json` 的 `dependencies` 包含 `@capacitor/core`、`@capacitor/android`，`devDependencies` 包含 `@capacitor/cli`。
- [x] **3. 产物忽略配置规范**：
  - 检查 `.gitignore` 已排除编译过程目录（如 `android/app/build/`、`android/.gradle/`、`dist/`）。
  - **切勿**忽略配置文件（如 `capacitor.config.json`、`.github/workflows/`）。

---

## 四、 APK 下载与安装指引

1. 打开 GitHub 仓库页面，点击上方的 **Actions** 菜单。
2. 在左侧列表中选中 **Build Android APK**，点击最新一条运行记录。
3. 等待所有步骤变绿（通常耗时约 2~3 分钟）。
4. 页面滚动到底部的 **Artifacts** 区域，点击 **`enterprise-oa-debug-apk`** 即可下载压缩包。
5. 解压后得到的 `app-debug.apk` 发送到手机即可直接安装测试。
