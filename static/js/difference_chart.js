// Set dimensions and margins
const width = 450;  // Increased width to give more room for labels
const height = 450;  // Keeping height as is
const margin = { top: 50, right: 90, bottom: 50, left: 70 };  // Increased right margin

// Create an SVG element
const svg = d3.select("#difference-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse differenceDataJson passed from Streamlit or loaded from CSV
const differenceData = JSON.parse(differenceDataJson);

// Filter data based on selected country
function filterDataByCountry(data, country) {
    return data.filter(d => d.Country === country);
}

// Function to draw the difference chart
function drawDifferenceChart(country) {
    const filteredData = filterDataByCountry(differenceData, country);

    // X scale (Year)
    const xScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d.Year))
        .range([0, width]);

    // Y scale (for Healthcare_diff and LifeExpectancy_diff)
    const yScale = d3.scaleLinear()
        .domain([
            d3.min(filteredData, d => Math.min(+d.Healthcare_diff, +d.LifeExpectancy_diff)),
            d3.max(filteredData, d => Math.max(+d.Healthcare_diff, +d.LifeExpectancy_diff))
        ])
        .range([height, 0]);

    // Line generator for healthcare expenditure difference
    const lineHealthcareDiff = d3.line()
        .x(d => xScale(+d.Year))
        .y(d => yScale(+d.Healthcare_diff))
        .defined(d => !isNaN(+d.Healthcare_diff));

    // Line generator for life expectancy difference
    const lineLifeExpectancyDiff = d3.line()
        .x(d => xScale(+d.Year))
        .y(d => yScale(+d.LifeExpectancy_diff))
        .defined(d => !isNaN(+d.LifeExpectancy_diff));

    // Area generator for shading between the lines
    const area = d3.area()
        .x(d => xScale(+d.Year))
        .y0(d => yScale(+d.Healthcare_diff))
        .y1(d => yScale(+d.LifeExpectancy_diff))
        .defined(d => !isNaN(+d.Healthcare_diff) && !isNaN(+d.LifeExpectancy_diff));

    // Clear previous elements before drawing new ones
    svg.selectAll("*").remove();

    // Add shaded area between the lines
    svg.append("path")
        .datum(filteredData)
        .attr("fill", "rgba(173, 216, 230, 0.5)") // Light blue with 50% opacity
        .attr("d", area);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('d')));

    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add healthcare expenditure difference line
    svg.append("path")
        .datum(filteredData.filter(d => !isNaN(+d.Healthcare_diff)))
        .attr("fill", "none")
        .attr("stroke", "#ff6666") // Red color for healthcare expenditure line
        .attr("stroke-width", 2)
        .attr("d", lineHealthcareDiff);

    // Add life expectancy difference line
    svg.append("path")
        .datum(filteredData.filter(d => !isNaN(+d.LifeExpectancy_diff)))
        .attr("fill", "none")
        .attr("stroke", "#66b2ff") // Blue color for life expectancy line
        .attr("stroke-width", 2)
        .attr("d", lineLifeExpectancyDiff);

    // Add a horizontal line at y=0 (zero baseline)
    svg.append("line")
        .attr("x1", 0)
        .attr("y1", yScale(0))
        .attr("x2", width)
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4");

    // Add labels for healthcare expenditure and life expectancy at the end of the lines
    const lastValidHealthcare = filteredData.filter(d => !isNaN(+d.Healthcare_diff)).slice(-1)[0];
    const lastValidLifeExpectancy = filteredData.filter(d => !isNaN(+d.LifeExpectancy_diff)).slice(-1)[0];

    if (lastValidHealthcare) {
        svg.append('text')
           .attr('x', width + 10)  // Adjusted position to fit within new width
           .attr('y', yScale(+lastValidHealthcare.Healthcare_diff))
           .text('Healthcare')
           .style('font-size','12px')
           .style('fill', '#ff6666');
    }

    if (lastValidLifeExpectancy) {
        svg.append('text')
           .attr('x', width + 10)  // Adjusted position to fit within new width
           .attr('y', yScale(+lastValidLifeExpectancy.LifeExpectancy_diff))
           .text('Life Expectancy')
           .style('font-size','12px')
           .style('fill', '#66b2ff');
    }

    // Add Y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left + 10)
       .attr("x", 0 - (height / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .style("font-size", "12px")
       .attr("font-weight", "bold")
       .text("Change");

    // Add X-axis label
    svg.append("text")
       .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
       .attr("text-anchor", "middle")
       .style("font-size", "12px")
       .attr("font-weight", "bold")
       .text("Year");
}