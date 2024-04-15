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
    num_vertices: 4,
    num_frames: 1,
    frames: [
        {
            vertices:[
                {label: "s", style: 1}, // style of 0
                {label: "t", style: 2}, // style of 1
                {label: " ", style: 1}, // style of 2
                {label: " ", style: 1}, // style of 3
            ], 
            edges: [
                [ // 0 is the source
                    {label: " ", style: 0}, // style of (0, 0)
                    {label: " ", style: 0}, // style of (0, 1)
                    {label: "10", style: 1}, // style of (0, 2)
                    {label: "15", style: 1}, // style of (0, 3)
                ],
                [ // 1 is the sink
                    {label: " ", style: 0}, // style of (1, 0)
                    {label: " ", style: 0}, // style of (1, 1)
                    {label: " ", style: 0}, // style of (1, 2)
                    {label: " ", style: 0}, // style of (1, 3)
                ],
                [
                    {label: " ", style: 0}, // style of (2, 0)
                    {label: " ", style: 0}, // style of (2, 1)
                    {label: " ", style: 0}, // style of (2, 2)
                    {label: "5", style: 1}, // style of (2, 3)
                ],
                [
                    {label: " ", style: 0}, // style of (3, 0)
                    {label: " ", style: 0}, // style of (3, 1)
                    {label: " ", style: 0}, // style of (3, 2)
                    {label: " ", style: 0}, // style of (3, 3)
                ]
            ]
        },
    ],
};