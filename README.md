[![Build Status](https://ci.mvdw-software.com/job/openhps-core/badge/icon)](https://ci.mvdw-software.com/job/openhps-core/)
[![Tests](https://img.shields.io/jenkins/tests/http/ci.mvdw-software.com/job/openhps-core?compact_message)](http://ci.mvdw-software.com/job/openhps-core/lastCompletedBuild/testReport/)
[![Coverage](https://img.shields.io/jenkins/coverage/cobertura/http/ci.mvdw-software.com/job/openhps-core)](http://ci.mvdw-software.com/view/OpenHPS/job/openhps-core/cobertura/)
# OpenHPS: Core Component
This project contains the core component for OpenHPS (Open Hybrid Positioning System). It includes concepts for creating the model, layers
and object definitions.

## About
OpenHPS is a positioning framework design to support many different use cases ranging from simple positioning such as detecting the position
of a pawn on a chessboard using RFID, to indoor positioning methods using cameras.

At its core, the framework provides the ability to create a chain of models that each have an input and output layer. Sensory data is
provided by passing a data frame through all layers in the model. Inbetween the input and output layer are a configurable amount of
processing layers that compute the sensory data to a more abstract, higher level result.

Persistent data such as the previous location of tracked objects or calibration data is stored in services linked to a model. Each layer
that is added to the model can read and write the data that is stored by the services.

The framework is created by Maxim Van de Wynckel who is a PhD Student at the Vrije Universiteit Brussel.

## Main Concepts
This section of the documentation explains the main concepts used in the OpenHPS framework. While most of these are
specific to the core component hosted in this repository, they are used in other components as well.

### Layer
A layer is a concept that has an input and output data type. Data can be pushed to a layer or pulled from it by another.
These layers perform a task in the chain of data processing and data abstraction.

### Model
A model is a layer that can contain multiple layers on itself. You can push or pull data from or to the model.
When pushing data, this data gets pushed through all layers inside the model until it reaches the output layer.
When pulling data, the model will attempt to fetch information from a previous layer. This is possible as a model
on itself is a layer, meaning it can be part of a bigger model.

### DataFrame
A data frame is the container that is transmitted from layer to layer. It contains a list of all objects involved in this data frame
and a

### Object
An Object is an abstract concept of any thing or being that can have an absolute location. An object on itself

### Location

#### RelativeLocation
A relative location is a location relative to another object. This can be relative based on the distance, angle or multiple factors
combined.

#### AbsoluteLocation
An absolute location is a fixed location. This can be anything ranging from a cartesian coordinate to a geographical coordinate
or even celestial coordinate, but all objects using an absolute location have the same origin.

### DataService
A data service is a way to keep persistent data between data frames or models.