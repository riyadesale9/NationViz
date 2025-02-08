// Set dimensions and margins
const width = 500;
const height = 600;

// Create an SVG element
const svg = d3.select("#treemap")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(0,0)`);

// Define color scale using Tableau10 color scheme
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px");

// Function to draw treemap based on selected year
function drawTreemap() {
    // Add a dummy root node "World Trade" and merge it with tradeData entries
    const hierarchyData = [
        { 'Country or Area': 'World Trade', 'Flow': 'Root', 'Trade (USD)': 0 },
        ...tradeData.map(d => ({
            'Country or Area': d['Country or Area'],
            'Flow': d['Flow'],
            'Trade (USD)': d['Trade (USD)']
        }))
    ];

    // Define the stratification with "World Trade" as the root
    const root = d3.stratify()
        .id(d => d['Country or Area'] + '-' + d.Flow)
        .parentId(d => d['Country or Area'] === 'World Trade' ? null : 'World Trade-Root')
        (hierarchyData)
        .sum(d => +d['Trade (USD)'] || 0);

    // Create a treemap layout
    const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(1);

    // Apply layout to root hierarchy
    treemapLayout(root);

    // Clear previous elements before drawing new ones
    svg.selectAll("*").remove();

    // Draw rectangles for each node in the treemap
    svg.selectAll("rect")
        .data(root.leaves())
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data['Country or Area']))
        .on('mouseover', function(event, d) {
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip.html(`Country: ${d.data['Country or Area']}<br>Flow: ${d.data.Flow}<br>Value: $${d.value.toLocaleString()}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);
        })
        .on('mouseout', function() {
            tooltip.transition().duration(200).style('opacity', 0);
            d3.select(this).attr('stroke', null);
        });

    // Add labels to each rectangle
    svg.selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.Flow}`)
        .style("font-size", "12px")
        .style("fill", "#000");
}


drawTreemap()
// // Slider setup for selecting year and updating treemap
// function initializeSlider(minYear, maxYear, defaultYear) {
//    const slider = document.getElementById('year-slider');
//    slider.min = minYear;
//    slider.max = maxYear;
//    slider.value = defaultYear;

//    slider.addEventListener('input', function() {
//        const selectedYear = +this.value;
//        drawTreemap(selectedYear); // Update treemap when slider changes
//    });

//    drawTreemap(defaultYear); // Draw initial treemap for default year
// }