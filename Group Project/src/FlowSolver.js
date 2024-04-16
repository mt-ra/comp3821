////////////////////////////////////////////////////////////////////////////////
/// Written by Jeff Lu for COMP3821 Assignment
/// Max Flow Solver and Visualiser
////////////////////////////////////////////////////////////////////////////////
/*
 Comments:
 Jeff: the state of the program (whether its in the dfs stage etc) is 
 determined using the vertex info by the animation builder?? wtf?? 
 whatever the tech debt can't be too bad
 Jeff: there is also a weird thing where the graph is allowed to be in invalid 
 states after a call to a method. not good but who cares
*/
////////////////////////////////////////////////////////////////////////////////


// vertex style enum
// interpretation of styles is up to the visualiser
const VertexStyles = {
    UNSEEN: 0,
    BFS_SELECTED: 1, 
    BFS_SEEN: 2,
    BFS_INPATH: 3, // exclusive to Edmonds-Karp, for when path is found using BFS
    DFS_SELECTED: 4,
    DFS_ONSTACK: 5,
    DFS_SEEN: 6,
    DFS_INPATH: 7, // exclusive to Dinics, when path is found on level graph
};

// edge style enum
// interpretation of styles is up to the visualiser
const EdgeStyles = {
    NULL: 0, // when an edge has zero residual capacity
    UNSEEN: 1, // when an edge has a positive residual capacity
    BFS_SELECTED: 2, // edge is being considered in the BFS
    BFS_SEEN: 3,  // edge has been added to the BFS tree
    BFS_INPATH: 4, // exclusive to Edmonds-Karp, for when path is found using BFS
    DFS_SELECTED: 5, // edge is being considered in the DFS
    DFS_ONSTACK: 6, // edge is currently on the DFS stack
    DFS_SEEN: 7, // edge has been seen and discarded in the dfs
    DFS_INPATH: 8, // exclusive to Dinics, when path is found on level graph
};

/**
 * Struct for storing vertex information
 * vertexId is redundant information, but will increase efficiency
 */
class VertexInfo {
    constructor(vertexId) {
        // vertex id is unique
        this.id = vertexId;
        
        // bfs information
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;
        this.bfsPred = null;

        // level graph information
        this.level = Infinity;

        // dfs information
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
        this.dfsPred = null;
    }

    bfsReset() {
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;
        this.bfsPred = null;
        this.level = Infinity;
    }

    dfsReset() {
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
        this.dfsPred = null;
    }

    fullReset() {
        this.bfsReset();
        this.dfsReset();
    }
}

/**
 * Struct for storing edge information
 */
class EdgeInfo {
    constructor(fromVertexId, toVertexId) {
        // information identifying the edge
        this.fromVertex = fromVertexId;
        this.toVertex = toVertexId;

        // residual capacity
        this.capacity = 0;


        // bfs information
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;

        // level graph information

        // dfs information
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
    }

    bfsReset() {
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;
    }

    dfsReset() {
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
    }

    fullReset() {
        this.bfsReset();
        this.dfsReset();
    }
}

/**
 * Class for Residual Graph
 */
class ResidualGraph {

    /**
     * Constructs the initial residual graph of a flow network 
     * @param {*} graphInfo - information
     */
    constructor(graphInfo) {
        // member variables
        this.vertices = [];
        this.edges = [];

        // for observer pattern
        this.subscribers = [];

        // fill vertices array with vertex instances
        for (let i = 0; i < graphInfo.num_vertices; i++) {
            this.vertices.push(new VertexInfo(i));
        }
        
        // fill edge matrix with edge instances
        for (let i = 0; i < graphInfo.num_vertices; i++) {
            let r = [];
            for (let j = 0; j < graphInfo.num_vertices; j++) {
                r.push(new EdgeInfo(i, j));
            }
            this.edges.push(r);
        }

        // input flow capacity information
        for (let e of graphInfo.edges) {
            this.edges[e.from][e.to].capacity = e.capacity;
        }
    }

    /**
     * Adds an animation builder to the list of subscribers
     * @param {AnimationBuilder} builder - an animation builder
     */
    subscribe(builder) {
        this.subscribers.push(builder);
    }

    /**
     * Causes all subscribers to capture the current state of the graph
     */
    publish() {
        for (let builder of this.subscribers) {
            builder.capture(this);
        }
    }

    /**
     * Performs a bfs through the residual graph, 
     * labelling each vertex with its predecessor, and level,
     * updating the animation builder along the way
     */
    bfs() {
        // reset and initialise all vertices
        for (let v of this.vertices) {
            v.fullReset();
        }

        // reset and initialise all edges
        for (let row of this.edges) {
            for (let e of row) {
                e.fullReset();
            }
        }

        // create bfs queue and push the source vertex
        const queue = [];
        queue.push(this.vertices[0]);
        this.vertices[0].level = 0;

        // bfs loop
        while (queue.length > 0) {
            let u = queue.shift();
            if (u.bfsSeen) continue;

            u.bfsSeen = true;
            u.bfsSelected = true;

            if (u.bfsPred != null) {
                this.edges[u.bfsPred][u.id].bfsSeen = true;
            }
            this.publish();

            // enqueue all unseen children onto the queue
            for (let e of this.edges[u.id]) {
                // check if the edge has a positive capacity
                if (e.capacity <= 0) continue;

                // check if the neighbour is seen
                let v = this.vertices[e.toVertex];
                if (v.bfsSeen === false) {
                    v.level = u.level + 1;
                    v.bfsPred = u.id;
                    queue.push(v);
                }
            }

            u.bfsSelected = false;
        }
    }

    /**
     * Performs a dfs on the level graph
     * Only use immediately after a bfs
     */
    dfs() {
        // reset and initialise all vertices
        for (let v of this.vertices) {
            v.dfsReset();
        }

        // reset and initialise all edges
        for (let row of this.edges) {
            for (let e of row) {
                e.dfsReset();
            }
        }

        // make the dfs stack and push the source node
        const stack = [];
        stack.push(this.vertices[0]);

        // dfs loop
        while (stack.length > 0) {
            let u = stack.pop();
            if (u.dfsSeen) continue;

            u.dfsSeen = true;
            u.dfsSelected = true;
            if (u.dfsPred != null) {
                this.edges[u.dfsPred][u.id].dfsSeen = true;
            }
            this.publish();

            // push all unseen children onto the stack
            for (let e of this.edges[u.id]) {
                // check if the edge has a positive capacity
                if (e.capacity <= 0) continue;

                // check if edge points to a vertex with a greater level
                if (this.vertices[e.toVertex].level <= u.level) continue;

                // check if the neighbour is seen
                let v = this.vertices[e.toVertex];
                if (v.dfsSeen === false) {
                    v.dfsPred = u.id;

                    v.dfsOnStack = true;
                    e.dfsOnStack = true;
                    this.publish();

                    stack.push(v);
                }
            }

            u.dfsSelected = false;
        }
    }
}

/**
 * Each builder is subscribed to a ResidualGraph
 * When the ResidualGraph instance calls its publish() method,
 * a frame is captured
 */
class AnimationBuilder {
    /**
     * Constructs a animation builder instance
     * and subscribes it to the subject graph
     * @param {ResidualGraph} graph 
     */
    constructor(graph) {
        this.subject = graph;
        graph.subscribe(this);
        this.frames = [];
    }

    /**
     * Captures the information about the graph as an animation frame.
     * This will break the encapsulation of the ResidualGraph class
     * This class is responsible for the logic on how to style
     * @param {ResidualGraph} graph - a residual graph
     */
    capture(graph) {
        
        /**
         * The logic for determining the style of a vertex
         * @param {VertexInfo} vertex 
         * @returns the style enum
         */
        function getVertexStyle(vertex) {
            // this order matters

            if (vertex.dfsInPath) return VertexStyles.DFS_INPATH;
            if (vertex.dfsSelected) return VertexStyles.DFS_SELECTED;
            if (vertex.dfsOnStack) return VertexStyles.DFS_ONSTACK;
            if (vertex.dfsSeen) return VertexStyles.DFS_SEEN;

            if (vertex.bfsInPath) return VertexStyles.BFS_INPATH;
            
            if (vertex.bfsSelected) return VertexStyles.BFS_SELECTED;
            if (vertex.bfsSeen) return VertexStyles.BFS_SEEN;

            return VertexStyles.UNSEEN;
        }

        /**
         * 
         * @param {VertexInfo} vertex 
         * @returns the appropriate vertex label
         */
        function getVertexLabel(v) {
            if (v.id === 0) return "s";
            if (v.id === 1) return "t";
            if (v.level != Infinity) return v.level.toString();
            return "";
        }

        /**
         * The logic for determining the style of an edge
         * @param {EdgeInfo} edge 
         * @returns the style enum
         */
        function getEdgeStyle(edge) {
            // the order matters

            if (edge.capacity === 0) return EdgeStyles.NULL;

            if (edge.dfsInPath) return EdgeStyles.DFS_INPATH;
            if (edge.dfsSelected) return EdgeStyles.DFS_SELECTED;
            if (edge.dfsOnStack) return EdgeStyles.DFS_ONSTACK;
            if (edge.dfsSeen) return EdgeStyles.DFS_SEEN;

            if (edge.bfsInPath) return EdgeStyles.DFS_INPATH;

            if (edge.bfsSelected) return EdgeStyles.BFS_SELECTED;
            if (edge.bfsSeen) return EdgeStyles.BFS_SEEN;

            return EdgeStyles.UNSEEN;
        }

        /**
         * The logic for determining the appropriate label for an edge
         * @param {EdgeInfo} edge 
         * @returns the appropriate edge label
         */
        function getEdgeLabel(edge) {
            if (edge.capacity === 0) return "";
            return edge.capacity.toString();
        }

        let frame = {
            vertices: graph.vertices.map(v => {
                return {
                    label: getVertexLabel(v),
                    style: getVertexStyle(v),
                };
            }),
            edges: graph.edges.map(row => row.map(e => {
                return {
                    label: getEdgeLabel(e), 
                    style: getEdgeStyle(e),
                };
            })),
        };
        this.frames.push(frame);
    }

    /**
     * 
     * @returns all animation information
     */
    export() {
        return {
            num_vertices: this.subject.vertices.length,
            num_frames: this.frames.length,
            frames: this.frames,
        }
    }
}

/**
 * 
 * @param {*} graphInfo 
 * @returns 
 */
function DinicsResult(graphInfo) {
    const graph = new ResidualGraph(graphInfo);
    const builder = new AnimationBuilder(graph);
    graph.publish();

    // for debugging
    let maxFlow = 0;

    // call the bfs() method and then do a dfs through the level graph
    while (true) {
        graph.bfs();

        // first check if the end was reached
        if (!graph.vertices[1].bfsSeen) break;

        while (true) {
            // perform a dfs on the level graph
            graph.dfs();

            // check if the sink was reached
            if (!graph.vertices[1].dfsSeen) break;

            // backtrack through the dfs
            let pathVertices = [];
            let pathEdges = [];

            let minCapacity = Infinity;
            let backtracker = graph.vertices[1];
            while (true) {
                if (backtracker.dfsPred != null) {
                    let edge = graph.edges[backtracker.dfsPred][backtracker.id];
                    pathEdges.push(edge);
                    minCapacity = Math.min(minCapacity, edge.capacity);
    
                    // traverse the backtracker
                    backtracker = graph.vertices[backtracker.dfsPred];
                    pathVertices.push(backtracker);
                } else {
                    break;
                }
            }

            for (let v of pathVertices) {
                v.dfsInPath = true;
            }

            for (let e of pathEdges) {
                e.dfsInPath = true;
            }

            graph.publish();

            // augment the flow
            for (let e of pathEdges) {
                e.capacity -= minCapacity;
                graph.edges[e.toVertex][e.fromVertex].capacity += minCapacity;
            }

            // for debugging
            maxFlow += minCapacity;
        }
    }

    // for debugging
    console.log(maxFlow);

    return builder;
}

function EdmondsKarpResult(graphInfo) {
    const graph = new ResidualGraph(graphInfo);
    const builder = new AnimationBuilder(graph);
    graph.publish();

    // FOR DEBUGGING
    let maxFlow = 0;

    // call the bfs() method and straight up backtrack and augment
    while (true) {
        graph.bfs();

        // check if the end was reached
        if (!graph.vertices[1].bfsSeen) break;

        // now backtrack through the bfs
        let pathVertices = [];
        let pathEdges = [];

        let minCapacity = Infinity;
        let backtracker = graph.vertices[1];
        pathVertices.push(backtracker);
        while (true) {
            if (backtracker.bfsPred != null) {
                let edge = graph.edges[backtracker.bfsPred][backtracker.id];
                pathEdges.push(edge);
                minCapacity = Math.min(minCapacity, edge.capacity);

                // traverse the backtracker
                backtracker = graph.vertices[backtracker.bfsPred];
                pathVertices.push(backtracker);
            } else {
                break;
            }
        }

        for (let v of pathVertices) {
            v.bfsInPath = true;
        }

        for (let e of pathEdges) {
            e.bfsInPath = true;
        }
        
        graph.publish();

        // augment the flow
        console.log(pathVertices);
        console.log(pathEdges);
        for (let e of pathEdges) {
            e.capacity -= minCapacity;
            graph.edges[e.toVertex][e.fromVertex].capacity += minCapacity;

            console.log(`augmenting edge from ${e.fromVertex} to ${e.toVertex} by ${minCapacity}`)

        }

        // for debugging
        maxFlow += minCapacity;
    }

    // for debugging
    console.log(maxFlow);

    return builder;
}

////////////////////////////////////////////////////////////////////////////////
/// Client Code
/// For testing

// Sample Data
const g1 = {
    num_vertices: 6,
    num_edges: 8,
    edges: [
        {
            from: 0,
            to: 2,
            capacity: 11
        },
        {
            from: 0,
            to: 4,
            capacity: 12
        },
        {
            from: 4,
            to: 2,
            capacity: 1
        },
        {
            from: 2,
            to: 3,
            capacity: 12
        },
        {
            from: 4,
            to: 5,
            capacity: 11
        },
        {
            from: 5,
            to: 3,
            capacity: 7
        },
        {
            from: 3,
            to: 1,
            capacity: 19
        },
        {
            from: 5,
            to: 1,
            capacity: 4
        },
    ],
};

const builder = DinicsResult(g1);
const animation = builder.export();
for (let frame of animation.frames) {
    console.log(frame);
}