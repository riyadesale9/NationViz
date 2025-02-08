// Set the dimensions and margins of the graph


const width = 600;
const height = 400;
const margin = 40;

// The radius of the pie plot is half the width or half the height (smallest one)
const radius = Math.min(width, height) / 2 - margin;

// Append the svg object to the div called 'pie-chart'
const svg = d3.select("#pie-chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Set the color scale
const color = d3.scaleOrdinal()
  .domain(gdpData.map(d => d.Country))
  .range(d3.schemeTableau10);

// Compute the position of each group on the pie:
const pie = d3.pie()
  .value(d => d.GDP);

const data_ready = pie(gdpData);

// Build the pie chart
svg.selectAll('path')
  .data(data_ready)
  .join('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  )
  .attr('fill', d => color(d.data.Country))
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7);

// Create a tooltip div that is hidden by default
const tooltip = d3.select("#pie-chart").append("div")
  .style("position", "absolute")
  .style("background-color", "#333") // Dark background
  .style("color", "#fff") // White text
  .style("padding", "5px") // Padding inside tooltip
  .style("border-radius", "5px") // Rounded corners
  .style("opacity", 0)
  .style("pointer-events", "none") // Disable pointer events for better UX
  .style("font-family", "sans-serif")
  .style("text-align", "center") // Centered text
  .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)") // Add shadow for better visibility
  .style("border-radius", "8px") // Rounded corners for tooltip
  .style("padding", "10px");

// Add interactivity: show tooltip on hover
svg.selectAll('path')
  .on('mouseover', function(event, d) {
    // Show tooltip with country name and GDP value
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html(`<strong>${d.data.Country}</strong><br>$${d.data.GDP.toLocaleString()}`)
      .style("left", (event.pageX + 10) + "px") // Positioning tooltip relative to mouse pointer
      .style("top", (event.pageY - 50) + "px"); // Adjust to move above mouse pointer
    
    // Highlight hovered segment by increasing opacity
    d3.select(this).transition().duration(200).style("opacity", 1);
    
    // Optionally, you can also increase segment size on hover
    d3.select(this).transition().duration(200)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius + 10)); // Increase outer radius on hover
  })
  
  // Move tooltip with mouse movement
  .on('mousemove', function(event) {
    tooltip.style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 50) + "px");
  })
  
  // Hide tooltip when mouse leaves
  .on('mouseout', function(d) {
    tooltip.transition().duration(200).style("opacity", 0);
    
    // Reset segment opacity and size when hover ends
    d3.select(this).transition().duration(200).style("opacity", 0.7);
    
    // Reset segment size when hover ends
    d3.select(this).transition().duration(200)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)); // Reset outer radius to original value
});

const legend = svg.selectAll(".legend")
  .data(color.domain())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => `translate(-${width / 2 + margin}, ${i * 20 - height / 2 + margin})`);

legend.append("rect")
  .attr("x", width-85)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color);

legend.append("text")
  .attr("x", width-60)
  .attr("y", 10)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(d => d);