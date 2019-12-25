# babel-html-cli

首先，由于 babel-runtime 的原因，为了控制 html 体积，我们不适合在 html 中编写涉及 babel-runtime 的方法，仅适合转译一些基础语法。

该库提供了转译 html 中 script 脚本的 cli，并且可以对 script 脚本的data数据进行一定的编译处理，以辅助工程化相关行为。

## 安装

**1.若网络条件好，可以直接使用 `npx babel-html-cli` 命令**

**2.由于内置了一部分babel，很容易和工程有冲突，建议安装到全局:**

```sh
npm i -g babel-html-cli
```

**3.若依赖没有冲突，可以安装到工程:**

```sh
yarn add babel-html-cli -D
```

**4.若在持续集成环境不方便安装全局，建议可以将编译后的 index.html 提交到仓库中，不在编译流程中使用 babel-html-cli**

涉及依赖: 

```json
{
  "dependencies": {
    "@babel/cli": "^7.7.5",
    "@babel/core": "^7.7.5",
    "@babel/runtime": "^7.7.6",
    "@types/fs-extra": "^8.0.1",
    "babel-preset-react-app": "^9.1.0",
    "cheerio": "^1.0.0-rc.3",
    "fs-extra": "^8.1.0"
  }
}
```

## 使用说明

查看帮助：

```
npx babel-html-cli --help
```

执行命令：

```
npx babel-html-cli public/index-es6.html public/index.html
```

默认的 babel 配置使用 babel-react-app，亦可自定义 babel 配置, 添加 --config 参数：

```
npx babel-html-cli public/index-es6.html public/index.html --config .html-babelrc
```

## 生产便捷转译

我们可以根据运行环境的 NODE_ENV 进行一些生产时工程处理，我们通过设置一些 data 数据来为后续的转译做标记

编译前 <--

```html
<html>
  <head>
    <!-- data-babel-env 标记的script元素会被插入env对象 -->
    <script data-babel-env="true"></script>
    <script>
      const say = () => {
        // 默认情况 NODE_ENV 会遇到取值异常
        console.log(process.env.NODE_ENV);
      };
      say();
    </script>
  </head>
</html>
```

我们执行命令:

```sh
NODE_ENV=production npx babel-html-cli index-es6.html index.html
```

--> 编译后

```html
<html>
  <head>
    <script data-babel-env="true">
      window.process = {
        env: {
          NODE_ENV: "production",
          BABEL_ENV: undefined,
          BABEL_HTML: undefined
        }
      };
    </script>
    <script>
      const say = () => {
        // 此时，NODE_ENV 有了环境变量
        console.log(process.env.NODE_ENV);
      };
      say();
    </script>
  </head>
</html>
```

类似的 data 属性还有：

- data-babel-env="true" 
- data-babel-remove="production"
- data-babel-remove="development"
- data-babel-remove="true"
- data-babel-keep="true" 不进行 babel 转译

其中 data-babel-remove 会根据 NODE_ENV 和其环境变量的值判断是否删除 script 脚本, 常用例子:

```html
<html>
  <head>
    <script data-babel-remove="production" src="https://cdn.bootcss.com/vConsole/3.3.4/vconsole.min.js"></script>
    <script data-babel-remove="production">
      var vConsole = new VConsole();
    </script>
  </head>
</html>
```

在开发中，我们可以使用以上data属性，配合脚本 package.json 来切换工程的 index.html 内容。

package.json 脚本例子:

```json
{
  "scripts": {
    "html2es5":"npx babel-html-cli public/index-es6.html public/index.html",
    "start":"NODE_ENV=development yarn html2es5 && react-app-rewired start",
    "build":"NODE_ENV=production yarn html2es5 && react-app-rewired build",
  }
}
```
