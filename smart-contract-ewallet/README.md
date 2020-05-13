
#  Trip|Contract SmartContract Base System
[![js-airbnb-style](https://img.shields.io/badge/code%20style-airbnb-brightgreen.svg)](https://github.com/airbnb/javascript)

* Code Style và convention thực hiện theo chuẩn của [Airbnb](https://github.com/airbnb/javascript)

## Cài đặt môi trường làm việc:

**Bước 1** Cài đặt các công cụ cần thiết:

Xem file `INSTALLATION.md`

=============================================

IDE có thể dùng tuỳ thích, nhưng khuyến cáo sử dụng Visual Studio Code:

Cài đặt brew cask:
````
brew tap caskroom/cask
````
Sau đó cài đặt Visual Studio Code:
````
brew cask install visual-studio-code
````

**Bước 2:** git clone this repo: git clone ...

**Bước 3:** cd to the cloned repo:

````
cd trip-contract-react
````

**Bước 4:** Cài đặt dependency bằng lệnh `yarn` (chỉ dùng yarn cho project):

````
yarn
````


## Hướng dẫn chạy App trong môi trường dev:

1. cd vào repo:
````
cd trip-contract-react
````
2. Chạy bản build:

  * trên iOS

    * chạy `react-native run-ios`
    * chạy nhanh trên iPhone 5 simulator `npm run i5s`
    * chạy nhanh trên iPhone 6 simulator `npm run i6`


  * trên Android

    * Chạy Genymotion hoặc kết nối với thiết bị thật:
    * chạy `react-native run-android`

**Mỗi commit đều được check linting**

Project có sử dụng [husky](https://github.com/typicode/husky), nhằm đảm bảo chất lượng code, tránh tối đa các lỗi cú pháp, sai quy chuẩn,...

**Bypass Lint**

Hạn chế dùng, nhưng khi thật cần thiết, có thể thêm cờ `--no-verify` vào lệnh commit để commit mà không qua kiểm tra cú pháp code.

## Phân tách giữa môi trường dev và môi trường production.

Project này có sử dụng [react-native-config](https://github.com/luggit/react-native-config) để phân tách key, setting giữa các môi trường dev và production.

```
API_URL=https://myapi.com
GOOGLE_MAPS_API_KEY=abcdefgh
```

trong React Native gọi ra như sau:

```
import Secrets from 'react-native-config'

Secrets.API_URL  // 'https://myapi.com'
Secrets.GOOGLE_MAPS_API_KEY  // 'abcdefgh'
```

## Các thư viện cần chú ý:

[react-native-global-props](https://github.com/Ajackster/react-native-global-props)