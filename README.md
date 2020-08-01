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
    <a href="https://openhps.org/docs/getting-started">Documentation</a> &mdash; <a href="https://openhps.org/docs/examples">Examples</a> &mdash; <a href="https://openhps.org/docs/core">API</a>
</h3>

<br />

**Note: OpenHPS is in development and scheduled for development release in September 2020.**

This repository contains the core component for OpenHPS (Open Source Hybrid Positioning System). It includes concepts for creating the model, nodes and data object definitions.

OpenHPS is a graph-based data processing positioning framework. It is designed to support many different use cases ranging from simple positioning such as detecting the position of a pawn on a chessboard using RFID, to indoor positioning methods using multiple cameras.

## Features
- 2D, 3D and Geographical positioning.
- Relative positioning.
- Basic positioning algorithms (e.g. trilateration, triangulation, fingerprinting, dead reckoning...)
- Extremely extensible.
- Open source.

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/core with the following command.
```bash
npm install @openhps/core@dev --save
```

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2020 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.