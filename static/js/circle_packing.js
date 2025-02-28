// Set dimensions
const width = 600;
const height = 600;

const color = d3.scaleLinear()
    .domain([0, 5])
    .range(["#fff9c4", "#ff8f00"]) // Light Yellow to Deep Yellow
    .interpolate(d3.interpolateHcl);


const pack = data => d3.pack()
    .size([width, height])
    .padding(3)(d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));

const root = pack(data);

const svg = d3.select("#circle-packing").append("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("display", "block")
    // Remove margin styles and add centering using flexbox
    .style("margin", "auto")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", (event, d) => zoom(event, root));

let focus = root;
let view;

const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : "white")
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

const label = svg.append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => `${d.data.name}${d.value ? ` (${d.value.toFixed(2)})` : ''}`);

zoomTo([root.x, root.y, root.r * 2]);

function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
}

function zoom(event, d) {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", d => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return t => zoomTo(i(t));
        });

    label
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}
