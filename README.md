<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/core
</h1>
<p align="center">
    <a href="https://ci.mvdw-software.com/job/openhps-core/" target="_blank">
        <img alt="Build Status" src="https://ci.mvdw-software.com/job/openhps-core/job/dev/badge/icon">
    </a>
    <a href="https://ci.mvdw-software.com/view/OpenHPS/job/openhps-core/job/dev/lastCompletedBuild/testReport" target="_blank">
        <img alt="Tests" src="https://img.shields.io/jenkins/tests?compact_message&jobUrl=https%3A%2F%2Fci.mvdw-software.com%2Fview%2FOpenHPS%2Fjob%2Fopenhps-core%2Fjob%2Fdev">
    </a>
    <a href="https://ci.mvdw-software.com/view/OpenHPS/job/openhps-core/job/dev/lastCompletedBuild/cobertura/" target="_blank">
        <img alt="Code coverage" src="https://img.shields.io/jenkins/coverage/cobertura?jobUrl=https%3A%2F%2Fci.mvdw-software.com%2Fview%2FOpenHPS%2Fjob%2Fopenhps-core%2Fjob%2Fdev%2F">
    </a>
    <a href="https://codeclimate.com/github/OpenHPS/openhps-core/" target="_blank">
        <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/OpenHPS/openhps-core">
    </a>
</p>

<h3 align="center">
    <a href="https://openhps.org/docs/getting-started">Getting Started</a> &mdash; <a href="https://openhps.org/docs/examples">Examples</a> &mdash; <a href="https://openhps.org/docs/core">API</a>
</h3>

<br />

This repository contains the core component for OpenHPS (Open Source Hybrid Positioning System). It includes concepts for creating the model, nodes and data object definitions.

OpenHPS is a data processing positioning framework. It is designed to support many different use cases ranging from simple positioning such as detecting the position of a pawn on a chessboard using RFID, to indoor positioning methods using multiple cameras.

## Features
- 2D, 3D and Geographical positioning.
- Relative positioning.
- Basic positioning algorithms (e.g. trilateration, triangulation, fingerprinting, dead reckoning...)
- Advanced positioning algorithms (e.g. computer vision through @openhps/opencv)
- Extremely extensible.
- Open source.

## Add-ons
### Positioning Algorithms
- **[@openhps/imu](https://github.com/OpenHPS/openhps-imu)** - Adds IMU processing nodes for fusing IMU sensors.
- **[@openhps/fingerprinting](https://github.com/OpenHPS/openhps-fingerprinting)** - Adds various fingerprinting nodes and services for offline and offline positioning models.
- **[@openhps/opencv](https://github.com/OpenHPS/openhps-opencv)** - Provides linkage with opencv4nodejs and OpenCV.js for computer vision algorithms on the server or browser.

### Abstractions
- **[@openhps/spaces](https://github.com/OpenHPS/openhps-spaces)** - Enables the concept of symbolic spaces (e.g. building, room) on top of reference spaces.
- **[@openhps/lbs](https://github.com/OpenHPS/openhps-lbs)** - Adds a location based service to a model. This service allows for a similar endpoints to get or watch the current position of a data object.

### Data Services
- **[@openhps/mongodb](https://github.com/OpenHPS/openhps-mongodb)** - Adds MongoDB support for the storage of data objects.
- **[@openhps/localstorage](https://github.com/OpenHPS/openhps-localstorage)** - Basic persistent storage for browser based models.

### Communication
- **[@openhps/socket](https://github.com/OpenHPS/openhps-socket)** - Provides node communication through Socket.IO for remote models.
- **[@openhps/rest](https://github.com/OpenHPS/openhps-rest)** - Provides node communication through restful endpoints.

### Misc
- **[@openhps/sphero](https://github.com/OpenHPS/openhps-sphero)** - Example implementation for controlling and receiving sensor data from Sphero toys.
- **[@openhps/react-native](https://github.com/OpenHPS/openhps-react-native)** - Provides nodes for retrieving sensor data in react-native.
- **[@openhps/csv](https://github.com/OpenHPS/openhps-csv)** - Read and write data frames from/to CSV files.

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/core with the following command.
```bash
npm install @openhps/core --save
```

The core idea and goals of OpenHPS are outlined in the technical paper: *OpenHPS: An Open Source Hybrid Positioning System*.

## Usage
```typescript
import { ModelBuilder } from '@openhps/core';

ModelBuilder.create()
    .build().then(model => {
         // ...
    });
```

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2021 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.