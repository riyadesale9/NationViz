// Set dimensions and margins
const width = 500;
const height = 400;
const margin = { top: 50, right: 70, bottom: 10, left: 75};

// Create an SVG element
const svg = d3.select("#parallel-coordinates-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse childrensDataJson passed from Streamlit
const childrensData = JSON.parse(childrensDataJson);

// Extract dimensions and create scales for each dimension
const dimensions = Object.keys(childrensData[0]).filter(d => d !== "Country");

const yScales = {};
dimensions.forEach(dimension => {
    yScales[dimension] = d3.scaleLinear()
        .domain([0, d3.max(childrensData, d => +d[dimension]) * 1.1]) // Increase domain for better spacing
        .range([height, 0]);
});

// X scale for positioning the axes
const xScale = d3.scalePoint()
    .domain(dimensions)
    .range([0, width]);

// Color scale for countries
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(childrensData.map(d => d.Country));

// Tooltip
const tooltip = d3.select("#parallel-coordinates-chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)")
    .style("font-family", "sans-serif")
    .style("text-align", "center");

// Draw lines for each country with unique colors and tooltips
svg.selectAll("path")
    .data(childrensData)
    .enter().append("path")
    .attr("d", d => {
        return d3.line()(dimensions.map(p => [xScale(p), yScales[p](d[p])]));
    })
    .style("fill", "none")
    .style("stroke", d => colorScale(d.Country))
    .style("opacity", 0.7)
    .style("stroke-width", 3) // Thicker lines
    .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`Country: ${d.Country}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 50) + 'px');
        d3.select(this).style('stroke-width', 5); // Highlight line on hover
    })
    .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
        d3.select(this).style('stroke-width', 3); // Reset line thickness
    });

// Draw axes for each dimension
svg.selectAll(".axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "axis")
    .attr("transform", d => `translate(${xScale(d)})`)
    .each(function(d) {
        d3.select(this).call(d3.axisLeft(yScales[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -12)
    .text(d => `${d}`) // Add unit here if needed
    .style("fill", "black");

// Add horizontal legend at the top of the chart
const legend = svg.append('g')
   .attr('transform', `translate(0, -40)`);

childrensData.forEach((d, i) => {
   const legendItem = legend.append('g')
       .attr('transform', `translate(${i * 70}, -10)`); // Adjust spacing as needed

   legendItem.append('rect')
       .attr('width', 10)
       .attr('height', 10)
       .attr('fill', colorScale(d.Country));

   legendItem.append('text')
       .attr('x', 15)
       .attr('y', 6)
       .text(d.Country)
       .style('font-size', '12px')
       .attr('alignment-baseline', 'middle');
});