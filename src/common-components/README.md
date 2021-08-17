# common-bussiness-components
前端公共业务组件基础库

## 组件编写规范
- 统一命名空间 common-xxx  如 common-collapse-btns
- 单个公用业务组件尽量 **单独提交** commit，须并经过1~2次 code-review 之后再合并到主分支
- 每个组件一个文件夹，所有相关资源全部放在当前文件夹内，结构自定，内部添加`index.js`便于外部引入
- 如果自带 service，需提供 props 配置以替换自带service
- 文档可参照common-collapse-btns的文档样式编写(业务项目中无法运行)，后续由专人推送到文档分支后更新在线文档
- 目录结构：

```
├── common-bussiness-components                                 // 业务组件总文件夹
│   ├── common-collapse-btns                    // 文件夹       
│   │   ├── common-collapse-btns.vue            // 组件文件
│   │   ├── common-collapse-btns.service.js     // 组件 service
│   │   ├── index.js                            // 主文件
│   │   ├── README.md                           // 组件文档

```

## 分支约定
 - 子工程以分支进行项目管理，一个大项目为一个命名空间分支，并对应相应版本，比如 all-in-web-v1.0
 - 当第一个版本稳定以后，择机合并至 master ，未来别的项目版本稳定并可以兼容以前版本的时候，可能考虑合并至 master，或者迁移部分独立组件至 master
 - 新项目，从 master，或者某个公用度较高的其它分支 拉取对应分支作为 项目主分支

## 开发流程

### 普通开发者

按照普通git流程，在业务工程项目中（比如昆仑2.0），拉分支开发并mr到业务工程的主开发分支即可。

### 子仓库维护者(每个项目需指定一名同步对接人)
注：如下步骤只需在业务工程中操作，普通开发者无需操作

- remote: common-components
- prefix: src/common-components
- branch: 一体化分支 all-in-web-v1.0
- split-branch: split-dev

### 基本命令

#### 添加 subtree (如果项目已添加，忽略此步骤)
```javascript
// 配置远程仓库服务器别名
git remote add <remote> git@git-pd.megvii-inc.com:ai-guardians/sst-fe/all-in/common-business-components.git

// 拉取更新 可在add时添加 -f参数省略如下步骤
git fetch <remote>

// prefix 配置子仓库别名  remote 远程服务器别名  branch 分支
git subtree add --prefix=<prefix> <remote> <branch>
```

#### 拉取更新
```js
git subtree pull --prefix=<prefix> <remote> <branch>
```

#### 更新子仓库
```js
git subtree push --prefix=<prefix> <remote> <branch>
```

#### 高阶推送: 设置遍历新起点
```javascript
git subtree split [--rejoin] --prefix=<prefix> --branch <split-branch>
```

### 子工程同步流程（当前最保险同步方式）

#### 业务工程同步到子仓库
 - ps: 一体化 子工程 主分支 为 `all-in-web-v1.0`， 业务工程 主开发分支 一般为 `dev`
 - 1、从业务工程主开发分支(或和主分支代码已同步的分支) push 到 子工程的 非主分支（命名自拟）[必须]，比如推送到 all-in-web-sutb-sync。
 - m、此步骤单独针对慧寻工程：将慧寻推送后的分支中，和主分不同的新提交 cherry-pick 至 由主分支 checkout 的新分支 [可找荀鹤协助完成]
 - 2、子仓库提交 mr 到主分支，子仓库管理员(荀鹤) 进行 code-review 并合并。
 - 意义： 1、保证提交为当前工程最新，2、避免同步内容有误影响 子仓库 主分支。

 #### 子仓库同步到业务工程[建议]
 - ps: 一体化 子工程 主分支 为 `all-in-web-v1.0`， 业务工程 主开发分支 一般为 `dev`
 - 1、从业务工程主开发分支 checkout 一个分支，去 pull 子仓库的 主分支。
 - 2、业务工程 提交 mr 到 主开发分支，业务开发管理员 进行 code-review 并合并。
 - 意义：1、保证同步时，当前业务代码为最新，能尽早发现冲突 2、避免同步内容有误影响 业务工程 主分支。

### 可能出现的情况
 - 子仓库 mr 的时候提示冲突， 解决方式：先执行上面的 `子仓库同步到业务工程` 流程 ，再执行 `业务工程同步到子仓库` 流程
 - `子仓库同步到业务工程` 过程中产生冲突，这是正常现象，如果当前业务工程有导致冲突的修改，则会冲突，参照正常开发中产生冲突的方式解决即可，解决完成后，未来推送子仓库之后，别的工程拉子仓库可能还会产生冲突，也按正常开发中产生冲突的方式解决。【ps: 一般公用的业务组件，最好由某个人开发并维护，有需求提到对应的人并修复，当不同人修改发生冲突，最好互相拉通对一下，避免错改影响别的工程】
 - 业务工程出现重复的 commit 记录，如果业务组件在某业务工程中开发， 当同步到子工程的时候，会把每个commit提出来产生新的commit，当二次从子工程同步到当前业务工程的时候，会出现相同 msg 不同 commitId 的记录，这种重复是 subtree 同步正常现象。 子工程的 mr 也会在同步到业务工程的时候产生一个新的重复 commit。都是正常现象。
 - subtree 封装了git 的原始指令，所以具体操作是黑盒，如果不按照上诉同步方式同步，则可能产生不可预料的问题，建议大家严格按照上述同步流程同步代码。


### 快捷配置

 - 可修改项目的 `.git/config` 文件 添加命令别名，然后就可以使用 `git sph <branch>` 推送了
 - 如果使用 spp 先pull 后 push，建议在非 dev 上进行

```javascript
[alias]
	spl = !git subtree pull --prefix=src/common-components common-components $1 \
		&& :
	sph = !git subtree push --prefix=src/common-components common-components $1 \
		&& :
	spp = !git subtree pull --prefix=src/common-components common-components $1 \
		&& git subtree push --prefix=src/common-components common-components $1 \
		&& :
```