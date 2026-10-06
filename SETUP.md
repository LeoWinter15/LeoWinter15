# GitHub 个人主页动态组件

## 参考项目的实现

参考：[RamessesN/RamessesN](https://github.com/RamessesN/RamessesN)。

- 开头是 [Readme Typing SVG](https://github.com/DenverCoder1/readme-typing-svg) 提供的 SVG 打字动画。它在打开页面后按时间逐字显示、删除并轮播句子，不是根据早晚更换问候语，也不需要在 README 中执行 JavaScript。
- Personal Status 是 [GitHub Profile 3D Contrib](https://github.com/yoshi389111/github-profile-3d-contrib) 生成的贡献图。参考仓库每天 16:00 UTC 通过 Actions 更新，`picture` 标签选择浅色的 `profile-season-animate.svg` 或深色的 `profile-night-rainbow.svg`。

## 本仓库的配置

- 动画轮播 `Hi there! I'm Winter`、`A passionate Python developer`、`Nice to meet you!`，每句动画时长 3200 ms，停顿 1200 ms。原有个人介绍、联系方式和技术图标保留。
- 使用服务文档中的 `size=28` 和 `weight=600` 参数；参考 README 的 `fontSize` / `fontWeight` 不是这里沿用的参数。
- 图表用户由 `github.repository_owner` 自动确定，在本仓库为 `LeoWinter15`。
- 贡献日历、贡献总数与语言贡献统计均使用最近六个自然月，按 UTC 每天滚动，包含起始日与当日。例如 2026-10-06 显示 2026-04-06 至 2026-10-06；月底按目标月份最后一天截断。星标与 Fork 数仍为仓库总量。
- 移除了 Commit / Issue / PullReq / Review / Repo 雷达图；语言图移至右上方，半年日历按周数适配画布宽度，保留深浅配色与动画。
- 每天 16:17 UTC 更新，也支持手动触发；向 `main` 推送 README、工作流或 `scripts/` 变动会立即触发。排队和缓存可能使实际刷新稍有延迟。
- checkout、setup-node 和上游生成器均固定到已核实的版本提交。自动提交只包含 README 使用的两张图；生成失败会停止，不会把失败当作“没有变化”。
- 两张 SVG 已由首次成功的工作流替换为真实贡献图，后续运行会自动更新。
- 图片采用 `raw.githubusercontent.com/.../refs/heads/main/...` 的完整地址，直接跟随主分支更新。

## 发布与首次生成

在此文件夹打开终端，将这些文件提交并推送至 `LeoWinter15/LeoWinter15` 的 `main` 分支：

```powershell
git add README.md SETUP.md .gitignore .github/workflows/profile-3d.yml scripts profile-3d-contrib
git commit -m "Show six months of contributions without radar chart"
git push origin main
```

推送后访问 [Actions](https://github.com/LeoWinter15/LeoWinter15/actions/workflows/profile-3d.yml)，确认 `GitHub-Profile-3D-Contrib` 成功。若没有自动启动，在 `main` 分支点击 **Run workflow**。生成提交完成后，GitHub 主页会显示贡献图；缓存可能需要几分钟刷新。

工作流使用 GitHub 自动提供的 `GITHUB_TOKEN`，无需额外设置个人访问令牌。如果仓库禁用了 Actions，需要先在 Actions 页面启用；如果组织策略或分支保护阻止机器人写入 `main`，需要按仓库规则允许工作流更新生成图片后重新运行。

## 修改文字与样式

编辑 `README.md` 顶部图片 URL：`lines` 中用分号分隔句子、`+` 表示空格；`duration` 和 `pause` 单位为毫秒；`size` 控制字号，`width` 需足够容纳最长一句。HTML 属性中的参数分隔符使用 `&amp;`。

打字动画依赖外部 SVG 服务；服务不可用时会显示替代文字。贡献图生成后随仓库存储，更新失败时保留上次成功的图表。

## 半年图表的自动生成

原生成器 v0.9.3 不提供关闭雷达图或自定义月数的配置，所以工作流先检出固定源码，再执行 `scripts/customize-generator.py` 做限定修改。脚本核对预期源码片段；遇到不匹配就失败，避免上游变动导致悄悄生成错误图片。

`scripts/profile-period.ts` 计算半年范围，生成器使用该范围请求 GitHub GraphQL 的 `contributionsCollection(from, to)`。数据、总数和语言统计都来自该查询。Node.js 24 编译并运行生成器；`scripts/check-profile.cjs` 在每次生成前检查日期边界、实际查询范围、深浅图表和雷达图移除情况。

生成所需的令牌仍仅为 Actions 自带的 `GITHUB_TOKEN`，无需新增密钥。`.profile-generator/` 是工作流临时检出目录，已忽略，不应提交。

## 图片仍显示等待更新时

2026-10-06 的首次工作流已成功（[运行记录](https://github.com/LeoWinter15/LeoWinter15/actions/runs/37437515811)），生成提交为 `02f67ba`。当时 `/main/` 原图地址仍返回 857 字节的浅色临时卡片，而 `/refs/heads/main/` 地址已返回 209540 字节的真实图表。因此 README 改为使用经检查有效的完整分支原图地址。

若以后出现类似情况，先确认 Actions 成功、仓库 SVG 已更新，再检查原图地址与缓存；无需因为缓存延迟反复生成图表。当前这次链接修复也需要提交并推送 README 才会应用到线上主页。
