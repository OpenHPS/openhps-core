[![Build Status](https://ci.mvdw-software.com/job/openhps-core/badge/icon)](https://ci.mvdw-software.com/job/openhps-core/)
[![Tests](https://img.shields.io/jenkins/tests/http/ci.mvdw-software.com/job/openhps-core?compact_message)](https://ci.mvdw-software.com/job/openhps-core/lastCompletedBuild/testReport/)
[![Coverage](https://img.shields.io/jenkins/coverage/cobertura/http/ci.mvdw-software.com/job/openhps-core)](https://ci.mvdw-software.com/view/OpenHPS/job/openhps-core/cobertura/)
# OpenHPS: Core Component
This project contains the core component for OpenHPS (Open Hybrid Positioning System). It includes concepts for creating the model, layers
and object definitions.

## About
OpenHPS is a positioning framework design to support many different use cases ranging from simple positioning such as detecting the position
of a pawn on a chessboard using RFID, to indoor positioning methods using cameras.

At its core, the framework provides the ability to create a chain of models that each have an input and output node. Sensory data is
provided by passing a data frame through all nodes in the model. Inbetween the input and output node are a configurable amount of
processing nodes that compute the sensory data to a more abstract, higher level result.

Persistent data such as the previous location of tracked objects or calibration data is stored in services linked to a model. Each layer
that is added to the model can read and write the data that is stored by the services.

The framework is created by Maxim Van de Wynckel who is a PhD Student at the Vrije Universiteit Brussel.