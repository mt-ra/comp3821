// REPRESENTATION OF GRAPH
// UI makes this json object

// implicit ids based on index in array

const graph = { // node 0 is source, node 1 is sink
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
    ]
};

// REPRESENTATION OF ANIMATION
// json of graph -> cpp program -> json of animation

const animation = {
    num_vertices: 20, // ids 0 to 19
    num_edges: 3, // ids 0 to 2
    num_frames: 3,
    edges: [
        {
            from: 2,
            to: 3,
        },
        {
            from: 3,
            to: 1,
        },
        {
            from: 0,
            to: 2 ,
        },
    ],
    frames: [
        {
            vertex_colors: [0, 0, 0, 0, 0, 0, 0, 0],
            edge_colors: [1, 1, 1],
            edge_numbers: [1, 2, 3]
        },
        {
            vertex_colors: [],
            edge_colors: [],
            edge_numbers: [1, 2, 3]
        },
        {
            vertex_colors: [],
            edge_colors: [],
            edge_numbers: [1, 2, 3]
        },
    ],
};