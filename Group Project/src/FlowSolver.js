////////////////////////////////////////////////////////////////////////////////
/// Written by Jiefu Lu for COMP3821 Assignment
/// Max Flow Solver and Visualiser
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

        // level graph information
        this.level = Infinity;

        // dfs information
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
    }

    reset() {
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;
        this.level = Infinity;
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
    }
}

// struct for storing edge information
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

    reset() {
        this.bfsSelected = false;
        this.bfsSeen = false;
        this.bfsInPath = false;
        this.dfsSelected = false;
        this.dfsSeen = false;
        this.dfsOnStack = false;
        this.dfsInPath = false;
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
}

/**
 * Each builder is subscribed to a ResidualGraph
 * When the ResidualGraph instance calls its publish() method,
 * a frame is captured
 */
class AnimationBuilder {
    constructor() {
        this.frames = [];
    }

    /**
     * Captures the information about the graph as an animation frame.
     * This will break the encapsulation of the ResidualGraph class
     * @param {*} graph - a residual graph
     */
    capture(graph) {
        let frame = {
            vertices: [],
            edges: []
        };
        this.frames.push(frame);
    }

    /**
     * 
     * @returns all animation information
     */
    export() {
        return {
            num_vertices: this.resGraph.vertices.size(),
            num_frames: this.frames.size(),
            frames: this.frames,
        }
    }
}

/**
 * 
 * @param {*} graphInfo 
 * @returns 
 */
function DinicsAnimation(graphInfo) {
    const resGraph = new ResidualGraph(graphInfo);
    return new AnimationBuilder(resGraph);
}

function EdmondsKarpAnimation(graphInfo) {
    const resGraph = new ResidualGraph(graphInfo);
    return new AnimationBuilder(resGraph);
}

////////////////////////////////////////////////////////////////////////////////
/// Client Code
/// For testing

// Sample Data
const g1 = {
    num_vertices: 20,
    num_edges: 3,
    edges: [
        {
            from: 2,
            to: 3,
            capacity: 40
        },
        {
            from: 3,
            to: 1,
            capacity: 40
        },
        {
            from: 0,
            to: 2,
            capacity: 2
        },
    ],
};

const graph =  new ResidualGraph(g1);