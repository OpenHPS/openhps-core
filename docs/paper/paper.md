---
title: 'OpenHPS: A Modular Framework to Facilitate the Development and Sharing of Positioning Systems and Algorithms'
tags:
  - TypeScript
  - Hybrid positioning
authors:
  - given-names: Maxim
    family: Van de Wynckel
    orcid: 0000-0003-0314-7107
    affiliation: 1
  - name: Beat Signer
    orcid: 0000-0001-9916-0837
    affiliation: 1
affiliations:
 - name: Vrije Universiteit Brussel, Belgium
   index: 1
date: 13 November 2023
bibliography: paper.bib
---

## Abstract
Positioning systems are a collection of technologies and algorithms that can help to determine the location of people and objects. While outdoor positioning systems mainly use satellites such as GPS to perform the tracking, many different technologies exist that can offer better latency, accuracy or battery efficiency depending on the use case. These use cases can range from indoor positioning systems where there is no standardised technology to smaller scale positioning systems such as tracking the location of a pen on a piece of paper. In the research domain of positioning and tracking, these novel types of positioning systems are often implemented as single use protypes with no common data format, making it difficult to replicate or expand. OpenHPS was created as a framework to enable to creation of positioning systems for a wide range of use cases and to also allow a wide range of commonly used algorithms that can be extended when needed. The creation of a positioning system using our framework is graph based, allowing developers to share individual custom *nodes* that implement new algorithms or fuse sensor data from a variety of technologies.

## Keywords
Hybrid positioning systems, interoperable positioning systems, indoor positioning, stream processing

# Statement of Need

## Context
`OpenHPS` is an open source hybrid positioning system framework written in TypeScript. It can be run on the server using NodeJS, the browser or even hybrid mobile applications such as NativeScript, React-Native and CapacitorJS. The general design of a positioning system created using our framework consists of a graph with a set of nodes that process data.

All concepts, ranging from positions to sensor values can be expressed in various ways with varying units, allowing OpenHPS to be used for small scale use cases such as tracking a pen on a paper to larger use cases such as tracking airplanes across the globe.

## Related Work


# Framework

## Data Frames and Objects
Our framework uses stream based processing of `DataFrame`s which contain all time-sensitive information. Inside these frames can be one or more `DataObject`s which indicate the spatial objects that are relevant for the information within the data frame.

Both this information can be serialised to JSON or semantic RDF data, enabling the interoperability between systems.

## Nodes
Each node in the graph represent a step in the processing of data frames from source to sink. A `SourceNode` generates information, such as a sensor that .

### Communication

## Modules
OpenHPS is modular by design, mainly due to the ability to extend data frames and objects. These extensions allow for different data objects such as different sensors such as cameras and IMU sensors or spatial landmarks such as Bluetooth beacons.

Each node in a positioning model can be extended as well, allowing the creation of custom algorithms that can be added or removed from a positioning system with ease.

## Performance
Since our framework uses TypeScript, it uses JavaScript at runtime, which is single-threaded by default. To overcome the challenges associated with this when creating real time stream processing systems, our graphs or portions of the graph can be run with the help of web workers. All data transmitted through our graph is serialisable, which prevents the need for developers to handle this serialisation or the communication between web workers themselves.

In addition to the ability to run graphs on multiple workers, our communication nodes such as MQTT, combined with the serialisability of data, allows developers to offload the processing of complicated tasks to other servers or dedicated processors. For more high-demanding algorithms such as computer vision and visual SLAM, modules such as [@openhps/opencv](https://github.com/OpenHPS/openhps-opencv) and [@openhps/openvslam](https://github.com/OpenHPS/openhps-openvslam) create C++ bindings in NodeJS.

# Examples of Rearch Work
OpenHPS has been a building block for various research such as its use within indoor positioning systems [@vandewynckel2021], its ability to serialise location data to RDF in a demonstrator application that aims to preserve privacy and transparency using Solid-pods [@vandewynckel2022] and its use within the SemBeacon demonstrator application [@vandewynckel2023] that is written in CapacitorJS and uses OpenHPS to deserialise positioning data and positioning systems. However, with the ability for OpenHPS to contain modular nodes, its use within the domain of positioning systems can allow for easier sharing of algorithms and findings, as well as the rapid creation of prototypes and demonstrators that make use of location data.

# References