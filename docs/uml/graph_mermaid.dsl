
classDiagram


class Edge~InOut~{
            +inputNode
+outputNode
            -_onPush()
-_onPull()
+push()
+pull()
+emit()
+on()
        }
EventEmitter~T~<|--Edge~InOut~
Inlet~In~<|..Edge~InOut~
Outlet~Out~<|..Edge~InOut~
class Graph~In,Out~ {
            <<interface>>
            +internalSink
+internalSource
+edges
+nodes
            +findNodeByUID()
+findNodeByName()
+findEdge()
+addNode()
+addEdge()
+deleteEdge()
+deleteNode()
        }
GraphNode~In,Out~<|..Graph~In,Out~
class Inlet~In~ {
            <<interface>>
            
            +pull()
+emit()
+emit()
+emit()
+on()
        }
class Outlet~Out~ {
            <<interface>>
            
            +push()
+on()
        }