// Set dimensions and margins
const width = 500;
const height = 400;
const margin = { top: 50, right: 30, bottom: 50, left: 70 }; // Increased left margin for Y-axis label

// Create an SVG element
const svg = d3.select("#stacked-bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Color scale for different electricity types
const colorScale = d3.scaleOrdinal()
    .domain(["solar", "thermal", "wind", "nuclear"])
    .range(["#df6a68", "#af90cb", "#f9a265", "#669bc5"]);

// Tooltip
const tooltip = d3.select("#stacked-bar-chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "8px")
    .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)")
    .style("font-family", "sans-serif")
    .style("text-align", "center");

// Parse electricityDataJson passed from Streamlit
const electricityDataJsonParsed = JSON.parse(electricityDataJson);

// Prepare data for stacked bar chart (filter by year)
const filteredData = electricityDataJsonParsed.map(d => ({
    country: d.Country,
    solar: +d.solar,
    thermal: +d.thermal,
    wind: +d.wind,
    nuclear: +d.nuclear
}));

// Stack the data
const stack = d3.stack()
   .keys(["solar", "thermal", "wind", "nuclear"]);

const stackedData = stack(filteredData);

// X-axis scale with reduced padding to make bars thinner
const xScale = d3.scaleBand()
   .domain(filteredData.map(d => d.country))
   .range([0, width])
   .paddingInner(0.3) // Reduced inner padding to make bars thinner
   .paddingOuter(0.3); // Reduced outer padding to make bars thinner

// Y-axis scale
const yScale = d3.scaleLinear()
   .domain([0, d3.max(filteredData, d => (d.solar + d.thermal + d.wind + d.nuclear)/1000)])
   .range([height, 0]);

svg.append("g")
   .call(d3.axisLeft(yScale)
      .tickFormat(d => d3.format(",.0f")(d)) // Format ticks without decimal places
   );

// Add X-axis
svg.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(xScale));

// Add Y-axis with label
svg.append("g")
   .call(d3.axisLeft(yScale));

svg.append('text')
   .attr('transform', 'rotate(-90)')
   .attr('y', -50) // Adjust position of Y-axis label
   .attr('x', -height / 2)
   .attr('dy', '1em')
   .style('text-anchor', 'middle')
   .style('font-size', '12px')
   .attr("font-weight", "bold")
   .text('Electricity Production (1000 MWh)');


// Add bars (stacked)
svg.selectAll(".layer")
   .data(stackedData)
   .enter()
   .append("g")
   .attr("class", "layer")
   .attr("fill", d => colorScale(d.key))
   .selectAll("rect")
   .data(d => d)
   .enter()
   .append("rect")
   .attr("x", d => xScale(d.data.country))
   .attr("y", d => yScale(d[1]/1000))
   .attr("height", d => yScale(d[0]/1000) - yScale(d[1]/1000))
   .attr("width", xScale.bandwidth()) // Adjusted by reduced padding in xScale
   .on('mouseover', function(event, d) {
       tooltip.transition().duration(200).style('opacity', 1);
       tooltip.html(`Country: ${d.data.country}<br>Value: ${((d[1] - d[0]) / 1000).toFixed(2)}`) 
           .style('left', (event.pageX + 10) + 'px')
           .style('top', (event.pageY - 50) + 'px');
   })
   .on('mouseout', function() {
       tooltip.transition().duration(200).style('opacity', 0);
   });

// Add labels on top of each section of the bars (optional)
svg.selectAll(".layer")
   .selectAll(".label")
   .data(d => d)
   .enter()
   .append('text')
   .attr('x', d => xScale(d.data.country) + xScale.bandwidth() / 2)
   .attr('y', d => yScale(d[1]) - 5) // Adjust position slightly above each section
   //.text(d => `${(d[1] - d[0]).toLocaleString()}`) // Optional: Uncomment if you want labels on top of each section
   //.style('fill', '#000')
   //.style('font-size', '12px');

// Add legend for different electricity types
const legend = svg.append('g')
    .attr('transform', `translate(${width - 70}, 0)`);

const legendItems = ['solar', 'thermal', 'wind', 'nuclear'];

legendItems.forEach((item, i) => {
    const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
    
    // Colored square for each item in the legend
    legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(item));
    
    // Text for each item in the legend
    legendRow.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(item.charAt(0).toUpperCase() + item.slice(1))
        .style('font-size', '12px');
});