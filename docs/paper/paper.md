---
title: 'OpenHPS: A Modular Framework to Facilitate the Development of FAIR Positioning Systems'
tags:
  - Hybrid positioning
  - Interoperability
  - FAIR
  - Stream processing
authors:
  - given-names: Maxim
    family: Van de Wynckel
    orcid: 0000-0003-0314-7107
    affiliation: 1
  - name: Beat Signer
    orcid: 0000-0001-9916-0837
    affiliation: 1
affiliations:
 - name: Vrije Universiteit Brussel, Web & Information Systems Engineering Lab, Brussels, Belgium
   index: 1
date: 29 May 2025
bibliography: paper.bib
---

## Abstract
Positioning systems determine the location of people and objects using various technologies and algorithms. While GPS dominates outdoor positioning, indoor and smaller-scale systems often require alternative technologies for lower latency, higher accuracy, or greater efficiency. Often developed as single-use prototypes lacking standard data formats, these systems hinder reusability and expansion. OpenHPS addresses these challenges by providing a modular, graph-based framework for creating versatile positioning systems on multiple platforms. It supports a wide range of algorithms and enables extensibility through custom nodes for sensor fusion and algorithm integration.

## Keywords
Hybrid positioning systems, interoperable positioning systems, indoor positioning, stream processing, linked data, RDF

# Statement of Need
Existing positioning systems or frameworks [@georgiou2015anyplace;@find3;@5482592] often focus on specific use cases, platforms, or a set of algorithms. While this facilitates the deployment of a system, it limits the flexibility to design or reuse custom algorithms and systems. In academic systems [@7125601], proprietary solutions are often difficult to replicate, extend, or deploy in a production-ready environment due to the use of software such as MATLAB. Furthermore, the data produced by such systems is often unstandardised. OpenHPS was created to address these issues by providing a modular data-centric framework that allows developers and researchers to create positioning systems for a wide range of use cases. The framework and its produced data are designed to be interoperable, enabling developers to share their algorithms and data with others. Using additional modules that add support for Solid [@vandewynckel2022] and DHTs, we have enabled the development of findable, accessible, interoperable, and reusable (FAIR) positioning systems.

## Framework Overview
`OpenHPS` is an open-source hybrid positioning system framework written in TypeScript. It runs on the server (Node.js), in the browser, or within hybrid mobile applications. The general design of a positioning system created using OpenHPS consists of a graph containing a set of nodes that process data. Background services can be added to the graph to persist data or to communicate with other systems. We chose TypeScript over low-level languages based on the goal of achieving cross-platform reusability.

![`DataFrame`s and `DataObject`s](images/dataframe.png){width=80%}

All concepts, ranging from positions to sensor values, can be expressed in various ways with varying units, enabling OpenHPS to support both small-scale use cases such as tracking a pen on paper to larger use cases such as tracking airplanes across the globe. Our framework uses stream-based processing of `DataFrame`s that contain all time-sensitive information. These frames contain one or more `DataObject`s as illustrated in Figure 1, which indicate the spatial objects relevant for the information within the data frame. This enables the tracking of multiple actors, unlike other frameworks such as ROS [@quigley2009ros].

![OpenHPS graph of a positioning system](images/openhps-example-2.png){width=60%}

Any data pushed through the graph can be serialised to JSON or RDF data using the POSO ontology [@vandewynckel2022iswc], enabling interoperability between systems. Each node in the graph represents a stage in the processing of data frames from source to sink as shown in Figure 2. A `SourceNode` generates information, a `ProcessingNode` processes information and a `SinkNode` consumes information.

OpenHPS is modular by design, mainly due to the ability to extend data frames and objects. These extensions allow for different data objects, including different sensors like cameras, IMU sensors or spatial landmarks such as Bluetooth beacons. Each node in a graph can be extended as well, allowing the creation of custom algorithms that can be added or removed from a positioning system. Researchers can focus on the prototyping of new algorithms without having to worry about the integration of these algorithms into a larger system.

### Interoperability
Our framework is designed to offer FAIR positioning systems, leveraging its open architecture and the data it produces. Modules such as `@openhps/rdf` and `@openhps/solid` enable developers to serialise their data to RDF and store it in Solid Pods. This facilitates the creation of positioning systems that are transparent and privacy-preserving, while also ensuring that other positioning systems or consumer applications can access the data, regardless of whether they were created with OpenHPS. With various extensions such as semantic beacons [@vandewynckel2023], we enable the discovery of these systems and the data they produce. 

### Performance
OpenHPS uses JavaScript at runtime. To overcome the challenges associated with creating real-time dataflows, our graph can be executed using Web Workers [@mvdewync2020openhps]. All data transmitted through our graph is serialisable, eliminating the need for developers to handle this serialisation or communication between workers. In addition to the ability to run graphs on multiple workers, communication nodes, such as MQTT, enable developers to offload the processing of complex tasks to other servers or dedicated processors. For more computationally intensive algorithms, modules like `@openhps/opencv` and `@openhps/openvslam` provide C++ bindings to low-level libraries. Although these bindings may not achieve native performance, reusing established libraries remains a key design goal.

# Examples of Research Work
OpenHPS has been a building block for various research that has been used in indoor positioning systems [@vandewynckel2021], and its ability to serialise location data to RDF has been demonstrated in an application that aims to preserve privacy and transparency using Solid Pods [@vandewynckel2022]. Further, OpenHPS was used in the SemBeacon demonstrator application [@vandewynckel2023] that is written in CapacitorJS and uses the framework to deserialise positioning data and positioning systems. Modules were also developed for other academic projects, such as the FidMark ontology [@vandewynckel2024], which enables fiducial marker classification within the framework. OpenHPS's modular node design and domain focus facilitate the sharing of algorithms and findings, as well as the rapid creation of prototypes and demonstrators that make use of location data. Finally, OpenHPS and the related modules have been used to collect several datasets that can be used by researchers to evaluate their algorithms [@openhps2021dataset;@maxim_van_de_wynckel_2025;@maxim_van_de_wynckel_beat_signer_2025]. 

# References
