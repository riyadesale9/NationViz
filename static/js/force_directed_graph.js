// Set dimensions
const width = 1200;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 50 };

// Create an SVG element
const svg = d3.select("#force-directed-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Parse diplomacyDataJson passed from Streamlit
const data = JSON.parse(diplomacyDataJson);

// Define color scheme for countries and their cities
const colorScheme = {
    "United States": "#4F81BD", // Blue
    "China": "#C0504D", // Red
    "India": "#9BBB59", // Green
    "Russia": "#F79646", // Orange
    "Canada": "#8064A2" // Purple
};

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px");

// Initialize simulation with forces
const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.edges).id(d => d.name).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Draw links (edges)
const link = svg.append("g")
    .selectAll("line")
    .data(data.edges)
    .enter().append("line")
    .attr("stroke-width", 1.5)
    .attr("stroke", "#999")
    .attr("class", "link"); // Add a default class to links

// Draw nodes with color clusters and tooltips
const node = svg.append("g")
    .selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", d => d.type === 'country' ? 15 : 5) // Larger radius for countries, smaller for cities
    .attr("fill", d => {
        if (d.type === 'country') return colorScheme[d.name];
        const linkedCountry = data.edges.find(edge => edge.target === d.name)?.source;
        return colorScheme[linkedCountry] || "#ccc"; // Match city color to its country
    })
    .call(drag(simulation))
    
    // Highlight connected edges on mouseover for country nodes
    .on('mouseover', function(event, d) {
        if (d.type === 'country') {
            // Highlight edges connected to the hovered country node
            link.attr('stroke', l => l.source === d || l.target === d ? '#000' : '#999')
                .attr('stroke-width', l => l.source === d || l.target === d ? 1.5 : 0.5);
        }

        // Show tooltip and highlight node
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`Name: ${d.name}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);
    })
    
    // Reset edge styles on mouseout
    .on('mouseout', function() {
        link.attr('stroke', '#999').attr('stroke-width', 1.5); // Reset edge colors and widths

        // Hide tooltip and reset node style
        tooltip.transition().duration(200).style('opacity', 0);
        d3.select(this).attr('stroke', null);
    });

// Add labels for cities only (no labels for countries)
const labels = svg.append("g")
   .selectAll("text")
   .data(data.nodes.filter(d => d.type === 'city')) // Only add labels for cities
   .enter().append("text")
   .attr("dy", ".35em")
   .attr("x", 10) // Offset the label slightly from the city node
   .style('font-size', '12px')
   .style('fill', '#555')
   .text(d => d.name); // Display city name

// Update simulation on tick
simulation.on("tick", () => {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);

    labels.attr('x', d => d.x + 10) // Position label slightly offset from the city node horizontally
          .attr('y', d => d.y);     // Align vertically with the city node's position
});

// Dragging functionality
function drag(simulation) {
  return d3.drag()
      .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
      })
      .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
      })
      .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
      });
}

// Add a horizontal legend for countries at the top of the chart
const legendData = Object.keys(colorScheme);

const legend = svg.append('g')
   .attr('transform', `translate(${width / 2 - legendData.length * 40}, ${margin.top / 2})`);

legendData.forEach((country, i) => {
   const legendItem = legend.append('g')
       .attr('transform', `translate(${i * 100}, 0)`); // Adjust spacing between legend items

   // Add colored circle for each country in the legend
   legendItem.append('circle')
       .attr('r', 8)
       .attr('fill', colorScheme[country]);

   // Add text label next to each circle in the legend
   legendItem.append('text')
       .attr('x', 15)
       .attr('y', 5)
       .text(country)
       .style('font-size', '12px')
       .style('fill', '#555');
});
