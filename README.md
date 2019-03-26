# KubGUI

KubGui is a React app thats help you to visualise your kubernetes environments.
You can switch contexts and namespaces, visualise your pods which are sorted by state for easy diagnostic.

![](https://i.imgur.com/P6Qg7tK.png)


By clicking on a pod's name, you have live access to its structure and logs.

![](https://i.imgur.com/dMvKFPu.png)

I've implemented in-browser terminal which allows a total, instant SSH access

![](https://i.imgur.com/yRBXqhj.png)

## Installation

Use the package manager [npm](http://npmjs.com) to install.

IMPORTANT: You must have at least node V8. Your machine must support shell and have kubectl command line tool installed.
In the frontend sources, you must replace http://192.168.211.211:8080 by the API ip and port you configured.


```bash
npm --prefix ./api install ./api
npm --prefix ./front install ./front
```

## Starting
```bash
cd api && npm start
```
```bash
cd front && npm start
```
## Usage

Navigate to [http://localhost:3000](http://localhost:3000)

## License
Tlux
